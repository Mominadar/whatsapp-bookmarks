// Runs in the page world so detached Audio() players are observable too.
(() => {
  'use strict';
  const originalPlay = HTMLMediaElement.prototype.play;
  const nativeFetch = window.fetch.bind(window);
  const Anchor = typeof HTMLAnchorElement === 'undefined' ? null : HTMLAnchorElement, Target = typeof EventTarget === 'undefined' ? null : EventTarget;
  const originalAnchorClick = Anchor?.prototype.click, originalDispatch = Target?.prototype.dispatchEvent, originalOpen = window.open;
  // While a document capture is armed, keep the Blob behind each object URL: download code often revokes the URL
  // straight after clicking it, which would leave nothing to read.
  const originalCreateObjectURL = typeof URL === 'undefined' ? null : URL.createObjectURL;
  const blobsByUrl = new Map();
  if (originalCreateObjectURL) URL.createObjectURL = function(object) {
    const url = Reflect.apply(originalCreateObjectURL, URL, [object]);
    if (active?.kind === 'document' && typeof Blob !== 'undefined' && object instanceof Blob) {
      blobsByUrl.set(url, object);
      if (blobsByUrl.size > 20) blobsByUrl.delete(blobsByUrl.keys().next().value);
    }
    return url;
  };
  let active = null;
  const send = (request, type, extra = {}) => window.postMessage({type, requestId:request.id, ...extra}, location.origin);
  function dispose(request) {
    if (!request) return;
    request.cancelled = true;
    if (request.kind === 'document') blobsByUrl.clear();
    clearTimeout(request.expiry);
    for (const cleanup of request.cleanups) cleanup();
    request.cleanups.clear();
    if (active === request) active = null;
  }
  const note = (request, text) => send(request,'WAB_MEDIA_CAPTURE_TRACE',{note:text});
  function watch(player, request) {
    const kind = player.tagName === 'VIDEO' ? 'video' : player.tagName === 'AUDIO' ? 'audio' : '';
    if (!request || request.cancelled || kind !== request.kind || request.players.has(player)) return;
    request.players.add(player);
    note(request,`watching ${player.tagName} scheme=${(player.currentSrc||player.src||'none').split(':')[0]} ready=${player.readyState} paused=${player.paused}`);
    const wasPaused = player.paused, wasMuted = player.muted;
    const initialTime = player.currentTime;
    player.muted = true;
    let timer, fetching = false, finished = false;
    const cleanup = () => {
      if (finished) return; finished = true;
      clearInterval(timer); player.removeEventListener('loadedmetadata', copy); player.removeEventListener('canplay', copy);
      if (wasPaused) {
        try { player.pause(); if (Number.isFinite(initialTime)) player.currentTime = initialTime; } catch { /* Player may have been disposed. */ }
      }
      player.muted = wasMuted;
    };
    request.cleanups.add(cleanup);
    async function copy() {
      if (fetching || finished || request.cancelled) return;
      const source = player.currentSrc || player.src || player.querySelector?.('source')?.src;
      if (!source || !/^(blob:|data:|https:)/.test(source)) return;
      fetching = true;
      try {
        const response = await nativeFetch(source);
        if (!response.ok) throw new Error('WhatsApp media could not be read.');
        const blob = await response.blob();
        if (!blob.size) throw new Error('WhatsApp returned an empty media file.');
        if (blob.size > 25 * 1024 * 1024) throw new Error('This media file exceeds the 25 MB limit.');
        const data = await new Promise((resolve,reject) => {
          const reader = new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('Could not copy the selected media.'));reader.readAsDataURL(blob);
        });
        if (!request.cancelled) send(request,'WAB_MEDIA_CAPTURE_RESULT',{kind,data});
        cleanup();
      } catch(error) {
        note(request,'copy failed: '+error.message);if (!request.cancelled) send(request,'WAB_MEDIA_CAPTURE_ERROR',{error:error.message});
        cleanup();
      }
    }
    player.addEventListener('loadedmetadata',copy);player.addEventListener('canplay',copy);
    timer=setInterval(copy,100);copy();
  }
  // Documents have no player: WhatsApp saves them by clicking a download link. While a document capture is armed,
  // read that link's bytes ourselves and suppress the real download.
  function interceptDownload(anchor, request) {
    const url = anchor.href || '';
    if (!request || request.cancelled || request.kind !== 'document' || request.documentTaken) return false;
    note(request, `anchor click scheme=${url.split(':')[0] || 'none'} download=${anchor.hasAttribute('download')}`);
    if (!/^(blob:|data:|https:)/.test(url) || !(anchor.hasAttribute('download') || url.startsWith('blob:'))) return false;
    request.documentTaken = true;
    note(request, 'watching document download');
    const name = anchor.getAttribute('download') || '';
    (async () => {
      try {
        let blob = blobsByUrl.get(url);
        if (!blob) {
          const response = await nativeFetch(url);
          if (!response.ok) throw new Error('WhatsApp document could not be read.');
          blob = await response.blob();
        }
        if (!blob.size) throw new Error('WhatsApp returned an empty document.');
        if (blob.size > 25 * 1024 * 1024) throw new Error('This file exceeds the 25 MB limit.');
        const data = await new Promise((resolve,reject) => {
          const reader = new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('Could not copy the selected document.'));reader.readAsDataURL(blob);
        });
        if (!request.cancelled) send(request,'WAB_MEDIA_CAPTURE_RESULT',{kind:'document',data,name,mime:blob.type});
      } catch(error) {
        request.documentTaken = false;
        note(request,'document copy failed: '+error.message);
        if (!request.cancelled) send(request,'WAB_MEDIA_CAPTURE_ERROR',{error:error.message});
      }
    })();
    return true;
  }
  if (Anchor) Anchor.prototype.click = function(...args) {
    if (active?.kind === 'document' && interceptDownload(this, active)) return undefined;
    return Reflect.apply(originalAnchorClick, this, args);
  };
  if (Target) Target.prototype.dispatchEvent = function(event) {
    if (active?.kind === 'document' && event?.type === 'click' && Anchor && this instanceof Anchor && interceptDownload(this, active)) return true;
    return Reflect.apply(originalDispatch, this, [event]);
  };
  if (typeof originalOpen === 'function') window.open = function(url, ...rest) {
    if (active?.kind === 'document' && typeof url === 'string' && /^blob:/.test(url)) {
      const probe = document.createElement('a'); probe.href = url;
      if (interceptDownload(probe, active)) return null;
    }
    return Reflect.apply(originalOpen, window, [url, ...rest]);
  };
  HTMLMediaElement.prototype.play = function(...args) {
    if (active) watch(this,active);
    return Reflect.apply(originalPlay,this,args);
  };
  // Autoplaying or viewer-hosted players may never call play(), so also catch them by media events.
  for (const type of ['loadedmetadata','loadeddata','canplay','playing'])
    window.addEventListener(type,event=>{ if (active && event.target instanceof HTMLMediaElement) watch(event.target,active); },true);
  // Shared-contact cards only show a name in the DOM; the vCard (with numbers) lives in WhatsApp's React props.
  function readContacts(messageId) {
    const node=[...document.querySelectorAll('[data-id]')].find(item=>item.getAttribute('data-id')===messageId);
    const result={vcards:[],keys:[]};
    if (!node) return result;
    const seen=new Set(), found=new Set();
    const isPlain=value=>value && typeof value==='object' && !(value instanceof Node) && !(value instanceof Window);
    // Bounded breadth-first search through React fiber props and any message model they reference.
    const queue=[];
    const roots=[];
    for (const key of Object.keys(node)) if (key.startsWith('__reactProps$')) roots.push(node[key]);
    let fiber=null;
    for (const key of Object.keys(node)) if (key.startsWith('__reactFiber$')) fiber=node[key];
    for (let step=0; fiber && step<40; step++, fiber=fiber.return) { roots.push(fiber.memoizedProps); if (fiber.stateNode && isPlain(fiber.stateNode) && !(fiber.stateNode instanceof Element)) roots.push(fiber.stateNode.props); }
    roots.forEach(root=>queue.push([root,0]));
    let visited=0;
    while (queue.length && visited<6000 && found.size<10) {
      const [value,depth]=queue.shift();
      if (typeof value==='string') { if (/BEGIN:VCARD/i.test(value)) found.add(value.slice(0,4000)); continue; }
      if (!isPlain(value) || seen.has(value) || depth>7) continue;
      seen.add(value);visited++;
      let names=[];try {names=Object.keys(value);} catch {continue;}
      if (result.keys.length<40 && names.some(name=>/vcard|contact/i.test(name))) result.keys.push(names.slice(0,25).join(','));
      for (const name of names) {
        if (/^(_owner|_debugOwner|return|alternate|child|sibling|stateNode|ref|_store|__proto__)$/.test(name)) continue;
        let child;try {child=value[name];} catch {continue;}
        if (typeof child==='string' || isPlain(child)) queue.push([child,depth+1]);
      }
    }
    result.vcards=[...found];
    return result;
  }
  window.addEventListener('message',event=>{
    if (event.source !== window || event.origin !== location.origin) return;
    const data=event.data;
    if (data?.type==='WAB_CONTACT_READ' && typeof data.requestId==='string' && typeof data.messageId==='string' && data.messageId.length<200) {
      window.postMessage({type:'WAB_CONTACT_RESULT',requestId:data.requestId,...readContacts(data.messageId)},location.origin);
      return;
    }
    if (data?.type==='WAB_MEDIA_CAPTURE_CANCEL' && active?.id===data.requestId) {dispose(active);return;}
    if (data?.type!=='WAB_MEDIA_CAPTURE_ARM' || typeof data.requestId!=='string' || data.requestId.length>100 || !['audio','video','document'].includes(data.kind)) return;
    dispose(active);
    const request={id:data.requestId,kind:data.kind,players:new WeakSet(),cleanups:new Set(),cancelled:false};
    active=request;request.expiry=setTimeout(()=>dispose(request),Math.min(Math.max(Number(data.timeout)||15000,15000),120000));
    // Players created before this request, or whose events were missed, are found by polling.
    const scan=setInterval(()=>{ if (request.kind !== 'document') for (const player of document.querySelectorAll(request.kind)) if (player.currentSrc || player.src) watch(player,request); },300);
    request.cleanups.add(()=>clearInterval(scan));
    send(request,'WAB_MEDIA_CAPTURE_READY');
  });
})();
