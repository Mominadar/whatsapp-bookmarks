(() => {
  'use strict';
  const host = document.createElement('div');
  host.id = 'whatsapp-bookmarks-extension';
  document.documentElement.append(host);
  const root = host.attachShadow({ mode: 'closed' });
  const sectionHost = document.createElement('div');
  sectionHost.id = 'wab-section-host';
  const sectionRoot = sectionHost.attachShadow({ mode: 'closed' });
  root.innerHTML = `
    <style>
      :host { color-scheme:var(--wab-color-scheme, light); font:14px/1.5 -apple-system,"Segoe UI","Helvetica Neue",Helvetica,"Lucida Grande",Arial,"Noto Sans",Ubuntu,Cantarell,sans-serif; color:var(--wab-text); }
      * { box-sizing:border-box; font-family:-apple-system,"Segoe UI","Helvetica Neue",Helvetica,"Lucida Grande",Arial,"Noto Sans",Ubuntu,Cantarell,sans-serif; } button,input,textarea,summary,select { font:inherit; } button { cursor:pointer; }
      button:focus-visible,input:focus-visible { outline:3px solid #55caaa; outline-offset:2px; }
      .panel { width:100%; height:100%; min-height:0; background:var(--wab-surface); display:flex; flex-direction:column; }
      [hidden] { display:none !important; }
      header { padding:16px 16px 10px; background:var(--wab-surface); border-bottom:1px solid var(--wab-border); }
      h1 { font-size:24px; margin:0; letter-spacing:-.6px; } h2 { font-size:20px; margin:0 0 8px; }
      .row { display:flex; align-items:center; gap:10px; justify-content:space-between; }
      .heading { justify-content:flex-start; gap:12px; margin-bottom:12px; }
      .muted { color:var(--wab-muted); font-size:12px; } .sub { margin:4px 0 16px; }
      .icon { border:0; background:transparent; color:var(--wab-muted); padding:7px 10px; border-radius:8px; }
      input { width:100%; padding:11px 12px; border:0; border-radius:8px; background:var(--wab-field); color:var(--wab-text); }
      .panel { min-width:0; overflow:hidden; } header, .collections, .types, .items { min-width:0; }
      .filter-label { padding:10px 16px 4px; font-size:10.5px; font-weight:600; letter-spacing:.06em; text-transform:uppercase; color:var(--wab-muted); }
      .collections, .types { display:flex; flex-wrap:wrap; gap:5px; padding:0 16px 8px; flex-shrink:0; }
      .collections { max-height:84px; overflow-y:auto; }
      .chip { max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; border:0; border-radius:14px; background:var(--wab-hover); padding:3px 10px; font-size:12px; line-height:18px; color:var(--wab-muted); }
      .chip.active { background:var(--wab-selected); color:var(--wab-accent); }
      .items { overflow:auto; padding:8px 16px 24px; flex:1; background:var(--wab-list); }
      article { padding:14px 0 12px; border-bottom:1px solid var(--wab-border); }
      .message-preview { display:block; width:100%; border:0; padding:0; background:transparent; color:inherit; text-align:start; cursor:pointer; }
      .entry-heading { display:flex; align-items:center; gap:8px; padding:0 2px 10px; font-size:12px; color:var(--wab-muted); }
      .chat-name { color:var(--wab-text); font-weight:500; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .message-date { margin-inline-start:auto; white-space:nowrap; font-size:11px; }
      .open-arrow { font-size:20px; line-height:16px; }
      .message-bubble { display:block; position:relative; padding:9px 12px 6px; margin-inline-end:14px; background:var(--wab-bubble); border-radius:0 8px 8px; box-shadow:0 1px 1px #0002; }
      .message-preview:hover .message-bubble { box-shadow:0 0 0 1px var(--wab-border),0 1px 2px #0002; }
      .message-preview[aria-pressed="true"] .message-bubble { box-shadow:0 0 0 1px var(--wab-accent); }
      .bubble-sender { display:block; color:var(--wab-accent); font-size:12px; font-weight:600; margin-bottom:4px; }
      .items .bubble-body { display:flex; flex-direction:column; justify-content:center; min-height:54px; max-height:54px; overflow:hidden; }
      .items .text { display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; margin:0; line-height:1.4; }
      .items img { height:54px; max-height:54px; width:auto; max-width:100%; object-fit:cover; margin:0; }
      .item-note { display:block; margin:0 2px 6px; color:var(--wab-accent); font-size:12px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .media-chip { display:flex; align-items:center; gap:8px; color:var(--wab-text); font-size:13px; } .media-chip .glyph { font-size:20px; }
      .text { display:block; white-space:pre-wrap; overflow-wrap:anywhere; margin:0 0 4px; }
      .bubble-meta { display:flex; justify-content:flex-end; align-items:center; gap:5px; font-size:11px; color:var(--wab-muted); min-height:17px; }
      .bubble-meta svg { width:12px; height:12px; }
      .badge { color:var(--wab-muted); font-size:11px; }
      img { display:block; max-width:100%; max-height:260px; border-radius:6px; object-fit:contain; margin:4px 0; }
      audio { display:block; width:calc(100% - 14px); margin:6px 0; padding:5px; background:var(--wab-bubble); border-radius:8px; }
      video { display:block; max-width:100%; max-height:65vh; border-radius:6px; background:#000; }
      .entry-tools { display:flex; align-items:center; justify-content:space-between; padding:5px 16px 0 2px; }
      .entry-menu { position:relative; } .entry-menu summary { list-style:none; cursor:pointer; color:var(--wab-muted); padding:2px 8px; border-radius:50%; }
      .entry-menu summary::-webkit-details-marker { display:none; }
      .entry-actions { position:absolute; inset-inline-end:0; top:100%; z-index:2; padding:4px 0; min-width:160px; border-radius:4px; background:var(--wab-surface); box-shadow:0 2px 10px #0004; }
      .entry-actions button { display:block; width:100%; border:0; padding:10px 16px; background:transparent; color:var(--wab-text); text-align:start; white-space:nowrap; }
      .entry-actions button:hover { background:var(--wab-hover); }
      .actions { display:flex; justify-content:flex-end; align-items:center; gap:6px; margin-top:16px; }
      .actions button { border:0; background:var(--wab-hover); color:var(--wab-muted); border-radius:6px; padding:6px 9px; }
      .empty { text-align:center; padding:50px 15px; color:var(--wab-muted); } footer { padding:12px 20px; border-top:1px solid var(--wab-border); font-size:11px; color:var(--wab-muted); }
      .overlay { position:fixed; inset:0; z-index:2147483647; display:grid; place-items:center; background:var(--wab-scrim); padding:20px; }
      .dialog { background:var(--wab-surface); border-radius:16px; width:min(420px,100%); max-height:calc(100vh - 40px); overflow-y:auto; padding:24px; box-shadow:0 15px 80px #0003; }
      .capture-tools { display:flex; gap:8px; flex-wrap:wrap; margin:10px 0; } .capture-tools button { padding:8px 12px; border:1px solid var(--wab-border); border-radius:8px; background:var(--wab-field); color:var(--wab-text); }
      .debug-report { display:block; width:100%; height:180px; margin-top:10px; padding:10px; border:1px solid var(--wab-border); border-radius:6px; background:var(--wab-field); color:var(--wab-text); font:12px/1.4 monospace; }
      label { display:block; font-weight:600; margin:18px 0 6px; } .primary { background:var(--wab-primary-button)!important; color:white!important; }
      .dialog .actions button { font-size:14px; padding:10px 15px; } .preview { max-height:130px; overflow:auto; margin-top:15px; padding:12px; background:var(--wab-field); border-radius:8px; white-space:pre-wrap; overflow-wrap:anywhere; }
      .collection-picker { position:relative; margin-bottom:8px; }
      .collection-field { display:flex; align-items:center; background:var(--wab-field); border-radius:8px; }
      .collection-field input { padding-inline-end:4px; background:transparent; }
      .collection-toggle { border:0; background:transparent; color:var(--wab-muted); padding:10px 14px; font-size:18px; }
      .collection-options { position:absolute; top:calc(100% + 4px); left:0; right:0; z-index:3; max-height:180px; overflow:auto; border:1px solid var(--wab-border); border-radius:8px; background:var(--wab-surface); box-shadow:0 4px 16px #0003; padding:4px; }
      .collection-option { display:block; width:100%; padding:9px 10px; border:0; border-radius:5px; background:transparent; color:var(--wab-text); text-align:start; }
      .collection-option:hover, .collection-option[aria-selected="true"] { background:var(--wab-hover); }
      .collection-hint { margin:6px 0 0; font-size:12px; color:var(--wab-muted); }
      .toast { position:fixed; bottom:24px; left:50%; transform:translateX(-50%); background:var(--wab-toast); color:var(--wab-text); padding:12px 20px; border-radius:10px; z-index:2147483647; max-width:90vw; }
      /* ---- Bookmark dialog ---- */
      .dialog { border-radius:12px; width:min(440px,100%); padding:0; display:flex; flex-direction:column; box-shadow:0 12px 48px #0004, 0 0 0 1px var(--wab-border); }
      .dialog > * { margin-left:24px; margin-right:24px; }
      .dialog h2 { margin:24px 24px 4px; font-size:19px; font-weight:500; letter-spacing:0; }
      .dialog > h2 + .muted { margin-bottom:4px; line-height:1.4; }
      .dialog .preview { margin-top:16px; padding:10px 12px; border-radius:0 8px 8px 0; border-left:4px solid var(--wab-accent); background:var(--wab-field); max-height:110px; line-height:1.4; font-size:13.5px; }
      .dialog .capture-status { margin-top:8px; } .dialog .capture-status:empty { display:none; }
      .dialog label { margin:20px 24px 6px; font-size:12px; font-weight:500; letter-spacing:.02em; color:var(--wab-muted); }
      .dialog label .muted { font-weight:400; }
      .dialog input { padding:10px 12px; border:1px solid var(--wab-border); border-radius:8px; background:var(--wab-field); transition:border-color .15s, box-shadow .15s; }
      .dialog > input { width:calc(100% - 48px); }
      .dialog input:hover { border-color:var(--wab-muted); }
      .dialog input:focus, .dialog .collection-field:focus-within { outline:0; border-color:var(--wab-accent); box-shadow:0 0 0 1px var(--wab-accent); }
      .dialog .collection-field { border:1px solid var(--wab-border); border-radius:8px; background:var(--wab-field); transition:border-color .15s, box-shadow .15s; }
      .dialog .collection-field:hover { border-color:var(--wab-muted); }
      .dialog .collection-field input, .dialog .collection-field input:hover, .dialog .collection-field input:focus { border:0; box-shadow:none; background:transparent; }
      .dialog .collection-picker { margin-bottom:0; }
      .dialog .collection-hint { margin:6px 24px 0; }
      .dialog .actions { margin:24px 0 0; padding:14px 24px; gap:8px; border-top:1px solid var(--wab-border); }
      .dialog .actions button { border-radius:20px; padding:9px 22px; font-size:14px; font-weight:500; background:transparent; color:var(--wab-accent); transition:background .15s, opacity .15s; }
      .dialog .actions button:hover { background:var(--wab-hover); }
      .dialog .actions .primary { padding:9px 24px; } .dialog .actions .primary:hover { background:var(--wab-primary-button)!important; opacity:.9; }
      .dialog .actions button:disabled { opacity:.5; cursor:default; }
      .dialog button:focus-visible, .dialog input:focus-visible { outline:2px solid var(--wab-accent); outline-offset:2px; } .dialog input:focus-visible { outline:0; }
      .dialog .collection-toggle { display:grid; place-items:center; width:36px; height:36px; margin-inline-end:2px; padding:0; border-radius:50%; transition:background .15s; }
      .dialog .collection-toggle:hover { background:var(--wab-hover); }
      .dialog .collection-toggle svg { transition:transform .2s; } .dialog .collection-toggle[aria-expanded="true"] svg { transform:rotate(180deg); }
      .dialog .collection-options { top:calc(100% + 6px); max-height:208px; padding:6px; border:1px solid var(--wab-border); border-radius:10px; background:var(--wab-surface); box-shadow:0 8px 28px #0003; }
      .dialog .collection-option { display:flex; align-items:center; gap:10px; padding:9px 10px; border-radius:6px; font-size:14px; line-height:1.3; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .dialog .collection-option::before { content:""; flex:none; width:16px; height:16px; background:var(--wab-muted); -webkit-mask:var(--folder) center/contain no-repeat; mask:var(--folder) center/contain no-repeat; --folder:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M3 6.5A1.5 1.5 0 0 1 4.5 5h4.2l2 2.5h8.8A1.5 1.5 0 0 1 21 9v9.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z'/></svg>"); }
      .dialog .collection-option.create { color:var(--wab-accent); font-weight:500; }
      .dialog .collection-option.create::before { background:var(--wab-accent); --folder:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7z'/></svg>"); }
      .dialog .collection-option.current { font-weight:600; } .dialog .collection-option.current::before { background:var(--wab-accent); }
      .dialog .collection-option[data-count]::after { content:attr(data-count); margin-inline-start:auto; padding:1px 8px; border-radius:10px; background:var(--wab-hover); color:var(--wab-muted); font-size:11.5px; font-weight:500; }
      .dialog .collection-empty { padding:12px 10px; font-size:13px; color:var(--wab-muted); text-align:center; }
      /* ---- Polish ---- */
      header { box-shadow:0 1px 0 var(--wab-border); }
      h1 { font-size:22px; font-weight:700; letter-spacing:-.4px; }
      .total-count { margin-inline-start:auto; padding:2px 10px; border-radius:12px; background:var(--wab-selected); color:var(--wab-accent); font-size:12px; font-weight:600; }
      .total-count:empty { display:none; }
      .search { padding-inline-start:36px; background:var(--wab-field) url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23889' stroke-width='2.2' stroke-linecap='round'><circle cx='11' cy='11' r='7'/><path d='m20 20-3.5-3.5'/></svg>") no-repeat 12px center; border-radius:10px; }
      .chip { transition:background .15s,color .15s; } .chip:hover { filter:brightness(.97); }
      .chip.active { background:var(--wab-accent); color:var(--wab-on-accent,#fff); font-weight:600; }
      .items { padding:12px 14px 20px; scrollbar-width:thin; }
      article { margin:0 0 10px; padding:12px 12px 8px; border:1px solid var(--wab-border); border-radius:14px; background:var(--wab-surface); box-shadow:0 1px 2px #0000000d; transition:box-shadow .15s,border-color .15s; }
      article:hover { border-color:var(--wab-accent); box-shadow:0 4px 14px #00000014; }
      .entry-heading { gap:10px; padding:0 0 8px; }
      .chat-avatar { flex:none; width:32px; height:32px; border-radius:50%; display:grid; place-items:center; background:var(--wab-selected); color:var(--wab-accent); font-weight:700; font-size:14px; }
      .heading-text { min-width:0; flex:1; display:flex; flex-direction:column; line-height:1.25; }
      .chat-name { font-size:14px; font-weight:600; } .message-date { margin:0; font-size:11px; color:var(--wab-muted); }
      .open-arrow { color:var(--wab-muted); }
      .message-bubble { margin-inline-end:0; box-shadow:none; background:var(--wab-list); border-radius:10px; padding:8px 10px 4px; }
      .message-preview:hover .message-bubble { box-shadow:none; } .message-preview[aria-pressed="true"] .message-bubble { box-shadow:0 0 0 2px var(--wab-accent); }
      .item-note { margin:0 0 6px; padding:2px 8px; width:fit-content; max-width:100%; border-radius:6px; background:var(--wab-selected); }
      .entry-tools { padding:8px 2px 0; gap:8px; justify-content:flex-start; }
      .badge { padding:2px 9px; border-radius:10px; background:var(--wab-hover); color:var(--wab-muted); font-size:11px; max-width:55%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .type-pill { padding:2px 9px; border-radius:10px; background:var(--wab-selected); color:var(--wab-accent); font-size:11px; font-weight:600; }
      .entry-menu { margin-inline-start:auto; } .entry-menu summary { width:28px; height:28px; display:grid; place-items:center; font-size:16px; } .entry-menu summary:hover { background:var(--wab-hover); }
      .entry-actions { border-radius:10px; border:1px solid var(--wab-border); box-shadow:0 8px 24px #0003; }
      .empty { padding:56px 24px; line-height:1.6; white-space:pre-line; } .empty .empty-icon { display:block; margin:0 auto 14px; width:56px; height:56px; border-radius:50%; background:var(--wab-selected); color:var(--wab-accent); display:grid; place-items:center; font-size:26px; }
      .empty strong { display:block; color:var(--wab-text); font-size:16px; margin-bottom:4px; }
      footer { text-align:center; }
    </style>
    <section class="panel" aria-label="Bookmarks" hidden>
      <header><div class="row heading"><button class="icon close" aria-label="Back to chats">←</button><h1>Bookmarks</h1><span class="total-count" aria-live="polite"></span></div>
      <input class="search" type="search" placeholder="Filter collections" aria-label="Filter collections by name"></header>
      <div class="filter-label">Collections</div><nav class="collections" aria-label="Collections"></nav><div class="filter-label">Type</div><nav class="types" aria-label="Content type"></nav><div class="items"></div>
      <footer>Saved on this device · Choose Bookmark from a message’s menu.</footer>
    </section>
    <div class="overlay" hidden><form class="dialog" role="dialog" aria-modal="true" aria-labelledby="wab-title">
      <h2 id="wab-title">Bookmark message</h2><div class="muted">Keep it close. Add a collection, or leave it unnamed.</div>
      <div class="preview"></div><div class="capture-status muted" role="status" aria-live="polite"></div><div class="capture-tools" hidden><button type="button" class="save-without-file" hidden>Save without the file</button><button type="button" class="load-native-media">Load from WhatsApp</button><button type="button" class="copy-debug" hidden>Copy debug info</button></div><textarea class="debug-report" aria-label="Bookmark debug info" readonly hidden></textarea><label for="wab-collection">Collection</label>
      <div class="collection-picker"><div class="collection-field"><input id="wab-collection" maxlength="80" placeholder="Unnamed" autocomplete="off" role="combobox" aria-autocomplete="list" aria-controls="wab-collection-options" aria-expanded="false"><button type="button" class="collection-toggle" aria-label="Show existing collections" aria-controls="wab-collection-options" aria-expanded="false"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>
      <div id="wab-collection-options" class="collection-options" role="listbox" aria-label="Collections" hidden></div></div>
      <p class="collection-hint">Choose an existing collection or type a new name.</p>
      <label for="wab-note">Label <span class="muted">(optional)</span></label><input id="wab-note" maxlength="120" placeholder="A name or short description" autocomplete="off">
      <div class="actions"><button type="button" class="cancel">Cancel</button><button class="primary save" type="submit">Save bookmark</button></div>
    </form></div><div class="toast" role="status" hidden></div>`;

  sectionRoot.append(root.querySelector('style').cloneNode(true), root.querySelector('.panel'));
  const $ = selector => root.querySelector(selector) || sectionRoot.querySelector(selector);
  let items = [], filter = null, pending = null, contextMessage = null, toastTimer, returnFocus;
  let menuMessage = null;
  let hoveredMessage = null;
  let menuInteractionAt = 0;
  let contentRegion = null;
  const hiddenContent = new Map();
  const messageSelector = '.message-in, .message-out, [data-id^="true_"], [data-id^="false_"]';
  const menuSelector = '[role="menu"], [data-animate-dropdown-popup], [data-testid*="context-menu"], [data-testid*="dropdown"]';
  const menuTargets = new WeakMap();
  const listAudioURLs = new Set(), viewerAudioURLs = new Set();
  const capturedAudio = new WeakMap();
  let nativeAudioInteraction = null;
  let mediaLoadContext = null, pendingSource = null, pendingMoveOnly = false, capturePhase = 'idle', captureError = '';
  const messageContexts = new WeakMap();
  let typeFilter = 'all', bridgeWatching = false;
  const CAPTURED_KINDS = ['audio','video','document'];
  const mediaWord = kind => kind==='video'?'video':kind==='document'?'document':'voice note';
  const CONTENT_TYPES = [['all','All types'],['text','Text'],['audio','Audio'],['video','Video'],['document','Files'],['link','Links'],['contact','Contacts'],['image','Images']];
  const LINK_PATTERN = /(?:https?:\/\/|www\.)\S+/i;
  function itemTypes(item) {
    const types = new Set((item.media || []).map(media => media.kind));
    if (item.mediaKind) types.add(item.mediaKind);
    if (item.contacts?.length) types.add('contact');
    if (item.text) { types.add('text'); if (LINK_PATTERN.test(item.text)) types.add('link'); }
    return types;
  }
  let sourceDebug = null, bridgeDebug = 'not-requested', captureTrace = [];
  const trace = note => { if (captureTrace.length < 40) captureTrace.push(`${Date.now()%100000}ms ${note}`); };
  async function request(action, data = {}) {
    const result = await chrome.runtime.sendMessage({ action, ...data });
    if (!result?.ok) throw new Error(result?.error || 'Could not access bookmarks.');
    return result;
  }
  function toast(text) {
    $('.toast').textContent = text; $('.toast').hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => $('.toast').hidden = true, 4000);
  }
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function bookmarkGlyph(width = 18, height = width) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('width', String(width)); svg.setAttribute('height', String(height));
    svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', 'currentColor'); svg.setAttribute('stroke-width', '1.7');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4Z');
    path.setAttribute('stroke-linejoin', 'round'); svg.append(path);
    return svg;
  }
  function uiIcon(path, size = 24) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('width', String(size)); svg.setAttribute('height', String(size)); svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', 'currentColor'); svg.setAttribute('stroke-width', '2'); svg.setAttribute('stroke-linecap', 'round'); svg.setAttribute('stroke-linejoin', 'round');
    const node = document.createElementNS('http://www.w3.org/2000/svg', 'path'); node.setAttribute('d', path); svg.append(node);
    return svg;
  }
  const ICON_BACK = 'M19 12H5M11 6l-6 6 6 6', ICON_CLOSE = 'M6 6l12 12M18 6 6 18';
  function messagePresentation(item) {
    const match = /^\[([^\]]+)\]\s*(.*?):\s*$/.exec(item.meta || '');
    const parts = match?.[1].split(',') || [];
    return {
      sender:item.messageId?.startsWith('true_') ? 'You' : match?.[2] || '',
      time:parts[0]?.trim() || new Date(item.savedAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}),
      date:parts.slice(1).join(',').trim() || new Date(item.savedAt).toLocaleDateString()
    };
  }
  function releaseAudio(rootNode, urls) {
    for (const audio of rootNode.querySelectorAll('audio, video')) {
      if (typeof audio.pause === 'function') audio.pause();
      audio.removeAttribute('src');
      if (typeof audio.load === 'function') audio.load();
    }
    for (const url of urls) URL.revokeObjectURL(url);
    urls.clear();
  }
  function savedAudioPlayer(media, urls) {
    const blob=globalThis.WABMedia.mediaBlob(media.data,media.kind);
    const source=URL.createObjectURL(blob);urls.add(source);
    const audio=el(media.kind==='video'?'video':'audio');audio.src=source;audio.controls=true;audio.preload='metadata';audio.setAttribute('aria-label',media.kind==='video'?'Play saved video':'Play saved audio');
    return audio;
  }
  async function reload() {
    items = (await request('list')).items.map(item=>{
      // Earlier versions accidentally treated a voice-note avatar as its media.
      // Retain the stored record; hide that invalid preview when it carries the
      // old explicit audio-unavailable marker.
      const kind=item.mediaKind || (/^Audio is not available to copy|^The audio file has not been copied/i.test(item.mediaNote || '')?'audio':'');
      return kind?{...item,mediaKind:kind,media:(item.media || []).filter(media=>media.kind===kind)}:item;
    });
    render();
  }
  async function open() {
    syncTheme();
    if (!mountSection()) { toast('Open Chats in WhatsApp, then try Bookmarks again.'); return; }
    $('.panel').hidden = false;
    sectionHost.hidden = false;
    document.querySelector('.wab-nav-button')?.setAttribute('aria-pressed', 'true');
    try { await reload(); $('.search').focus(); } catch (error) { toast(error.message); }
  }
  function findContentRegion() {
    if (contentRegion?.isConnected) return contentRegion;
    let region = document.querySelector('#side');
    if (!region) return null;
    // Include the list header where it is a sibling of #side, stopping before
    // the application layout containing the navigation rail and conversation.
    while (region.parentElement && region.parentElement !== document.body) {
      const parent = region.parentElement;
      if (parent.id === 'app' || parent.querySelector('#main, .wab-nav-button')) break;
      const current = region.getBoundingClientRect(), next = parent.getBoundingClientRect();
      if (!current.width || next.width > current.width + 8) break;
      region = parent;
    }
    return region;
  }
  function concealNativeContent() {
    if (!contentRegion) return;
    for (const child of contentRegion.children) {
      if (child === sectionHost || hiddenContent.has(child)) continue;
      hiddenContent.set(child, { inert:child.inert, ariaHidden:child.getAttribute('aria-hidden') });
      child.inert = true;
      child.setAttribute('aria-hidden', 'true');
    }
  }
  function mountSection() {
    const region = findContentRegion();
    if (!region) return false;
    contentRegion = region;
    contentRegion.classList.add('wab-content-open');
    if (sectionHost.parentElement !== region) region.append(sectionHost);
    concealNativeContent();
    return true;
  }
  function closeSection(focus = false) {
    $('.panel').hidden = true;
    sectionHost.hidden = true;
    contentRegion?.classList.remove('wab-content-open');
    for (const [child, previous] of hiddenContent) {
      child.inert = previous.inert;
      if (previous.ariaHidden === null) child.removeAttribute('aria-hidden');
      else child.setAttribute('aria-hidden', previous.ariaHidden);
    }
    hiddenContent.clear();
    const button = document.querySelector('.wab-nav-button');
    button?.setAttribute('aria-pressed', 'false');
    if (focus) button?.focus();
  }
  function render() {
    const nav = $('.collections'); nav.replaceChildren();
    const query = $('.search').value.trim().toLocaleLowerCase();
    const matchesType = item => typeFilter === 'all' || itemTypes(item).has(typeFilter);
    const allNames = [...new Set(items.map(item => item.collection))].sort((a,b) => a.localeCompare(b));
    const names = allNames.filter(name => name.toLocaleLowerCase().includes(query) && (name === filter || items.some(item => item.collection === name && matchesType(item))));
    if (filter !== null && !allNames.includes(filter)) filter = null;
    for (const name of [null, ...names]) {
      const count = items.filter(item => (name === null ? names.includes(item.collection) : item.collection === name) && matchesType(item)).length;
      const button = el('button', 'chip' + (filter === name ? ' active' : ''), `${name ?? 'All'} · ${count}`);
      button.setAttribute('aria-pressed', String(filter === name));
      button.onclick = () => { filter = name; render(); }; nav.append(button);
    }
    const typeNav = $('.types'); typeNav.replaceChildren();
    for (const [type, label] of CONTENT_TYPES) {
      const button = el('button', 'chip' + (typeFilter === type ? ' active' : ''), label);
      button.setAttribute('aria-pressed', String(typeFilter === type));
      button.onclick = () => { typeFilter = type; render(); }; typeNav.append(button);
    }
    const list = $('.items'); releaseAudio(sectionRoot,listAudioURLs); list.replaceChildren();
    const visible = items.filter(item => (filter === null || item.collection === filter) &&
      item.collection.toLocaleLowerCase().includes(query) && matchesType(item))
      .sort((a,b) => b.savedAt - a.savedAt);
    $('.total-count').textContent = items.length ? String(items.length) : '';
    if (!visible.length) {
      const empty = el('div', 'empty'), icon = el('span', 'empty-icon'); icon.append(bookmarkGlyph(26));
      empty.append(icon, el('strong', '', items.length ? 'No matching bookmarks' : 'Nothing saved yet'), document.createTextNode(items.length ? 'Try another collection, type or filter.' : 'Open a message’s menu and choose Bookmark to save your first one.'));
      list.append(empty);
    }
    for (const item of visible) {
      const card = el('article');
      const preview = el('button', 'message-preview');
      preview.type = 'button';
      preview.dataset.bookmarkId = item.id;
      preview.setAttribute('aria-pressed', String(viewedItem?.id === item.id));
      preview.setAttribute('aria-label', `View saved message from ${item.chat || 'WhatsApp'}`);
      const presentation = messagePresentation(item);
      const heading = el('span', 'entry-heading');
      const chatTitle = item.chat || presentation.sender || 'WhatsApp message';
      const headingText = el('span', 'heading-text'); headingText.append(el('span', 'chat-name', chatTitle), el('span', 'message-date', presentation.date));
      const chatAvatar = el('span', 'chat-avatar', Array.from(chatTitle)[0]?.toLocaleUpperCase() || '#'); chatAvatar.setAttribute('aria-hidden', 'true');
      heading.append(chatAvatar, headingText, el('span', 'open-arrow', '›'));
      const bubble = el('span', 'message-bubble');
      // A 1:1 chat repeats the sender's name in the heading, so only show it when it adds information (groups, "You").
      if (presentation.sender && presentation.sender !== chatTitle) bubble.append(el('span', 'bubble-sender', presentation.sender));
      if (item.note) preview.append(heading, el('span', 'item-note', item.note), bubble); else preview.append(heading, bubble);
      // Every list entry has the same compact shape; the full message, player or image opens in the right-hand pane.
      const body = el('span', 'bubble-body');
      if (item.text) body.append(el('span', 'text', item.text));
      const kinds = new Set((item.media || []).map(media => media.kind)); if (item.mediaKind) kinds.add(item.mediaKind);
      const image = (item.media || []).find(media => media.kind === 'image' && /^data:image\//.test(media.data || ''));
      if (image && !item.text) { const node = el('img'); node.src = image.data; node.alt = 'Bookmarked image'; body.append(node); }
      else if (item.contacts?.length) {
        const chip = el('span', 'media-chip'); chip.append(el('span', 'glyph', '👤'), el('span', '', item.contacts.map(contact => contact.name).join(', ')));
        body.append(chip);
      }
      else if (!item.text || kinds.has('audio') || kinds.has('video') || kinds.has('document')) {
        const docName = (item.media || []).find(media => media.kind === 'document')?.name;
        const label = kinds.has('document') ? ['📄', docName || 'Document'] : kinds.has('video') ? ['🎬','Video'] : kinds.has('audio') ? ['🎤','Voice message'] : kinds.has('image') ? ['🖼','Image'] : ['','Message'];
        const chip = el('span', 'media-chip'); if (label[0]) chip.append(el('span', 'glyph', label[0])); chip.append(el('span', '', label[1]));
        if (item.text) { chip.classList.add('muted'); }
        body.append(chip);
      }
      bubble.append(body);
      const timestamp = el('span', 'bubble-meta'); timestamp.append(bookmarkGlyph(12), el('span', '', presentation.time)); bubble.append(timestamp);
      preview.onclick = () => openSavedMessage(item);
      card.append(preview);
      if (item.mediaNote) card.append(el('p', 'muted', item.mediaNote));
      const tools = el('div', 'entry-tools');
      const typeLabels = {document:'File', video:'Video', audio:'Voice', image:'Image', link:'Link', contact:'Contact', text:'Text'};
      const itemKinds = itemTypes(item), primary = ['document','video','audio','image','contact','link','text'].find(type => itemKinds.has(type));
      tools.append(el('span', 'badge', item.collection)); if (primary) tools.append(el('span', 'type-pill', typeLabels[primary]));
      const menu = el('details', 'entry-menu');
      const summary = el('summary', '', '⌄'); summary.setAttribute('aria-label', 'Bookmark actions');
      const actions = el('div', 'entry-actions');
      const move = el('button', '', 'Move collection'); move.type = 'button'; move.onclick = () => { menu.open = false; showDialog({ ...item }, true); };
      const remove = el('button', '', 'Remove bookmark'); remove.type = 'button'; remove.onclick = async () => {
        try { await request('delete', { id: item.id }); if (viewedItem?.id === item.id) closeSavedViewer(); await reload(); } catch (error) { toast(error.message); }
      };
      actions.append(move, remove); menu.append(summary, actions); tools.append(menu); card.append(tools); list.append(card);
    }
  }
  const { messageIdentity } = globalThis.WABNavigation;
  function currentChatName() {
    const header = document.querySelector('#main header, #main [role="banner"], [data-testid="conversation-header"], [data-testid="conversation-info-header"]');
    const named = header?.querySelector('[data-testid="conversation-info-header-chat-title"], [data-testid="conversation-header-title"]');
    if (named?.textContent.trim()) return named.textContent.trim();
    const title = header?.querySelector('span[title]');
    if (title?.getAttribute('title')) return title.getAttribute('title');
    // Current WhatsApp headers can render the chat title without a title attribute.
    for (const node of header?.querySelectorAll('[dir="auto"], [role="heading"], h1, h2') || []) {
      if (!node.closest('button, [aria-hidden="true"]') && node.textContent.trim()) return node.textContent.trim();
    }
    const selected = document.querySelector('#side [aria-selected="true"], #pane-side [aria-selected="true"], #side [data-selected="true"]');
    return selected?.querySelector('[title]')?.getAttribute('title') || '';
  }
  function messageReference(message) {
    const idNode = message?.closest('[data-id]') || message?.querySelector('[data-id]');
    const messageId = idNode?.getAttribute('data-id') || '';
    return { messageId, chat:currentChatName(), chatId:messageIdentity(messageId).chatId || currentChatId() };
  }
  function currentChatId() {
    for (const node of document.querySelectorAll('#main [data-id]')) {
      const id = messageIdentity(node.dataset.id).chatId;
      if (id) return id;
    }
    return '';
  }
  const viewerHost = document.createElement('div');
  viewerHost.id = 'wab-viewer-host'; viewerHost.hidden = true;
  const viewerRoot = viewerHost.attachShadow({mode:'closed'});
  viewerRoot.append(root.querySelector('style').cloneNode(true));
  const viewerStyle = el('style');
  viewerStyle.textContent = `
    :host { color-scheme:var(--wab-color-scheme); pointer-events:auto; font:14px/1.5 -apple-system,"Segoe UI","Helvetica Neue",Helvetica,"Lucida Grande",Arial,"Noto Sans",Ubuntu,Cantarell,sans-serif; }
    * { font-family:-apple-system,"Segoe UI","Helvetica Neue",Helvetica,"Lucida Grande",Arial,"Noto Sans",Ubuntu,Cantarell,sans-serif; }
    button,input,textarea,summary,select { font:inherit; }
    .viewer, .viewer * { pointer-events:auto; }
    .viewer { position:absolute; inset:0; height:100%; min-width:0; min-height:0; overflow:hidden; display:flex; flex-direction:column; background:var(--wab-list); }
    .viewer-header { flex-shrink:0; display:flex; align-items:center; gap:14px; padding:12px 20px; background:var(--wab-surface); border-bottom:1px solid var(--wab-border); }
    .viewer-title { flex:1; min-width:0; } .viewer-title strong { display:block; font-size:16px; } .viewer-title .viewer-sub { display:flex; align-items:center; gap:5px; } .viewer-title span { display:block; font-size:12px; color:var(--wab-muted); }
    .viewer-avatar { width:40px; height:40px; border-radius:50%; background:var(--wab-field); display:grid; place-items:center; color:var(--wab-muted); font-size:20px; flex-shrink:0; }
    .viewer-body { flex:1 1 0%; min-height:0; min-width:0; overflow-y:auto; overflow-x:hidden; overscroll-behavior:contain; touch-action:pan-y; scrollbar-gutter:stable; padding:24px 6%; }
    .conversation-thread { max-width:1100px; margin:0 auto; }
    .day-divider { width:max-content; margin:0 auto 24px; padding:5px 12px; border-radius:7px; color:var(--wab-muted); background:var(--wab-bubble); font-size:12px; box-shadow:0 1px 1px #0002; }
    .saved-message { width:fit-content; max-width:75%; min-width:160px; margin:0; }
    .saved-message.outgoing { margin-inline-start:auto; }
    .saved-message .message-bubble { border-radius:0 8px 8px; margin:0; padding:10px 12px 6px; }
    .saved-message.outgoing .message-bubble { background:var(--wab-outgoing); border-radius:8px 0 8px 8px; }
    .saved-image-button { display:block; border:0; background:transparent; padding:0; width:100%; cursor:zoom-in; }
    .saved-image-button img { max-height:65vh; margin:8px auto; }
    .viewer-body, .viewer-body .text, .viewer-body .bubble-sender, .viewer-body .viewer-notice { user-select:text; -webkit-user-select:text; cursor:auto; } .viewer-body .text { cursor:text; }
    .note-row { margin:14px 0 0; max-width:640px; } .note-row label { margin:0 0 4px; font-size:12px; font-weight:600; color:var(--wab-muted); }
    .note-row input { border:1px solid var(--wab-border); } .note-status { height:16px; margin-top:3px; }
    .saved-message audio { width:100%; margin:12px 0; padding:0; }
    .text-link { color:var(--wab-accent); text-decoration:underline; cursor:pointer; overflow-wrap:anywhere; }
    .saved-message.has-doc { width:min(760px,90%); } .saved-message.has-doc .message-bubble { width:100%; }
    .contact-card { margin:2px 0 6px; border-radius:7px; background:var(--wab-field); overflow:hidden; min-width:240px; }
    .contact-head { display:flex; align-items:center; gap:12px; padding:10px 12px; }
    .contact-avatar { flex:none; width:44px; height:44px; border-radius:50%; display:grid; place-items:center; background:var(--wab-selected); color:var(--wab-accent); font-size:18px; font-weight:600; }
    .contact-info { flex:1; min-width:0; } .contact-info strong { display:block; font-size:15px; font-weight:500; overflow:hidden; text-overflow:ellipsis; user-select:text; }
    .contact-number { display:block; font-size:13px; color:var(--wab-muted); user-select:text; }
    .contact-copy { display:block; width:100%; padding:10px 12px; border:0; border-top:1px solid var(--wab-border); background:transparent; color:var(--wab-accent); font-size:14px; font-weight:500; text-align:center; cursor:pointer; }
    .contact-copy:hover { background:var(--wab-hover); } .contact-copy:focus-visible { outline:2px solid var(--wab-accent); outline-offset:-2px; }
    .doc-card { display:flex; align-items:center; gap:12px; padding:10px; margin:6px 0; border-radius:8px; background:var(--wab-field); }
    .doc-icon { font-size:28px; } .doc-info { flex:1; min-width:0; } .doc-info strong { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; user-select:text; } .doc-info span { font-size:12px; }
    .doc-actions { display:flex; gap:6px; flex-shrink:0; } .doc-action { padding:5px 10px; border-radius:14px; background:var(--wab-hover); color:var(--wab-accent); font-size:12px; text-decoration:none; }
    .doc-frame { display:block; width:100%; height:70vh; margin:8px 0; border:0; border-radius:6px; background:#fff; }
    .saved-message.has-audio { width:min(460px,75%); } .saved-message.has-audio .message-bubble { width:100%; }
    .saved-message.has-video { width:min(640px,75%); }
    .saved-message.has-video .message-bubble { width:100%; }
    .saved-message video { display:block; width:100%; height:auto; min-height:200px; max-height:65vh; margin:8px 0; border-radius:6px; background:#000; object-fit:contain; }
    .viewer-notice { color:var(--wab-muted); font-size:13px; margin-top:16px; }
    .viewer-add { border:1px solid var(--wab-border); background:var(--wab-surface); color:var(--wab-text); border-radius:20px; padding:7px 12px; font-size:12px; }
    .lightbox { position:fixed; inset:0; z-index:2147483647; background:#000e; display:flex; align-items:center; justify-content:center; padding:48px 20px 20px; }
    .lightbox img { max-width:100%; max-height:calc(100vh - 80px); object-fit:contain; }
    .lightbox-close { position:absolute; top:12px; right:20px; color:white; background:#333; border:0; border-radius:50%; width:36px; height:36px; display:grid; place-items:center; padding:0; } .lightbox-close:hover { background:#555; }
    @media(max-width:700px) { .viewer-body { padding:16px; } .saved-message { max-width:95%; } }
  `;
  viewerRoot.append(viewerStyle);
  let viewerRegion = null, viewedItem = null;
  let viewerPosition = null, viewerFixed = false, viewerRect = null;
  // WhatsApp's layout can make an element appended to its pane unreachable (inert/pointer-events/hidden ancestors, or a
  // covering layer). When that happens, float the viewer over the pane from the page body instead.
  function placeViewerFixed() {
    const box = viewerRegion?.isConnected ? viewerRegion.getBoundingClientRect() : viewerRect;
    if (!box?.width || !box?.height) return false;
    viewerRect = {left:box.left, top:box.top, width:box.width, height:box.height};
    if (viewerHost.parentElement !== document.body) document.body.append(viewerHost);
    viewerHost.classList.add('wab-fixed');
    Object.assign(viewerHost.style, {left:viewerRect.left+'px', top:viewerRect.top+'px', width:viewerRect.width+'px', height:viewerRect.height+'px'});
    viewerFixed = true;
    return true;
  }
  function resetViewerPlacement() {
    viewerFixed = false; viewerRect = null; viewerHost.classList.remove('wab-fixed');
    for (const property of ['left','top','width','height']) viewerHost.style.removeProperty(property);
  }
  function viewerReachable() {
    if (viewerHost.hidden || typeof document.elementFromPoint !== 'function') return true;
    const box = viewerHost.getBoundingClientRect();
    if (!box.width || !box.height) return true;
    const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    return !hit || hit === viewerHost || viewerHost.contains(hit);
  }
  const viewerHidden = new Map();
  function stopSavedAudio() {
    releaseAudio(viewerRoot,viewerAudioURLs);
  }
  function concealConversation() {
    for (const child of viewerRegion?.children || []) {
      if (child === viewerHost || viewerHidden.has(child)) continue;
      viewerHidden.set(child, {inert:child.inert, ariaHidden:child.getAttribute('aria-hidden')});
      child.inert = true; child.setAttribute('aria-hidden','true');
    }
  }
  function closeSavedViewer() {
    stopSavedAudio(); viewerHost.hidden = true; viewedItem = null;
    viewerRoot.querySelector('.lightbox')?.remove();
    viewerRegion?.classList.remove('wab-viewer-open');
    if (viewerPosition?.changed && viewerRegion) {
      if (viewerPosition.value) viewerRegion.style.setProperty('position',viewerPosition.value,viewerPosition.priority);
      else viewerRegion.style.removeProperty('position');
    }
    viewerPosition = null;
    if (viewerFixed) viewerHost.remove();
    resetViewerPlacement();
    sectionRoot.querySelectorAll('.message-preview').forEach(node=>node.setAttribute('aria-pressed','false'));
    for (const [child, previous] of viewerHidden) {
      child.inert = previous.inert;
      if (previous.ariaHidden === null) child.removeAttribute('aria-hidden'); else child.setAttribute('aria-hidden',previous.ariaHidden);
    }
    viewerHidden.clear();
  }
  function mainViewerRegion() {
    const side = contentRegion || document.querySelector('#side');
    if (!side) return null;
    const left = side.getBoundingClientRect();
    const edge = left.right ?? left.left + left.width;
    const valid = node => {
      if (node === side || node.contains(side) || side.contains(node) || node === viewerHost || node.closest('#wab-viewer-host')) return false;
      const box = node.getBoundingClientRect();
      return node.getClientRects().length && box.width >= 240 && box.height >= 200 && box.left >= edge - 8;
    };
    const main = [...document.querySelectorAll('#main, [data-testid="conversation-panel-wrapper"], [data-testid="conversation-panel"]')].find(valid);
    if (main) return main;
    // The Mac download/welcome pane has neither #main nor a stable test ID.
    // Locate the full-height right column geometrically, including nested layouts.
    return [...document.querySelectorAll('#app div, #app main, #app section, #app [role="main"]')]
      .filter(valid)
      .filter(node => { const box=node.getBoundingClientRect(); return box.height >= left.height * 0.65 && Math.abs(box.top - left.top) < 64; })
      .sort((a,b) => {const first=a.getBoundingClientRect(),second=b.getBoundingClientRect();return second.width*second.height-first.width*first.height;})[0] || null;
  }
  function openSavedImage(source) {
    viewerRoot.querySelector('.lightbox')?.remove();
    const lightbox = el('div','lightbox'); lightbox.setAttribute('role','dialog'); lightbox.setAttribute('aria-modal','true'); lightbox.setAttribute('aria-label','Saved image'); lightbox.tabIndex = -1;
    const image = el('img'); image.src = source; image.alt = 'Saved image';
    const close = el('button','lightbox-close'); close.append(uiIcon(ICON_CLOSE,20)); close.setAttribute('aria-label','Close image');
    const dismiss = () => { lightbox.remove(); viewerRoot.querySelector('.saved-image-button')?.focus(); };
    close.onclick = dismiss; lightbox.onclick = event => { if (event.target === lightbox) dismiss(); };
    lightbox.onkeydown = event => {
      if (event.key === 'Escape') { event.stopPropagation(); dismiss(); }
      if (event.key === 'Tab') { event.preventDefault(); close.focus(); }
    };
    lightbox.append(close,image); viewerRoot.append(lightbox); close.focus();
  }
  // Plain text with clickable http(s)/www links; everything else stays a text node so nothing is interpreted as HTML.
  function linkifiedText(text) {
    const block = el('div','text'), pattern = /\b(?:https?:\/\/|www\.)[^\s<>"']+/gi;
    let last = 0, match;
    while ((match = pattern.exec(text))) {
      const url = match[0].replace(/[).,;:!?]+$/, '');
      block.append(document.createTextNode(text.slice(last, match.index)));
      const link = el('a','text-link',url); link.href = /^www\./i.test(url) ? 'https://' + url : url;
      link.target = '_blank'; link.rel = 'noopener noreferrer'; block.append(link);
      last = match.index + url.length; pattern.lastIndex = last;
    }
    block.append(document.createTextNode(text.slice(last)));
    return block;
  }
  function renderSavedViewer(item) {
    stopSavedAudio(); viewerRoot.querySelector('.viewer')?.remove(); viewerRoot.querySelector('.lightbox')?.remove();
    const view = el('section','viewer'); view.setAttribute('aria-label','Saved message');
    const header = el('div','viewer-header');
    const close = el('button','icon'); close.append(uiIcon(ICON_BACK)); close.setAttribute('aria-label','Close saved message'); close.onclick = () => { closeSavedViewer(); sectionRoot.querySelector('.message-preview')?.focus(); };
    const avatar=el('div','viewer-avatar',Array.from(item.chat || messagePresentation(item).sender || 'B')[0]);avatar.setAttribute('aria-hidden','true');
    const title = el('div','viewer-title'); title.append(el('strong','',item.chat || 'Saved message'),(()=>{const sub=el('span','viewer-sub');sub.append(bookmarkGlyph(12),document.createTextNode(item.collection || 'Unnamed'));return sub;})());
    const add = el('button','viewer-add','Add media'); add.title = 'Attach a downloaded image, audio, or video file to this bookmark';
    const file = el('input'); file.type='file'; file.accept='image/*,audio/*,video/*,application/*,text/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,application/ogg,.opus,.ogg,.oga,.mp3,.m4a,.aac,.wav,.webm,.mp4,.mov'; file.hidden=true; add.onclick=()=>file.click();
    file.onchange = async () => {
      const attachment=file.files?.[0]; if (!attachment) return;
      add.disabled=true;
      try {
        const {data,kind,name}=await globalThis.WABMedia.readFile(attachment,item.mediaKind || '');
        const updated={...item,media:[...(item.media || []).filter(media=>!item.mediaKind || media.kind===item.mediaKind),name?{kind,data,name}:{kind,data}],mediaKind:item.mediaKind || kind,mediaNote:''};
        await request('save',{item:updated}); if (viewedItem?.id===item.id) {viewedItem=updated;renderSavedViewer(updated);} await reload(); toast('Media attached');
      } catch(error) {toast(error.message);} finally {add.disabled=false;}
    };
    header.append(close,avatar,title,add,file);
    const body=el('div','viewer-body'), thread=el('div','conversation-thread'), message=el('div','saved-message' + (item.messageId?.startsWith('true_') ? ' outgoing' : '')), bubble=el('div','message-bubble');
    body.tabIndex=0;body.setAttribute('role','region');body.setAttribute('aria-label','Saved message content');
    const presentation=messagePresentation(item);
    if (presentation.sender) bubble.append(el('div','bubble-sender',presentation.sender));
    if (item.text) bubble.append(linkifiedText(item.text));
    let usable=0;
    for (const contact of item.contacts || []) {
      const card=el('div','contact-card'), head=el('div','contact-head'), info=el('div','contact-info');
      const avatar=el('div','contact-avatar',Array.from(contact.name || '#')[0]?.toLocaleUpperCase() || '#');avatar.setAttribute('aria-hidden','true');
      const phones=contact.phones || [];
      info.append(el('strong','',contact.name));
      if (!phones.length) info.append(el('span','contact-number','No number on this card'));
      for (const phone of phones) info.append(el('span','contact-number',phone.display));
      head.append(avatar,info);card.append(head);
      for (const phone of phones) {
        const copy=el('button','contact-copy',phones.length>1?`Copy ${phone.display}`:'Copy number');copy.type='button';
        const label=copy.textContent;
        copy.onclick=async()=>{try{await navigator.clipboard.writeText(phone.display);copy.textContent='Copied';}catch{copy.textContent='Copy failed';}setTimeout(()=>copy.textContent=label,1500);};
        card.append(copy);
      }
      bubble.append(card);usable++;
    }
    for (const media of item.media || []) {
      if (media.kind==='image' && /^data:image\//.test(media.data || '')) {
        const button=el('button','saved-image-button'); button.setAttribute('aria-label','View saved image');
        const image=el('img');image.src=media.data;image.alt='Saved image';button.append(image);button.onclick=()=>openSavedImage(media.data);bubble.append(button);usable++;
      } else if (media.kind==='document') {
        try {
          const blob=globalThis.WABMedia.documentBlob(media.data,media.name), url=URL.createObjectURL(blob), name=media.name || 'Document';
          viewerAudioURLs.add(url);message.classList.add('has-doc');
          const card=el('div','doc-card'), info=el('div','doc-info');
          info.append(el('strong','',name),el('span','muted',`${blob.type.split('/').pop().toUpperCase()} · ${blob.size>=1048576?(blob.size/1048576).toFixed(1)+' MB':Math.max(1,Math.round(blob.size/1024))+' KB'}`));
          const open=el('a','doc-action','Open');open.href=url;open.target='_blank';open.rel='noopener';
          const save=el('a','doc-action','Download');save.href=url;save.download=name;
          const actions=el('div','doc-actions');actions.append(open,save);card.append(el('div','doc-icon','📄'),info,actions);bubble.append(card);
          if (blob.type==='application/pdf' || blob.type==='text/plain') {const frame=el('iframe','doc-frame');frame.src=url;frame.title=name;bubble.append(frame);}
          usable++;
        } catch(error) {bubble.append(el('p','viewer-notice audio-error',error.message));}
      } else if (media.kind==='audio' || media.kind==='video') {
        try {
          const audio=savedAudioPlayer(media,viewerAudioURLs);
          audio.onerror=()=>{
            if (!audio.nextElementSibling?.classList.contains('audio-error')) {
              const error=el('p','viewer-notice audio-error',`The browser could not decode this ${media.kind}. Use Add media to attach the original downloaded file.`);
              const download=el('a','',`Download saved ${media.kind}`);download.href=audio.src;download.download='bookmarked-'+media.kind;error.append(document.createTextNode(' '),download);audio.after(error);
            }
          };
          if (media.kind==='audio') message.classList.add('has-audio');
          if (media.kind==='video') {message.classList.add('has-video');audio.setAttribute('playsinline','');audio.preload='auto';}
          bubble.append(audio);usable++;
        } catch(error) {bubble.append(el('p','viewer-notice audio-error',error.message));}
      }
    }
    if (!item.text && !usable) bubble.append(el('p','viewer-notice','The media file was not copied into this bookmark. Use Add media to attach a downloaded image, audio, video or document file.'));
    bubble.append(el('div','bubble-meta',presentation.time));
    message.append(bubble);
    if (item.mediaNote) message.append(el('p','viewer-notice',item.mediaNote));
    const noteRow=el('div','note-row'), noteLabel=el('label','','Label'), note=el('input'), noteStatus=el('div','muted note-status');
    note.id='wab-viewer-note';noteLabel.htmlFor='wab-viewer-note';note.maxLength=120;note.placeholder='Add a name or description';note.value=item.note || '';note.autocomplete='off';
    let savedNote=item.note || '';
    const saveNote=async()=>{
      const value=note.value.trim();if (value===savedNote) return;
      try {
        await request('save',{item:{...item,note:value}});item.note=value;savedNote=value;noteStatus.textContent='Saved';setTimeout(()=>{if (noteStatus.textContent==='Saved') noteStatus.textContent='';},1500);
        render(); // Refreshes the list only; the open viewer keeps playing.
      } catch(error) {noteStatus.textContent=error.message;}
    };
    note.onchange=saveNote;note.onkeydown=event=>{if (event.key==='Enter') {event.preventDefault();note.blur();}};
    noteRow.append(noteLabel,note,noteStatus);
    thread.append(el('div','day-divider',presentation.date),message,noteRow);body.append(thread);view.append(header,body);viewerRoot.append(view);close.focus();
  }
  function openSavedMessage(item) {
    if (!viewerHost.hidden && viewedItem?.id===item.id) return;
    const region=mainViewerRegion();
    if (!region) {toast('Could not locate WhatsApp’s right-hand panel. Resize the window and select the saved message again.');return;}
    if (viewerRegion && viewerRegion!==region) closeSavedViewer();
    viewerRegion=region;viewedItem=item;region.classList.add('wab-viewer-open');
    if (!viewerPosition) {
      viewerPosition={value:region.style.getPropertyValue('position'),priority:region.style.getPropertyPriority?.('position') || '',changed:!getComputedStyle(region).position || getComputedStyle(region).position==='static'};
      if (viewerPosition.changed) region.style.setProperty('position','relative');
    }
    if (!viewerFixed && viewerHost.parentElement!==region) region.append(viewerHost);
    concealConversation();viewerHost.hidden=false;renderSavedViewer(item);
    for (const delay of [60, 400]) setTimeout(()=>{ if (!viewerHost.hidden && !viewerFixed && !viewerReachable()) placeViewerFixed(); }, delay);
    sectionRoot.querySelectorAll('.message-preview').forEach(node=>node.setAttribute('aria-pressed',String(node.dataset.bookmarkId===item.id)));
  }
  // WhatsApp's native pane can intercept wheel events; scroll our own bounded
  // content area and keep those events away from the conversation underneath.
  viewerRoot.addEventListener('wheel',event=>{
    if (event.ctrlKey || viewerRoot.querySelector('.lightbox')) return;
    const body=event.target.closest?.('.viewer-body');if (!body) return;
    const unit=event.deltaMode===1?16:event.deltaMode===2?body.clientHeight:1;
    body.scrollTop+=event.deltaY*unit;
    event.preventDefault();event.stopPropagation();
  },{passive:false});
  for (const type of ['pointerdown','pointerup','mousedown','mouseup','click','dblclick','contextmenu','selectstart','copy','cut','paste','keydown','keyup','keypress','input','beforeinput','focusin','focusout'])
    viewerHost.addEventListener(type,event=>event.stopPropagation());
  viewerRoot.addEventListener('touchmove',event=>event.stopPropagation(),{passive:true});
  viewerRoot.addEventListener('keydown',event=>{
    if (event.target.closest?.('audio, video, button, input, a') || viewerRoot.querySelector('.lightbox')) return;
    const body=viewerRoot.querySelector('.viewer-body');if (!body) return;
    const distance={ArrowDown:40,ArrowUp:-40,PageDown:body.clientHeight*0.9,PageUp:-body.clientHeight*0.9,' ':body.clientHeight*0.9}[event.key];
    if (distance!==undefined || event.key==='Home' || event.key==='End') {
      body.scrollTop=event.key==='Home'?0:event.key==='End'?body.scrollHeight:body.scrollTop+distance;
      event.preventDefault();event.stopPropagation();
    }
  });
  viewerRoot.addEventListener('keydown',event=>{if (event.key==='Escape' && !viewerRoot.querySelector('.lightbox')) closeSavedViewer();});
  document.addEventListener('pointerdown',event=>{
    if (viewerHost.hidden || !event.isTrusted) return;
    if (event.composedPath().some(node=>node===viewerHost || node===sectionHost || node===host) || viewerHost.contains(event.target)) return;
    // A press that lands on the viewer's own area but hit something else means the viewer is covered: lift it, never close.
    const box = viewerHost.getBoundingClientRect();
    if (box.width && event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom) {
      if (!viewerFixed) placeViewerFixed();
      return;
    }
    if (viewerRegion?.contains(event.target)) return;
    closeSavedViewer();
  },true);
  window.addEventListener('resize', () => { if (viewerFixed && !viewerHost.hidden) placeViewerFixed(); });
  let collectionChoices = [], collectionActive = -1;
  function closeCollectionOptions() {
    $('#wab-collection-options').hidden = true;
    $('#wab-collection').setAttribute('aria-expanded', 'false');
    $('.collection-toggle').setAttribute('aria-expanded', 'false');
    $('#wab-collection').removeAttribute('aria-activedescendant');
    collectionActive = -1;
  }
  function chooseCollection(name) {
    $('#wab-collection').value = name === 'Unnamed' ? '' : name;
    $('#wab-collection').focus(); closeCollectionOptions();
  }
  function renderCollectionOptions(showAll = false) {
    const field = $('#wab-collection'), list = $('#wab-collection-options');
    const query = field.value.trim();
    const names = ['Unnamed', ...[...new Set(items.map(item => item.collection).filter(name => name && name !== 'Unnamed'))].sort((a,b) => a.localeCompare(b))];
    collectionChoices = names.filter(name => showAll || name.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
    const create = query && !names.some(name => name.toLocaleLowerCase() === query.toLocaleLowerCase());
    if (create) collectionChoices.push(query);
    collectionActive = -1; field.removeAttribute('aria-activedescendant');
    list.replaceChildren(...collectionChoices.map((name, index) => {
      const isCreate = create && name === query;
      const option = el('button', 'collection-option' + (isCreate ? ' create' : '') + (!isCreate && name.toLocaleLowerCase() === query.toLocaleLowerCase() ? ' current' : ''), isCreate ? `Create “${name}”` : name);
      if (!isCreate) { const count = items.filter(item => (item.collection || 'Unnamed') === name).length; if (count) option.dataset.count = String(count); }
      option.type = 'button'; option.tabIndex = -1; option.id = 'wab-collection-choice-' + index;
      option.setAttribute('role', 'option'); option.setAttribute('aria-selected', 'false');
      option.onmousedown = event => event.preventDefault();
      option.onclick = () => chooseCollection(name);
      return option;
    }));
    if (!collectionChoices.length) list.append(el('div', 'collection-empty', 'No collections yet. Type a name to create one.'));
    list.hidden = false; field.setAttribute('aria-expanded', 'true'); $('.collection-toggle').setAttribute('aria-expanded', 'true');
  }
  $('#wab-collection').onfocus = () => renderCollectionOptions(true);
  $('#wab-collection').oninput = () => renderCollectionOptions();
  $('.collection-toggle').onclick = () => {
    if ($('#wab-collection-options').hidden) { $('#wab-collection').focus(); renderCollectionOptions(true); }
    else closeCollectionOptions();
  };
  $('#wab-collection').addEventListener('keydown', event => {
    const list = $('#wab-collection-options');
    if (event.key === 'Tab') { closeCollectionOptions(); return; }
    if (event.key === 'Escape' && !list.hidden) { event.preventDefault(); event.stopPropagation(); closeCollectionOptions(); return; }
    if (event.key === 'Enter' && !list.hidden) {
      event.preventDefault(); event.stopPropagation();
      if (collectionActive >= 0) chooseCollection(collectionChoices[collectionActive]); else closeCollectionOptions();
      return;
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault(); event.stopPropagation(); if (list.hidden) renderCollectionOptions(true);
    if (!collectionChoices.length) return;
    collectionActive = (collectionActive + (event.key === 'ArrowDown' ? 1 : collectionActive < 0 ? 0 : -1) + collectionChoices.length) % collectionChoices.length;
    for (const [index, option] of [...list.children].entries()) option.setAttribute('aria-selected', String(index === collectionActive));
    const active = list.children[collectionActive]; $('#wab-collection').setAttribute('aria-activedescendant', active.id); active.scrollIntoView({block:'nearest'});
  });
  root.addEventListener('pointerdown', event => { if (!event.target.closest('.collection-picker')) closeCollectionOptions(); });
  const DOCUMENT_NAME = /^[^\n\\/]{1,180}\.(pdf|docx?|xlsx?|pptx?|csv|txt|rtf|zip|rar|7z|json|xml|odt|ods|epub|apk|html?)$/i;
  function documentNode(message) {
    for (const node of message.querySelectorAll('[title], span[dir], [data-testid*="document"] span, [data-testid*="file"] span')) {
      if (node.closest('[data-testid*="quoted"], .selectable-text')) continue;
      const text = (node.getAttribute('title') || node.textContent || '').trim();
      if (DOCUMENT_NAME.test(text)) return node;
    }
    return null;
  }
  function documentName(message) {
    const node = documentNode(message);
    return node ? (node.getAttribute('title') || node.textContent || '').trim() : '';
  }
  function messageMediaKind(message) {
    if (message.querySelector('video, [data-icon*="video"], [data-testid*="video"], [aria-label*="video" i]')) return 'video';
    if (message.querySelector('audio, [data-icon*="audio"], [data-icon*="ptt"], [data-testid*="audio"], [data-testid*="ptt"], [aria-label*="voice" i], [data-testid*="waveform"]')) return 'audio';
    if (message.querySelector('[data-icon*="document"], [data-icon^="doc"], [data-icon*="pdf"], [data-testid*="document"], [aria-label*="document" i]') || documentName(message)) return 'document';
    return '';
  }
  async function collectMessageMedia(message) {
    const kind=messageMediaKind(message), media=[];let note='';
    const candidates=[...message.querySelectorAll('img, audio, video')].filter(node=>{
      if (node.closest('[data-testid*="quoted"]')) return false;
      if (node.tagName==='AUDIO' || node.tagName==='VIDEO') return true;
      if (kind) return false; // Voice-note avatars and video posters are not attachments.
      const marker=[node.alt,node.src,node.getAttribute('data-testid'),node.parentElement?.getAttribute('aria-label')].join(' ');
      if (/avatar|profile|pps\.whatsapp/i.test(marker) || node.closest('[data-testid*="avatar"], [data-testid*="profile"]')) return false;
      return node.width>80 && node.height>60;
    });
    for (const node of candidates) {
      const source=node.currentSrc || node.src || node.querySelector('source')?.src;
      if (!source || !/^(blob:|https:|data:)/.test(source)) continue;
      const type=node.tagName==='AUDIO'?'audio':node.tagName==='VIDEO'?'video':'image';
      try {media.push({kind:type,data:await mediaData(source,type==='audio')});} catch(error) {note=error.message;}
    }
    const cached=capturedAudio.get(message);
    if (cached && cached.messageId===messageReference(message).messageId && !media.some(item=>item.kind===(cached.kind || 'audio'))) {
      const data=await Promise.race([cached.copy,new Promise(resolve=>setTimeout(()=>resolve(null),3000))]);if (data) media.push(cached.kind==='document'?{kind:'document',data,name:cached.name || documentName(message) || 'document'}:{kind:cached.kind || 'audio',data});
    }
    if (kind && !media.some(item=>item.kind===kind)) note=(note?note+' ':'')+`The selected ${kind} file has not been copied yet.`;
    return {media,mediaKind:kind,mediaNote:note};
  }
  function selectedMessageSource(item, previous = pendingSource) {
    const id=item?.messageId;
    if (previous?.isConnected && (!id || messageReference(previous).messageId===id)) return previous;
    if (id) {
      const node=[...document.querySelectorAll('[data-id]')].find(node=>node.getAttribute('data-id')===id);
      if (node) return resolveMessage(node) || node;
    }
    if (item?.meta) {
      const matches=[...document.querySelectorAll('[data-pre-plain-text]')].filter(node=>node.getAttribute('data-pre-plain-text')===item.meta && (!item.text || node.textContent.includes(item.text)));
      if (matches.length===1) return resolveMessage(matches[0]);
    }
    return null;
  }
  function updateCaptureStatus() {
    if (!pending) return;
    const required=CAPTURED_KINDS.includes(pending.mediaKind);
    const ready=pending.media.some(media=>media.kind===pending.mediaKind && /^data:/.test(media.data || ''));
    $('.capture-tools').hidden=!required || ready || pendingMoveOnly;
    $('.load-native-media').hidden=ready || pendingMoveOnly;
    $('.save-without-file').hidden=!required || ready || pendingMoveOnly || capturePhase!=='error';
    $('.load-native-media').disabled=capturePhase==='loading';
    $('.load-native-media').textContent='Retry copying selected '+mediaWord(pending.mediaKind);
    $('.copy-debug').hidden=!required || ready || pendingMoveOnly || capturePhase==='loading';
    let status='';
    if (required) {
      if (ready) status=`${pending.mediaKind==='audio'?'Audio':pending.mediaKind==='document'?'Document':'Video'} copied and ready to save.`;
      else if (pendingMoveOnly) status='The file was not copied in this older bookmark. You can still change its collection.';
      else if (capturePhase==='loading') status=`Copying the selected ${pending.mediaKind} from WhatsApp…${pending.mediaKind==='video'?' This can take up to a minute.':''}`;
      else if (capturePhase==='error') status=captureError;
      else status='The original message is not loaded. Open its chat and bookmark the message again.';
    }
    $('.capture-status').textContent=status;
    $('.save').disabled=required && !ready && !pendingMoveOnly && !pending.saveWithoutFile;
  }
  function mediaDeadline(promise, milliseconds) {
    let timer;
    const timeout=new Promise((resolve,reject)=>{timer=setTimeout(()=>reject(new Error('Copying the selected message timed out. Keep the original message visible, then click Retry copying.')),milliseconds);});
    return Promise.race([promise,timeout]).finally(()=>clearTimeout(timer));
  }
  const bridgeRequests=new Map();
  window.addEventListener('message',event=>{
    if (event.source!==window || event.origin!=='https://web.whatsapp.com') return;
    const data=event.data,request=bridgeRequests.get(data?.requestId);if (!request) return;
    if (data.type==='WAB_MEDIA_CAPTURE_READY') {bridgeDebug='ready';request.ready();return;}
    if (data.type==='WAB_MEDIA_CAPTURE_TRACE') {if (/^watching/.test(String(data.note))) bridgeWatching=true;trace('bridge: '+String(data.note).slice(0,120));return;}
    if (data.type==='WAB_MEDIA_CAPTURE_ERROR') {bridgeDebug='error';request.error=String(data.error || 'Could not copy selected media.');return;}
    if (data.type!=='WAB_MEDIA_CAPTURE_RESULT' || data.kind!==request.kind || typeof data.data!=='string' || data.data.length>36*1024*1024) return;
    try {
      if (request.kind==='document') globalThis.WABMedia.documentBlob(data.data,String(data.name || '')); else globalThis.WABMedia.mediaBlob(data.data,request.kind);
      bridgeDebug='copied';
      capturedAudio.set(request.message,{messageId:request.messageId,kind:request.kind,done:true,name:typeof data.name==='string'?data.name.slice(0,200):'',copy:Promise.resolve(data.data)});trace('bridge result stored');
    } catch(error) {request.error=error.message;}
  });
  function armMediaBridge(message,kind) {
    bridgeDebug='waiting';
    if (typeof window.postMessage!=='function') {bridgeDebug='unavailable';return {ready:Promise.resolve(),cancel(){},error:''};}
    const id=crypto.randomUUID(),request={message,kind,messageId:messageReference(message).messageId,error:''};
    request.readyPromise=new Promise(resolve=>{request.ready=resolve;});bridgeRequests.set(id,request);
    window.postMessage({type:'WAB_MEDIA_CAPTURE_ARM',requestId:id,kind,timeout:kind==='video'?90000:kind==='document'?45000:15000},'https://web.whatsapp.com');
    return {
      ready:Promise.race([request.readyPromise,new Promise(resolve=>setTimeout(()=>{if (bridgeDebug==='waiting') bridgeDebug='no-response';resolve();},250))]),
      get error(){return request.error;},
      cancel(){bridgeRequests.delete(id);window.postMessage({type:'WAB_MEDIA_CAPTURE_CANCEL',requestId:id},'https://web.whatsapp.com');}
    };
  }
  function describeSource(node) {
    if (!node) return null;
    const safeLabel=value=>/play/i.test(value || '')?'play':/pause/i.test(value || '')?'pause':/download/i.test(value || '')?'download':'other';
    const safeToken=value=>/^[a-z][a-z0-9_-]{0,80}$/i.test(value || '')?value:value?'present':null;
    return {
      tag:node.tagName,connected:node.isConnected,role:safeToken(node.getAttribute('role')),testId:safeToken(node.getAttribute('data-testid')),
      hasMessageId:!!(node.closest('[data-id]') || node.querySelector('[data-id]')),hasMetadata:node.matches('[data-pre-plain-text]') || !!node.querySelector('[data-pre-plain-text]'),
      mediaKind:messageMediaKind(node),
      icons:[...new Set([...node.querySelectorAll('[data-icon]')].map(icon=>safeToken(icon.getAttribute('data-icon'))))].slice(0,40),
      controls:[...node.querySelectorAll('button, [role="button"]')].slice(0,20).map(control=>({tag:control.tagName,label:safeLabel(control.getAttribute('aria-label')),icons:[...control.querySelectorAll('[data-icon]')].map(icon=>safeToken(icon.getAttribute('data-icon')))})),
      ancestry:[node,...(()=>{const chain=[];for(let parent=node.parentElement;parent && chain.length<6;parent=parent.parentElement)chain.push(parent);return chain;})()].map(parent=>({tag:parent.tagName,knownId:['main','side','app','pane-side'].includes(parent.id)?parent.id:null,role:safeToken(parent.getAttribute('role'))}))
    };
  }
  $('.copy-debug').onclick=async()=>{
    const id=pending?.messageId;
    const report={
      extensionVersion:'1.7.3',phase:capturePhase,moveOnly:pendingMoveOnly,bridge:bridgeDebug,
      savedReference:{hasMessageId:!!id,hasChat:!!pending?.chat,hasChatId:!!pending?.chatId,hasMetadata:!!pending?.meta,hasText:!!pending?.text,mediaKind:pending?.mediaKind || '',mediaCount:pending?.media.length || 0},
      page:{hasMain:!!document.querySelector('#main'),messageContainers:document.querySelectorAll(messageSelector).length,identifiedElements:document.querySelectorAll('[data-id]').length,metadataElements:document.querySelectorAll('[data-pre-plain-text]').length,matchingMessageIds:id?[...document.querySelectorAll('[data-id]')].filter(node=>node.getAttribute('data-id')===id).length:0},
      originalSource:sourceDebug,currentSource:describeSource(pendingSource),lastMenuSource:describeSource(menuMessage),lastHoveredSource:describeSource(hoveredMessage),
      captureTrace,
      players:[...document.querySelectorAll('audio,video')].map(player=>({tag:player.tagName,readyState:player.readyState,networkState:player.networkState,paused:player.paused,sourceScheme:(player.currentSrc || player.src || '').split(':')[0] || 'none',errorCode:player.error?.code || null}))
    };
    const text=JSON.stringify(report,null,2),field=$('.debug-report');field.value=text;field.hidden=false;
    try {
      if (!globalThis.navigator?.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);$('.copy-debug').textContent='Debug info copied';
    } catch {field.focus();field.select?.();$('.copy-debug').textContent='Select and copy the debug info below';}
  };
  // WhatsApp's PDF/media viewer is an overlay outside the message; find its controls by label, icon or test id.
  function previewControls(message, pattern) {
    const hint = node => [node.getAttribute('aria-label'), node.getAttribute('title'), node.getAttribute('data-icon'), node.getAttribute('data-testid'), node.querySelector?.('svg title')?.textContent].filter(Boolean).join(' ');
    return [...document.querySelectorAll('[aria-label], [title], [data-icon], [data-testid]')]
      .filter(node => !message.contains(node) && !node.closest('#side, #pane-side, #whatsapp-bookmarks-extension, #wab-section-host, #wab-viewer-host') && pattern.test(hint(node)))
      .map(node => node.closest('button, [role="button"]') || node);
  }
  async function loadSelectedMedia(automatic=false) {
    const item=pending;if (!item) return;
    const message=selectedMessageSource(item);pendingSource=message;
    if (!message) {capturePhase='error';captureError='The selected message is no longer loaded. Open its WhatsApp chat and bookmark that message again.';updateCaptureStatus();return;}
    if (mediaLoadContext?.item===item) return;
    if (!automatic) closeCollectionOptions();const button=$('.load-native-media');button.disabled=true;
    capturePhase='loading';captureError='';updateCaptureStatus();
    captureTrace=[];trace('start '+item.mediaKind);
    const bridge=armMediaBridge(message,item.mediaKind);
    const session={message,kind:item.mediaKind,item,bridge};mediaLoadContext=session;nativeAudioInteraction={message,kind:item.mediaKind,at:Date.now()};
    const budget=item.mediaKind==='video'?90000:item.mediaKind==='document'?45000:15000,deadline=Date.now()+budget,bounded=promise=>mediaDeadline(promise,Math.max(1,deadline-Date.now()));
    try {
      await bounded(bridge.ready);
      if (pending!==item || mediaLoadContext!==session) return;
      let collected=await bounded(collectMessageMedia(message));
      if (/25 MB/.test(collected.mediaNote)) throw new Error('This file exceeds the 25 MB bookmark limit.');
      if (!collected.media.some(media=>media.kind===item.mediaKind)) {
        const icon=message.querySelector('[data-icon*="play"], [aria-label^="Play" i], [data-icon*="download"]');
        const player=item.mediaKind==='document'?null:message.querySelector(item.mediaKind==='video'?'video':'audio');
        // Newer WhatsApp builds label video controls with nothing at all, so fall back to the thumbnail or the first button.
        const thumb=item.mediaKind==='video'?message.querySelector('img, canvas, [data-testid*="media"], [style*="background-image"]'):null;
        // Never click the sender name or quoted content; prefer real <button>s, then role=button elements, in that order.
        const usable=node=>!node.closest('[data-testid*="author"], [data-testid*="quoted"], [data-testid*="reaction"]');
        const fallbacks=item.mediaKind==='video' || item.mediaKind==='document'?[thumb?.closest('button, [role="button"]') || thumb,...(item.mediaKind==='document'?[...message.querySelectorAll('[data-icon*="down"], [aria-label*="download" i]')].map(node=>node.closest('button, [role="button"]') || node):[]),...message.querySelectorAll('button'),...message.querySelectorAll('[role="button"]')].concat(item.mediaKind==='document'?[(()=>{const named=documentNode(message);return named?.closest('button, [role="button"]') || named;})()]:[]).filter((node,index,all)=>node && usable(node) && all.indexOf(node)===index).slice(0,item.mediaKind==='document'?7:4):[];
        const control=icon?.closest('button, [role="button"]') || icon || fallbacks[0];
        trace('candidates: '+fallbacks.map(node=>`${node.tagName}${node.getAttribute('data-testid')?'['+node.getAttribute('data-testid')+']':''}${node.getAttribute('aria-label')?'(label)':''}`).join(', '));
        trace(control?`click ${control.tagName}${control.getAttribute('data-testid')?'['+control.getAttribute('data-testid')+']':''}`:`no-control; hasPlayer=${!!player}`);
        if (control) control.click();else if (typeof player?.play==='function') player.play().catch(()=>{});
        else throw new Error('Could not locate the selected message’s play control. Keep it visible and click Retry copying.');
        const started=Date.now();let firstControl=control,lastClick=Date.now(),nextFallback=1,modalDownload=false,lastModal=0,traceIcons=false;bridgeWatching=false;
        while (pending===item && mediaLoadContext===session && Date.now()-started<budget-3000) {
          if (bridge.error) throw new Error(bridge.error);
          // Some builds open a preview with its own Download control; use it once if the message click did not download.
          if (item.mediaKind==='document' && !bridgeWatching && Date.now()-started>2500 && Date.now()-lastModal>4000) {
            const outside=previewControls(message,/download/i)[0];
            if (outside) {modalDownload=true;lastModal=Date.now();trace('click preview download');outside.click();}
            else if (!traceIcons) {
              traceIcons=true;
              trace('no preview download; outside icons: '+[...new Set(previewControls(message,/./).map(node=>node.getAttribute('data-icon') || node.getAttribute('aria-label') || node.getAttribute('data-testid') || '').filter(value=>/^[\w .-]{1,40}$/.test(value)))].slice(0,30).join('|'));
            }
          }
          // If a video click produced nothing (no viewer, no watched player), try the next candidate control.
          if (!icon && !bridgeWatching && !(item.mediaKind==='document' && previewControls(message,/download/i).length) && (item.mediaKind!=='video' || !document.querySelector('video')) && Date.now()-lastClick>4000 && nextFallback<fallbacks.length) {
            const next=fallbacks[nextFallback++];lastClick=Date.now();trace(`retry click ${next.tagName}${next.getAttribute('data-testid')?'['+next.getAttribute('data-testid')+']':''}`);next.click();
          }
          // An undownloaded voice note shows Download first; once it finishes, WhatsApp shows Play, which must be clicked too.
          const playNow=message.querySelector('[data-icon*="play"], [aria-label^="Play" i]');
          const playControl=playNow?.closest('button, [role="button"]') || playNow;
          if (playControl && playControl!==firstControl && !message.querySelector('audio, video')?.currentSrc) {firstControl=playControl;playControl.click();}
          if (item.media.some(media=>media.kind===item.mediaKind)) {collected={media:item.media,mediaNote:''};break;}
          collected=await bounded(collectMessageMedia(message));
          if (/25 MB/.test(collected.mediaNote)) throw new Error('This file exceeds the 25 MB bookmark limit.');
          if (collected.media.some(media=>media.kind===item.mediaKind)) break;
          await new Promise(resolve=>setTimeout(resolve,250));
        }
        // Close a preview we opened to reach its Download button (Escape here closes the preview, not the chat).
        if (modalDownload) { const closer=previewControls(message,/^(close|x|x-viewer|x-alt|close-refreshed)$|\bclose\b/i)[0]; if (closer) closer.click(); else document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',code:'Escape',bubbles:true})); }
      }
      if (pending!==item) return;
      // WhatsApp may open videos in a full-screen viewer. Close it only if a video lives outside the message; Escape elsewhere would close the chat.
      if (item.mediaKind==='video' && collected.media.some(media=>media.kind==='video') && [...document.querySelectorAll('video')].some(video=>!message.contains(video))) document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',code:'Escape',bubbles:true}));
      trace(`end: documentVideos=${document.querySelectorAll('video').length} dialogs=${document.querySelectorAll('[role="dialog"]').length}`);
      if (!collected.media.some(media=>media.kind===item.mediaKind)) throw new Error('Could not copy the selected message yet. Keep it visible and click Retry copying.');
      item.media=collected.media;item.mediaNote='';capturePhase='ready';updateCaptureStatus();
      $('.preview').textContent=item.text || collected.media.find(media=>media.kind==='document')?.name || `${item.mediaKind==='audio'?'Audio':item.mediaKind==='document'?'Document':'Video'} file ready`;
    } catch(error) {if (pending===item) {capturePhase='error';captureError=error.message;updateCaptureStatus();}}
    finally {
      // A viewer opened for capture must not be left covering the chat. Escape is only safe when a video lives outside the message.
      if (item.mediaKind==='video' && [...document.querySelectorAll('video')].some(video=>!message.contains(video))) document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',code:'Escape',bubbles:true}));
      if (item.mediaKind==='document') { const closer=previewControls(message,/^(close|x|x-viewer|x-alt|close-refreshed)$|\bclose\b/i)[0]; if (closer && previewControls(message,/download/i).length) closer.click(); }
      bridge.cancel();button.disabled=false;if (mediaLoadContext===session) {mediaLoadContext=null;nativeAudioInteraction=null;}}
  }
  $('.load-native-media').onclick=()=>loadSelectedMedia();
  // If copying fails (or the message was misread as a file), the bookmark can still be kept without the attachment.
  $('.save-without-file').onclick=()=>{
    if (!pending) return;
    pending.saveWithoutFile=true;pending.mediaNote=`The ${mediaWord(pending.mediaKind)} was not copied. Use Add media to attach it later.`;
    $('.capture-status').textContent='Saving without the file. You can attach it later with Add media.';$('.save').disabled=false;$('.save').focus();
  };
  function showDialog(item, moving = false, source = null) {
    syncTheme();
    mediaLoadContext?.bridge?.cancel();mediaLoadContext=null;
    sourceDebug=describeSource(source);$('.debug-report').hidden=true;$('.debug-report').value='';$('.copy-debug').textContent='Copy debug info';
    pending = item; pendingMoveOnly=moving && !source; pendingSource=source?selectedMessageSource(item,source):null;capturePhase='idle';captureError=''; returnFocus = root.activeElement || sectionRoot.activeElement || document.activeElement;
    $('.preview').textContent = item.text || (item.media.length ? `${item.media.length} media attachment(s)` : item.mediaKind==='audio'?'Voice message':item.mediaKind==='video'?'Video message':item.mediaKind==='document'?'Document':'Message');
    $('#wab-title').textContent = moving ? 'Move bookmark' : 'Bookmark message';
    $('#wab-collection').value = moving && item.collection !== 'Unnamed' ? item.collection : '';
    $('#wab-note').value = item.note || '';
    updateCaptureStatus();$('.save').textContent=pendingMoveOnly?'Save collection':'Save bookmark';
    $('.overlay').hidden = false; $('#wab-collection').focus(); renderCollectionOptions(true);
    if (!pendingMoveOnly && CAPTURED_KINDS.includes(item.mediaKind) && !item.media.some(media=>media.kind===item.mediaKind)) void loadSelectedMedia(true);
  }
  function closeDialog() { closeCollectionOptions(); $('.overlay').hidden = true; pending = null; pendingSource = null; mediaLoadContext?.bridge?.cancel(); mediaLoadContext=null; returnFocus?.focus(); }
  async function mediaData(source, audio = false) {
    const response = await fetch(source);
    if (!response.ok) throw new Error('Media unavailable');
    let blob = await response.blob();
    if (audio) {
      const header=new Uint8Array(await blob.slice(0,32).arrayBuffer());
      const type=globalThis.WABMedia.audioType(header,blob.type);
      if (!type) throw new Error('This source is not a recognizable audio file.');
      if (blob.type!==type) blob=new Blob([blob],{type});
    }
    if (blob.size > 25 * 1024 * 1024) throw new Error('Media exceeds 25 MB');
    return new Promise((resolve,reject) => {
      const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(blob);
    });
  }
  // Shared contacts: the DOM shows only a name, so ask the page-world bridge for the vCard and fall back to visible text.
  function parseVCard(card) {
    const unfold = String(card).replace(/\r?\n[ \t]/g,'');
    let name='';const phones=[];
    for (const line of unfold.split(/\r?\n/)) {
      const match=/^([^:]+):(.*)$/.exec(line);if (!match) continue;
      const field=match[1].split(';')[0].toUpperCase().replace(/^ITEM\d+\./,''), value=match[2].trim();
      if (field==='FN' && value) name=value;
      else if (field==='N' && !name) name=value.split(';').filter(Boolean).reverse().join(' ').trim();
      else if (field==='TEL') { const waid=/waid=(\d+)/i.exec(match[1])?.[1]; if (value || waid) phones.push({display:value || '+'+waid,digits:(waid || value).replace(/\D/g,'')}); }
    }
    return name || phones.length ? {name:name || phones[0].display,phones:phones.filter((phone,index,all)=>all.findIndex(other=>other.digits===phone.digits)===index)} : null;
  }
  function readVCards(messageId) {
    if (!messageId) return Promise.resolve([]);
    return new Promise(resolve=>{
      const requestId=crypto.randomUUID();
      const done=value=>{window.removeEventListener('message',listener);clearTimeout(timer);resolve(value);};
      const listener=event=>{
        if (event.source!==window || event.origin!=='https://web.whatsapp.com' || event.data?.type!=='WAB_CONTACT_RESULT' || event.data.requestId!==requestId) return;
        if (Array.isArray(event.data.keys) && event.data.keys.length) console.debug('[WhatsApp Bookmarks] contact fields',event.data.keys);
        done(Array.isArray(event.data.vcards)?event.data.vcards.filter(card=>typeof card==='string'):[]);
      };
      const timer=setTimeout(()=>done([]),1500);
      window.addEventListener('message',listener);
      window.postMessage({type:'WAB_CONTACT_READ',requestId,messageId},'https://web.whatsapp.com');
    });
  }
  function domContact(message) {
    const hasAction=[...message.querySelectorAll('button, [role="button"]')].some(node=>/^(message|view all|add to group|view contact)$/i.test((node.textContent || '').trim()));
    if (!hasAction || message.querySelector('audio, video')) return null;
    const text=(message.innerText || '').split('\n').map(line=>line.trim()).filter(Boolean);
    const name=text.find(line=>!/^(message|view all|add to group|view contact|\d{1,2}:\d{2}(\s?[ap]m)?)$/i.test(line));
    const phones=[...new Set(text.join(' ').match(/\+?\d[\d\s().-]{7,}\d/g) || [])].map(display=>({display:display.trim(),digits:display.replace(/\D/g,'')})).filter(phone=>phone.digits.length>=8);
    return name ? {name,phones} : null;
  }
  async function readContacts(message, messageId) {
    const fallback=domContact(message);
    if (!fallback) return []; // Only contact cards pay for the page-world lookup.
    const contacts=(await readVCards(messageId)).map(parseVCard).filter(Boolean);
    return contacts.length?contacts:[fallback];
  }
  async function capture(message) {
    if (!message?.isConnected) { toast('Open a message’s menu and choose Bookmark.'); return; }
    try {
      // Read the reference before awaiting storage or media: WhatsApp can unmount
      // headers and virtualized messages while the collection dialog is opening.
      const live = messageReference(message), remembered = messageContexts.get(message) || {};
      const messageId = remembered.messageId || live.messageId;
      const chat = remembered.chat || live.chat;
      const chatId = remembered.chatId || live.chatId;
      const meta = (message.matches('[data-pre-plain-text]') ? message : message.querySelector('[data-pre-plain-text]'))?.getAttribute('data-pre-plain-text') || '';
      const textNodes = [...message.querySelectorAll('.selectable-text')].filter(node => !node.parentElement.closest('.selectable-text'));
      const text = textNodes.map(node => node.innerText).filter(Boolean).join('\n');
      const contacts = await readContacts(message, messageId);
      await reload();
      const existing = messageId && items.find(item => item.messageId === messageId);

      const expectedKind=messageMediaKind(message);
      // Open the dialog before waiting on audio/video I/O. The automatic loader
      // owns the deadline, retry state, and source-element recovery.
      const collected=expectedKind?{media:[],mediaKind:expectedKind,mediaNote:''}:await mediaDeadline(collectMessageMedia(message),15000);
      const {media,mediaKind,mediaNote}=collected;
      const usable=media.length?media:(existing?.media || []).filter(item=>!mediaKind || item.kind===mediaKind);
      showDialog({ ...existing, id:existing?.id || crypto.randomUUID(), messageId, text:contacts.length?'':text || existing?.text || '', contacts:contacts.length?contacts:existing?.contacts || [], meta, chat:chat || existing?.chat || '', chatId:chatId || existing?.chatId || '', media:usable, mediaKind:mediaKind || existing?.mediaKind || '', mediaNote:mediaNote || '', savedAt:existing?.savedAt || Date.now(), collection:existing?.collection || 'Unnamed' }, !!existing, message);
    } catch (error) { toast(error.message); }
  }
  $('.close').onclick = () => closeSection(true);
  $('.search').oninput = render; $('.cancel').onclick = closeDialog;
  $('.overlay').onclick = event => { if (event.target === $('.overlay')) closeDialog(); };
  $('.dialog').onsubmit = async event => {
    event.preventDefault(); if (!pending) return;
    const button = $('.save'); button.disabled = true; button.textContent = 'Saving…';
    try {
      if (!pendingMoveOnly && !pending.saveWithoutFile && CAPTURED_KINDS.includes(pending.mediaKind) && !pending.media.some(media=>media.kind===pending.mediaKind)) throw new Error('The selected media has not finished copying.');
      const name = $('#wab-collection').value.trim() || 'Unnamed';
      pending.note = $('#wab-note').value.trim();
      delete pending.saveWithoutFile;
      pending.collection = items.find(item => item.collection.toLocaleLowerCase() === name.toLocaleLowerCase())?.collection || name;
      await request('save', { item: pending }); if (viewedItem?.id === pending.id) { viewedItem = {...pending}; renderSavedViewer(viewedItem); } closeDialog(); await reload(); toast('Bookmark saved');
    } catch (error) { toast(error.message); }
    finally { if (pending) updateCaptureStatus(); else button.disabled=false; button.textContent=pendingMoveOnly?'Save collection':'Save bookmark'; }
  };
  function handleKeydown(event) {
    if (event.key === 'Escape') { if (!$('.overlay').hidden) closeDialog(); else closeSection(true); }
    if (event.key === 'Tab' && !$('.overlay').hidden) {
      const controls = [...$('.dialog').querySelectorAll('input,button,textarea')].filter(node => !node.disabled && node.tabIndex !== -1 && !node.closest('[hidden]'));
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && root.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && root.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  }
  root.addEventListener('keydown', handleKeydown);
  sectionRoot.addEventListener('keydown', handleKeydown);
  chrome.runtime.onMessage.addListener(message => {
    if (message.action === 'open') open();
    if (message.action === 'capture-context') capture(contextMessage);
  });
  // Capture the message before WhatsApp portals its menu outside the chat.
  function resolveMessage(target) {
    const container = target?.closest?.(messageSelector);
    if (container) return container.querySelector('.message-in, .message-out') || container;
    // Message ID formats and outer wrappers differ across WhatsApp versions.
    if (!target?.closest?.('#main')) return null;
    const identified = target.closest('[data-id], [data-testid="msg-container"], [role="row"]');
    if (identified) return identified;
    for (let node = target; node && node.id !== 'main'; node = node.parentElement) {
      if (node.querySelectorAll('[data-pre-plain-text]').length === 1) return node;
    }
    return null;
  }
  document.addEventListener('pointerdown',event=>{
    const message=resolveMessage(event.target);if (!message) return;
    const play=event.target.closest?.('button, [role="button"], [data-icon]');
    const marker=[play?.getAttribute('aria-label'),play?.getAttribute('data-icon'),play?.querySelector('[data-icon]')?.getAttribute('data-icon')].join(' ');
    if (/play/i.test(marker) && messageMediaKind(message)) nativeAudioInteraction={message,kind:messageMediaKind(message),at:Date.now()};
  },true);
  function capturePlayingAudio(event) {
    const node=event.target;if (!['AUDIO','VIDEO'].includes(node.tagName)) return;
    const kind=node.tagName==='VIDEO'?'video':'audio';
    const inline=resolveMessage(node);
    const message=inline || (mediaLoadContext?.kind===kind ? mediaLoadContext.message : null) || (event.type==='play' && nativeAudioInteraction && (nativeAudioInteraction.kind || 'audio')===kind && Date.now()-nativeAudioInteraction.at<3000 ? nativeAudioInteraction.message : null);
    const source=node.currentSrc || node.src || node.querySelector('source')?.src;
    if (!message || !source || !/^(blob:|https:|data:)/.test(source)) return;
    if (capturedAudio.get(message)?.done) return; // Never replace a finished copy with a new attempt.
    if (!inline) nativeAudioInteraction=null;
    const copy=mediaData(source,kind==='audio').catch(()=>null);const entry={messageId:messageReference(message).messageId,kind,copy};capturedAudio.set(message,entry);copy.then(data=>{if (data) entry.done=true;});
  }
  document.addEventListener('play',capturePlayingAudio,true);
  document.addEventListener('loadedmetadata',capturePlayingAudio,true);
  function rememberMessage(event) {
    const message = resolveMessage(event.target);
    if (message) { menuMessage = message; menuInteractionAt = Date.now(); messageContexts.set(message, messageReference(message)); }
    // Do not clear the target when interacting with the portaled menu.
    // A new message interaction always replaces it before a new menu opens.
  }
  document.addEventListener('pointerdown', rememberMessage, true);
  document.addEventListener('click', rememberMessage, true);
  document.addEventListener('focusin', rememberMessage, true);
  document.addEventListener('pointerover', event => {
    const message = resolveMessage(event.target);
    if (message) hoveredMessage = message;
  }, true);
  document.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ' || (event.shiftKey && event.key === 'F10')) rememberMessage(event);
  }, true);
  document.addEventListener('contextmenu', event => {
    contextMessage = resolveMessage(event.target);
    if (contextMessage) { menuMessage = contextMessage; menuInteractionAt = Date.now(); messageContexts.set(contextMessage, messageReference(contextMessage)); }
  }, true);

  function attachNavigation() {
    if (document.querySelector('.wab-nav-button')) return;
    const anchor = document.querySelector('[aria-label="Communities"], [title="Communities"], [data-icon="community"], [data-icon="communities"], [data-icon="community-outline"]') ||
      document.querySelector('[aria-label="Chats"], [title="Chats"], [data-icon="chats-outline"], [data-icon="chats"]');
    if (!anchor) return;
    const control = anchor.closest('button, [role="button"], [role="tab"]') || anchor;
    let branch = control, group = control.parentElement, found = false;
    for (let depth = 0; group && depth < 5; depth++) {
      if (group.id === 'app' || group.id === 'main' || group === document.body) return;
      if (group.querySelectorAll('button, [role="button"], [role="tab"]').length >= 2) { found = true; break; }
      branch = group; group = group.parentElement;
    }
    if (!found) return;
    const button = el('button', 'wab-nav-button');
    button.type = 'button'; button.title = 'Bookmarks'; button.setAttribute('aria-label', 'Bookmarks');
    button.setAttribute('aria-pressed', String(!$('.panel').hidden));
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('viewBox', '0 0 24 24'); icon.setAttribute('width', '24'); icon.setAttribute('height', '24');
    icon.setAttribute('aria-hidden', 'true'); icon.setAttribute('fill', 'none');
    icon.setAttribute('stroke', 'currentColor'); icon.setAttribute('stroke-width', '1.8');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4Z');
    path.setAttribute('stroke-linejoin', 'round'); icon.append(path); button.append(icon);
    applyTheme(button);
    button.onclick = open;
    // Restore the native pane before WhatsApp processes another navigation item.
    group.addEventListener('click', event => {
      if (!button.contains(event.target) && event.target.closest('button, [role="button"], [role="tab"]')) closeSection();
    }, true);
    // Match the native neighbour's box so the icon centres in the same column, whatever the layout.
    const slot = el('div', 'wab-nav-slot');
    const box = branch.getBoundingClientRect(), style = getComputedStyle(branch);
    if (box.width > 0 && box.height > 0) { slot.style.width = box.width + 'px'; slot.style.height = box.height + 'px'; }
    if (style.margin) slot.style.margin = style.margin;
    if (style.alignSelf && style.alignSelf !== 'auto') slot.style.alignSelf = style.alignSelf;
    slot.append(button); branch.after(slot);
    // Measure the native icon and nudge ours onto the same centre line (WhatsApp's rail layout varies by build).
    const alignToNative = () => {
      if (!button.isConnected || !control.isConnected) return;
      button.style.transform = '';
      const nativeIcon = control.querySelector('svg, [data-icon], img') || control;
      const target = nativeIcon.getBoundingClientRect(), mine = button.getBoundingClientRect();
      if (!target.width || !mine.width) return;
      const dx = (target.left + target.width / 2) - (mine.left + mine.width / 2);
      if (Math.abs(dx) > 0.5 && Math.abs(dx) < 80) button.style.transform = `translateX(${dx.toFixed(1)}px)`;
    };
    requestAnimationFrame(alignToNative); setTimeout(alignToNative, 400); setTimeout(alignToNative, 1500);
    window.addEventListener('resize', alignToNative);
  }

  const menuActionSelector = '[role="menuitem"], [role="button"], button, li, [data-animate-dropdown-item], [data-testid^="mi-msg-"]';
  function isMessageAction(node) {
    const label = (node.getAttribute('aria-label') || node.innerText || node.textContent || '').trim().split('\n')[0].trim();
    return /^(reply|forward)(?: (?:to )?message)?$/i.test(label) ||
      /mi-msg-(reply|forward)/.test(node.getAttribute('data-testid') || '') ||
      !!node.querySelector('[data-icon*="reply"], [data-icon*="forward"]');
  }
  function actionLabel(node) {
    return (node.getAttribute('aria-label') || node.innerText || node.textContent || '').trim().split('\n')[0].trim().toLowerCase();
  }
  function unlabelledMenus() {
    // Some builds render the entire dropdown with plain DIVs and SPANs. Detect
    // small groups of action labels without depending on React class names.
    const labels = /^(reply|forward|copy|star|unstar|delete|message info|select|select messages|react|pin|reply privately)$/;
    const actions = [...document.querySelectorAll('div, span, button, li')].filter(node =>
      node.childElementCount <= 1 && node.textContent.length < 80 && labels.test(actionLabel(node)) &&
      !node.closest(messageSelector) && !node.closest('#wab-section-host') && node.getClientRects().length);
    const menus = new Set();
    for (const action of actions) {
      for (let parent = action.parentElement, depth = 0; parent && depth < 6; parent = parent.parentElement, depth++) {
        if (parent === document.body || parent.id === 'app' || parent.id === 'main' || parent.querySelector(messageSelector)) break;
        const contained = actions.filter(node => parent.contains(node));
        const names = new Set(contained.map(actionLabel));
        const rect = parent.getBoundingClientRect();
        if ((names.has('reply') || names.has('forward') || names.has('reply privately')) && names.size >= 2 && rect.width <= 500 && rect.height <= 900) {
          menus.add(parent); break;
        }
      }
    }
    return menus;
  }
  function menuCandidates() {
    const menus = new Set(document.querySelectorAll(menuSelector));
    // Some WhatsApp versions expose only a UL or an application portal, without
    // role=menu or data-animate-dropdown-popup. Find those from their actions.
    for (const action of document.querySelectorAll(menuActionSelector)) {
      if (action.closest('#wab-section-host') || !isMessageAction(action)) continue;
      const list = action.closest('ul, [role="list"], [role="menu"]');
      if (list && !list.querySelector(messageSelector)) { menus.add(list); continue; }
      let parent = action.parentElement;
      for (let depth = 0; parent && depth < 4; depth++, parent = parent.parentElement) {
        if (parent === document.body || parent.id === 'app' || parent.id === 'main' || parent.matches(messageSelector)) break;
        const actions = [...parent.querySelectorAll(menuActionSelector)];
        // Require distinct message-menu actions, not an in-message forward icon.
        if (actions.some(node => /^(copy|delete|star|unstar|message info|select|react|pin)(?: message)?$/i.test((node.getAttribute('aria-label') || node.textContent || '').trim())) ||
            new Set(actions.filter(isMessageAction).map(node => (node.getAttribute('aria-label') || node.textContent || '').trim().toLowerCase())).size > 1) {
          menus.add(parent); break;
        }
      }
    }
    const recognized = [...menus].some(menu => [...menu.querySelectorAll(menuActionSelector)].some(isMessageAction));
    if (!recognized && Date.now() - menuInteractionAt < 5000) {
      for (const menu of unlabelledMenus()) menus.add(menu);
    }
    return [...menus].sort((a,b) => a.contains(b) ? 1 : b.contains(a) ? -1 : 0);
  }
  function nativeMenuRow(action, menu) {
    const listRow = action.closest('li, [data-animate-dropdown-item]');
    if (listRow && menu.contains(listRow)) return listRow;
    let row = action.closest('[role="menuitem"], [role="button"], button') || action;
    if (!menu.contains(row) || row === menu) row = action;
    while (row.parentElement && row.parentElement !== menu) {
      const parent = row.parentElement;
      const labels = [...parent.querySelectorAll('div, span, button, li')].map(actionLabel);
      if (new Set(labels.filter(label => /^(reply|forward|star|unstar|copy|delete|reply privately)$/.test(label))).size > 1) break;
      row = parent;
    }
    return row;
  }
  function nativeBookmarkRow(template) {
    // Clone markup and CSS classes, but not WhatsApp's Star/Reply event handlers.
    const row = template.cloneNode(true);
    row.classList.add('wab-menu-item', 'wab-native-menu-item');
    const originalLabel = actionLabel(template);
    const walker = document.createTreeWalker(row, NodeFilter.SHOW_TEXT);
    const texts = []; while (walker.nextNode()) texts.push(walker.currentNode);
    let replaced = false;
    for (const node of texts) {
      if (node.parentElement?.closest('svg, [data-icon]')) continue;
      const text = node.textContent.trim().toLowerCase();
      if (/^(star|unstar|reply|forward|reply privately)(?: message)?$/.test(text) || text === originalLabel) {
        node.textContent = replaced ? '' : 'Bookmark'; replaced = true;
      } else if (/ctrl|alt|shift|⌘|⇧|↵/i.test(text)) node.textContent = '';
    }
    // Icon-only toolbars (the image/PDF viewer) have no visible label to replace, so don't add one; the tooltip names the button.
    const hadVisibleText = texts.some(node => !node.parentElement?.closest('svg, [data-icon]') && node.textContent.trim());
    if (!replaced && hadVisibleText) row.append(el('span', '', 'Bookmark'));
    for (const node of [row, ...row.querySelectorAll('*')]) {
      for (const attr of [...node.attributes]) {
        if (['id', 'data-testid', 'aria-disabled', 'aria-checked', 'aria-pressed', 'aria-describedby', 'aria-labelledby', 'aria-controls', 'disabled'].includes(attr.name) || attr.name.startsWith('on')) node.removeAttribute(attr.name);
      }
      if (node.hasAttribute('aria-label')) node.setAttribute('aria-label', 'Bookmark');
      if (node.hasAttribute('title')) node.setAttribute('title', 'Bookmark');
      if (node.hasAttribute('tabindex')) node.tabIndex = -1;
    }
    const control = row.querySelector('button, [role="button"], [role="menuitem"]') || row;
    control.setAttribute('role', 'menuitem'); control.setAttribute('aria-label', 'Bookmark'); control.tabIndex = 0; if (!hadVisibleText) control.title = 'Bookmark';
    if (row !== control) { row.setAttribute('role', 'none'); row.removeAttribute('tabindex'); }
    const icon = row.querySelector('[data-icon], svg');
    if (icon) {
      const original = template.querySelector('svg') || template.querySelector('[data-icon]');
      const bounds = original?.getBoundingClientRect?.();
      const dimension = axis => {
        const measured = bounds?.[axis] || parseFloat(original?.getAttribute(axis));
        return measured >= 12 && measured <= 32 ? measured : 18;
      };
      const width = dimension('width'), height = dimension('height');
      const svg = bookmarkGlyph(width, height);
      svg.style.width = width + 'px'; svg.style.height = height + 'px'; svg.style.verticalAlign = 'middle';
      if (icon.tagName.toLowerCase() === 'svg') { svg.setAttribute('class', icon.getAttribute('class') || ''); icon.replaceWith(svg); }
      else { icon.removeAttribute('data-icon'); icon.replaceChildren(svg); }
    }
    row.style.removeProperty('opacity'); row.style.removeProperty('transform');
    return { row, control };
  }
  function attachMessageMenus() {
    for (const menu of menuCandidates()) {
      const message = resolveMessage(menu) || (menuMessage?.isConnected ? menuMessage : hoveredMessage);
      const existing = menu.querySelector('.wab-menu-item');
      if (existing) continue;
      const entries = [...menu.querySelectorAll(menuActionSelector + ', div, span')];
      const reply = entries.find(node => /^(reply|forward|reply privately)$/.test(actionLabel(node))) || entries.find(isMessageAction);
      if (!reply) continue;
      const star = entries.find(node => /^(star|unstar)(?: message)?$/.test(actionLabel(node)));
      const template = nativeMenuRow(star || reply, menu);
      const { row:button, control } = nativeBookmarkRow(template);
      applyTheme(button);
      menuTargets.set(button, message);
      const activate = event => {
        event.preventDefault(); event.stopPropagation();
        const target = menuTargets.get(button) || resolveMessage(document.activeElement) || hoveredMessage;
        if (!target?.isConnected) {
          toast('Move the pointer over the original message, then reopen its menu to bookmark it.');
          return;
        }
        // Never send Escape here: WhatsApp treats it as "close this chat", which unmounts the message being bookmarked.
        for (const type of ['pointerdown','mousedown','pointerup','mouseup']) document.body.dispatchEvent(new (globalThis.MouseEvent || Event)(type, { bubbles:true }));
        document.body.click();
        capture(target);
      };
      button.addEventListener('click', activate);
      button.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') activate(event);
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
          event.preventDefault(); event.stopPropagation();
          const sibling = event.key === 'ArrowUp' ? button.previousElementSibling : button.nextElementSibling;
          (sibling?.querySelector('button, [role="button"], [role="menuitem"], [tabindex]') || sibling)?.focus();
        }
      });
      template.after(button);
      template.addEventListener('keydown', event => {
        if (event.key === 'ArrowDown' && template.nextElementSibling === button) {
          event.preventDefault(); event.stopPropagation(); control.focus();
        }
      }, true);
      button.nextElementSibling?.addEventListener('keydown', event => {
        if (event.key === 'ArrowUp') { event.preventDefault(); event.stopPropagation(); control.focus(); }
      }, true);
    }
  }

  let currentTheme = {};
  const themeSources = new WeakSet();
  const themeObserver = new MutationObserver(() => syncTheme());
  const systemTheme = matchMedia('(prefers-color-scheme: dark)');
  systemTheme.addEventListener('change', () => syncTheme());
  function detectDarkTheme() {
    const surface = document.querySelector('#side') || document.querySelector('#app') || document.body;
    const chain = [];
    for (let node = surface; node; node = node.parentElement) chain.push(node);
    for (const node of chain) {
      const hint = [node.getAttribute('data-theme'), node.getAttribute('data-color-scheme'), ...node.classList].filter(Boolean).join(' ');
      if (/(^|[\s-])dark($|[\s-])/i.test(hint)) return true;
      if (/(^|[\s-])light($|[\s-])/i.test(hint)) return false;
    }
    for (const node of chain) {
      const style = getComputedStyle(node);
      const rgb = style.backgroundColor.match(/[\d.]+/g)?.map(Number);
      if (rgb?.length >= 3 && (rgb.length < 4 || rgb[3] > 0.5)) {
        return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722 < 128;
      }
      if (style.colorScheme === 'dark') return true;
      if (style.colorScheme === 'light') return false;
    }
    return systemTheme.matches;
  }
  function applyTheme(node) {
    for (const [key, value] of Object.entries(currentTheme)) node.style.setProperty('--wab-' + key, value);
  }
  function syncTheme() {
    const dark = detectDarkTheme();
    const next = dark ? {
      list:'#0b141a', bubble:'#202c33', outgoing:'#005c4b', 'color-scheme':'dark', surface:'#111b21', text:'#e9edef', muted:'#aebac1', field:'#202c33', hover:'#202c33',
      border:'#2a3942', selected:'#0a332c', accent:'#00d49b', 'on-accent':'#06231c', 'primary-button':'#008069', scrim:'#0009', toast:'#233138', active:'#2a3942'
    } : {
      list:'#f0f2f5', bubble:'#fff', outgoing:'#d9fdd3', 'color-scheme':'light', surface:'#fff', text:'#111b21', muted:'#667781', field:'#f0f2f5', hover:'#f0f2f5',
      border:'#e9edef', selected:'#d9fdd3', accent:'#008069', 'on-accent':'#ffffff', 'primary-button':'#008069', scrim:'#102d2866', toast:'#e9edef', active:'#d9dbdf'
    };
    const changed = next['color-scheme'] !== currentTheme['color-scheme'];
    currentTheme = next;
    if (changed) {
      applyTheme(host); applyTheme(sectionHost); applyTheme(viewerHost);
      document.querySelectorAll('.wab-nav-button, .wab-menu-item').forEach(applyTheme);
    }
    let source = document.querySelector('#side') || document.querySelector('#app') || document.body;
    while (source) {
      if (!themeSources.has(source)) {
        themeSources.add(source);
        themeObserver.observe(source, { attributes:true, attributeFilter:['class', 'style', 'data-theme', 'data-color-scheme'] });
      }
      source = source.parentElement;
    }
  }
  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return; scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      if (!$('.panel').hidden) {
        if (!contentRegion?.isConnected || !sectionHost.isConnected) closeSection();
        else concealNativeContent();
      }
      if (!viewerHost.hidden) {
        if (!viewerRegion?.isConnected || !viewerHost.isConnected) { if (!placeViewerFixed()) closeSavedViewer(); } // WhatsApp replaced the pane: keep the message on screen.
        else { concealConversation(); if (viewerFixed || !viewerReachable()) placeViewerFixed(); }
      }
      syncTheme(); attachNavigation(); attachMessageMenus();
    });
  });
  observer.observe(document.body, { childList:true, subtree:true, attributes:true, attributeFilter:['role', 'data-animate-dropdown-popup', 'hidden'] });
  syncTheme(); attachNavigation(); attachMessageMenus();
})();
