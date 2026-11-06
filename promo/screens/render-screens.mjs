// Renders store screenshots (1280x800) by running the REAL extension scripts against a mock chat page with invented data.
//
//   python3 promo/screens/build-data.py          # once: sample data
//   node promo/screens/render-screens.mjs <outDir>
//
// Needs Node 22+ and Google Chrome. Nothing here touches real chats.
import { spawn } from 'node:child_process';
import { mkdir, writeFile, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const outDir = resolve(process.argv[2] || 'promo/out/screenshots');
const chrome = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const base = pathToFileURL(resolve(new URL('./mock.html', import.meta.url).pathname)).href;
const port = 9300 + Math.floor(Math.random() * 500);
await mkdir(outDir, { recursive: true });

const proc = spawn(chrome, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${await mkdtemp(join(tmpdir(), 'shots-'))}`, '--hide-scrollbars', '--mute-audio', '--no-first-run', '--allow-file-access-from-files', '--autoplay-policy=no-user-gesture-required', 'about:blank'], { stdio: 'ignore' });
const quit = () => { try { proc.kill(); } catch {} };
process.on('exit', quit);
async function wsUrl() {
  for (let i = 0; i < 100; i++) {
    try { const tab = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t => t.type === 'page'); if (tab) return tab.webSocketDebuggerUrl; } catch {}
    await new Promise(r => setTimeout(r, 100));
  }
  throw new Error('Chrome did not start');
}
const socket = new WebSocket(await wsUrl());
await new Promise((res, rej) => { socket.onopen = res; socket.onerror = rej; });
let id = 0; const pending = new Map();
socket.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise((res, rej) => { const n = ++id; pending.set(n, m => m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result)); socket.send(JSON.stringify({ id: n, method, params })); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const run = async code => {
  const r = await send('Runtime.evaluate', { expression: code, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || JSON.stringify(r.exceptionDetails));
  return r.result.value;
};

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });

async function open(query = '') {
  await send('Page.navigate', { url: base + query });
  await sleep(1500);
  await run(`new Promise(r => { const t = Date.now(); (function w(){ if (document.querySelector('.wab-nav-button') || Date.now()-t > 5000) r(); else setTimeout(w, 100); })(); })`);
}
async function shot(name) {
  await sleep(700);
  const s = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  await writeFile(join(outDir, name), Buffer.from(s.data, 'base64'));
  console.log('wrote', name);
}
// Helpers evaluated inside the page.
const SHADOW = `(id => window.__shadows.get(id))`;
const clickIn = (hostId, selector, text) => run(`(() => {
  const root = window.__shadows.get('${hostId}');
  const nodes = [...root.querySelectorAll(${JSON.stringify(selector)})];
  const node = ${text ? `nodes.find(n => n.textContent.includes(${JSON.stringify(text)}))` : 'nodes[0]'};
  if (!node) throw new Error('not found: ${selector} ${text || ''}');
  node.click(); return true; })()`);
const menuHtml = `<ul>
  <li data-animate-dropdown-item="true"><div role="button" aria-label="Reply"><span>Reply</span></div></li>
  <li data-animate-dropdown-item="true"><div role="button" aria-label="Forward"><span>Forward</span></div></li>
  <li data-animate-dropdown-item="true"><div role="button" aria-label="Star"><span data-icon="star"><svg viewBox="0 0 24 24" width="18" height="18"><path d="m12 3 2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 16.8 6.6 19.8l1.1-6.1L3.2 9.4l6.1-.8Z"/></svg></span><span>Star</span></div></li>
  <li data-animate-dropdown-item="true"><div role="button" aria-label="Copy"><span>Copy</span></div></li>
  <li data-animate-dropdown-item="true"><div role="button" aria-label="Delete"><span>Delete</span></div></li></ul>`;
async function openMenu() {
  await run(`(() => {
    const t = document.getElementById('target'); t.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    const main = document.getElementById('main').getBoundingClientRect(), r = t.getBoundingClientRect();
    const menu = document.createElement('div'); menu.className = 'wa-menu'; menu.setAttribute('role', 'menu');
    menu.style.left = (r.right - main.left - 70) + 'px'; menu.style.top = (r.top - main.top + 34) + 'px';
    menu.innerHTML = ${JSON.stringify(menuHtml)};
    document.getElementById('main').append(menu); window.__menu = menu; })()`);
  await sleep(800);
}
async function openBookmarks() {
  await run(`document.querySelector('.wab-nav-button').click()`);
  await sleep(900);
}

// 1 — the Bookmark option in the message menu
await open(); await openMenu();
await shot('1-bookmark-from-the-menu.png');

// 2 — save dialog with a collection and a label
await run(`window.__menu.querySelector('.wab-menu-item').click()`);
await run(`window.__menu.remove()`); // WhatsApp closes its menu after a choice
await sleep(900);
await run(`(() => {
  const root = window.__shadows.get('whatsapp-bookmarks-extension');
  const set = (sel, value) => { const el = root.querySelector(sel); el.value = value; el.dispatchEvent(new Event('input', { bubbles: true })); };
  set('#wab-collection', 'Recipes'); set('#wab-note', "Grandma's lasagna");
  // Close the suggestion list (Escape closes it before the dialog) so it doesn't cover the Label field.
  root.querySelector('#wab-collection').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); })()`);
await shot('2-save-to-a-collection.png');

// 3 — bookmarks pane and the viewer with a clickable link
await open(); await openBookmarks();
await clickIn('wab-section-host', '.message-preview', 'Hotel booking');
await shot('3-browse-and-open.png');

// 4 — filter by type: Audio, voice note player in the viewer
await open(); await openBookmarks();
await clickIn('wab-section-host', '.types .chip', 'Audio');
await sleep(400);
await clickIn('wab-section-host', '.message-preview', 'Voice');
await shot('4-voice-notes.png');

// 5 — files: filter and open a PDF
await open(); await openBookmarks();
await clickIn('wab-section-host', '.types .chip', 'Files');
await sleep(400);
await clickIn('wab-section-host', '.message-preview', 'Q3-report');
await sleep(1200);
await shot('5-files-and-pdfs.png');

// 6 — dark theme with an image
await open('?theme=dark'); await openBookmarks();
await clickIn('wab-section-host', '.message-preview', 'Sunset');
await shot('6-dark-theme.png');

quit(); socket.close(); process.exit(0);
