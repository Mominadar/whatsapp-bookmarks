const database = new Promise((resolve, reject) => {
  const request = indexedDB.open('whatsapp-bookmarks', 1);
  request.onupgradeneeded = () => request.result.createObjectStore('bookmarks', { keyPath: 'id' });
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

async function storage(operation, value) {
  const db = await database;
  return new Promise((resolve, reject) => {
    const tx = db.transaction('bookmarks', operation === 'list' ? 'readonly' : 'readwrite');
    const store = tx.objectStore('bookmarks');
    const request = operation === 'list' ? store.getAll() : operation === 'save' ? store.put(value) : store.delete(value);
    tx.oncomplete = () => resolve(request.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error('Storage operation was interrupted.'));
  });
}

chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (!sender.tab || !sender.url?.startsWith('https://web.whatsapp.com/')) return;
  if (!['list', 'save', 'delete'].includes(message.action)) return;
  (async () => {
    if (message.action === 'save') {
      const item = message.item;
      if (!item || typeof item.id !== 'string' || typeof item.collection !== 'string' || !Array.isArray(item.media)) {
        throw new Error('Invalid bookmark.');
      }
      await storage('save', item);
      respond({ ok: true });
    } else if (message.action === 'delete') {
      await storage('delete', message.id);
      respond({ ok: true });
    } else {
      respond({ ok: true, items: await storage('list') });
    }
  })().catch(error => respond({ ok: false, error: error.message }));
  return true;
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => chrome.contextMenus.create({
    id: 'bookmark-message', title: 'Bookmark this WhatsApp message',
    contexts: ['all'], documentUrlPatterns: ['https://web.whatsapp.com/*']
  }));
});

async function send(tabId, action) {
  try { await chrome.tabs.sendMessage(tabId, { action }); }
  catch { /* The tab may still be loading, or need a refresh after installation. */ }
}
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'bookmark-message' && tab?.id) send(tab.id, 'capture-context');
});
chrome.action.onClicked.addListener(async tab => {
  if (tab.url?.startsWith('https://web.whatsapp.com/')) await send(tab.id, 'open');
  else await chrome.tabs.create({ url: 'https://web.whatsapp.com/' });
});
