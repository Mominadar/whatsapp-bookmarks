import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { Blob, Buffer } from 'node:buffer';
import { TextEncoder } from 'node:util';

export async function runRegressionTests({ parseHTML, NodeFilter }) {
  const navigationSource = await readFile(new URL('../navigation.js', import.meta.url), 'utf8');
  const contentSource = await readFile(new URL('../content.js', import.meta.url), 'utf8');
  const mediaSource = await readFile(new URL('../media.js', import.meta.url), 'utf8');
  const messageId = 'false_123@c.us_ABCDEF';
  const message = (id, text) => `<div data-id="${id}"><div class="message-in"><div data-pre-plain-text="[10:00, 11/5/2026] Alice: "><span class="selectable-text">${text}</span></div></div></div>`;
  const settle = () => new Promise(resolve => setTimeout(resolve, 30));
  const waitUntil = async read => {
    const deadline=Date.now()+2000;
    while (!read() && Date.now()<deadline) await new Promise(resolve=>setTimeout(resolve,10));
  };
  const results = [];

  function fixture() {
    const { window, document } = parseHTML(`<!doctype html><html class="dark"><head></head><body><div id="app"><nav><button aria-label="Chats">Chats</button><button aria-label="Communities">Communities</button></nav><section class="list-pane"><div id="side"><span title="Alice">Alice</span></div></section><main id="main"><header><span title="Alice">Alice</span><button aria-label="Search"><span data-icon="search"></span></button></header>${message(messageId, 'Keep this message')}</main></div></body></html>`);
    const shadows = new Map(), saved = [], runtimeListeners = [], audioBlobs = new Map(), revokedURLs = [];
    let urlCounter=0;
    const originalAttach = window.Element.prototype.attachShadow;
    window.Element.prototype.attachShadow = function(options) { const shadow = originalAttach.call(this, options); shadows.set(this.id, shadow); return shadow; };
    window.HTMLElement.prototype.getClientRects = function() { return this.hidden ? [] : [{}]; };
    window.HTMLElement.prototype.getBoundingClientRect = function() {
      const sidebar=this.id==='side' || this.className==='list-pane';
      const right=this.id==='main' || this.tagName==='MAIN';
      const left=right?444:sidebar?64:0,width=this.id==='app'?1200:sidebar?380:right?756:240;
      return {left,right:left+width,top:0,bottom:600,width,height:600};
    };
    window.HTMLElement.prototype.scrollIntoView = function() { this.scrolled = true; };
    window.HTMLElement.prototype.animate = function() { this.highlighted = true; return {}; };
    window.HTMLElement.prototype.focus = function() { document.activeElement = this; };
    document.activeElement = document.body;
    const context = vm.createContext({
      document, window, NodeFilter, HTMLInputElement:window.HTMLInputElement,
      InputEvent:window.Event, KeyboardEvent:window.Event, Event:window.Event,
      MutationObserver:window.MutationObserver, AbortController,
      FileReader:class { async readAsDataURL(file) {this.result=file.data || `data:${file.type};base64,${Buffer.from(await file.arrayBuffer()).toString('base64')}`;setTimeout(()=>this.onload(),0);} },
      Blob,TextEncoder,atob:value=>Buffer.from(value,'base64').toString('binary'),
      URL:{createObjectURL(blob){const url='blob:saved-'+(++urlCounter);audioBlobs.set(url,blob);return url;},revokeObjectURL(url){revokedURLs.push(url);audioBlobs.delete(url);}},
      DOMException:class extends Error { constructor(message, name) { super(message); this.name = name; } },
      crypto:{randomUUID:() => 'bookmark-' + (saved.length + 1)},
      matchMedia:() => ({matches:true,addEventListener(){}}),
      getComputedStyle:node => ({backgroundColor:'rgb(17, 27, 33)',colorScheme:'dark',overflowY:'auto',position:node.style?.position || 'static'}),
      requestAnimationFrame:fn => setTimeout(fn, 0), setTimeout, clearTimeout, setInterval, clearInterval,
      chrome:{runtime:{onMessage:{addListener(fn){runtimeListeners.push(fn);}},async sendMessage(data) {
        if (data.action === 'save') { saved.push(structuredClone(data.item)); return {ok:true}; }
        return {ok:true,items:saved};
      }}}
    });
    vm.runInContext(navigationSource, context);
    vm.runInContext(mediaSource, context);
    vm.runInContext(contentSource, context);
    return { window, document, context, shadows, saved, audioBlobs, revokedURLs, send:message=>runtimeListeners.forEach(fn=>fn(message)) };
  }

  for (const kind of ['list', 'plain', 'right-click-plain']) {
    const f = fixture();
    let starred = 0;
    f.document.querySelector('.message-in').dispatchEvent(new f.window.Event(kind === 'right-click-plain' ? 'contextmenu' : 'pointerdown', {bubbles:true}));
    const menu = f.document.createElement('div');
    if (kind !== 'right-click-plain') menu.setAttribute('role', 'menu');
    menu.innerHTML = kind === 'list'
      ? '<ul><li class="native-row" data-animate-dropdown-item="true"><div role="button" aria-label="Reply"><span>Reply</span></div></li><li class="native-row" data-animate-dropdown-item="true"><div role="button" aria-label="Star"><span data-icon="star"><svg></svg></span><span class="native-label">Star</span></div></li><li class="native-row"><div role="button">Delete</div></li></ul>'
      : '<div class="native-row"><span>Reply</span></div><div class="native-row"><span data-icon="star"><svg></svg></span><span class="native-label">Star</span></div><div class="native-row"><span>Delete</span></div>';
    const star = [...menu.querySelectorAll('.native-row')].find(node => node.textContent === 'Star');
    star.querySelector('svg').setAttribute('width', '16'); star.querySelector('svg').setAttribute('height', '16');
    star.addEventListener('click', () => starred++);
    f.document.body.append(menu);
    await settle();
    const bookmark = menu.querySelector('.wab-menu-item');
    assert.ok(bookmark, kind + ': bookmark inserted');
    assert.equal(bookmark.parentElement, star.parentElement, 'Bookmark is a native menu sibling');
    assert.equal(bookmark.tagName, star.tagName, 'Native list/row markup retained');
    assert.ok(bookmark.classList.contains('native-row'), 'Native CSS classes retained');
    assert.equal(bookmark.textContent, 'Bookmark');
    assert.equal(bookmark.querySelectorAll('[data-icon="star"]').length, 0);
    assert.equal(bookmark.querySelectorAll('svg').length, 1);
    assert.equal(bookmark.querySelector('svg').getAttribute('width'), '16', 'Bookmark copies the native icon dimensions');
    assert.equal(bookmark.querySelector('svg').style.height, '16px');
    assert.equal(menu.querySelectorAll('.wab-menu-item').length, 1);
    bookmark.click(); await settle();
    const root = f.shadows.get('whatsapp-bookmarks-extension');
    assert.equal(root.querySelector('.overlay').hidden, false);
    assert.equal(root.querySelector('.preview').textContent, 'Keep this message');
    root.querySelector('.dialog').dispatchEvent(new f.window.Event('submit', {bubbles:true,cancelable:true}));
    await settle();
    assert.equal(f.saved[0].messageId, messageId);
    assert.equal(f.saved[0].chatId, '123@c.us');
    assert.equal(starred, 0, 'Bookmark never invokes Star');
    f.document.querySelector('.wab-nav-button').click(); await settle();
    const section = f.shadows.get('wab-section-host');
    // In a 1:1 chat the sender equals the chat name already shown in the card heading, so it is not repeated.
    assert.equal(section.querySelector('.bubble-sender'), null, 'sender not repeated when it equals the chat name');
    assert.equal(section.querySelector('.chat-name').textContent, 'Alice');
    assert.equal(section.querySelector('.message-date').textContent, '11/5/2026');
    assert.equal(section.querySelector('.bubble-meta').textContent, '10:00');
    assert.ok(section.querySelector('.message-bubble'), 'Starred-style message bubble rendered');
    assert.ok(section.querySelector('.entry-menu summary'), 'Bookmark actions are in a contextual menu');
    section.querySelector('.message-preview').click(); await settle();
    const viewer = f.shadows.get('wab-viewer-host');
    assert.equal(viewer.querySelector('.text').textContent, 'Keep this message');
    assert.equal(f.document.querySelector('#wab-viewer-host').parentElement.id, 'main');
    assert.equal(f.document.querySelector('#wab-viewer-host').hidden, false);
    assert.notEqual(f.document.querySelector(`[data-id="${messageId}"]`).scrolled, true);
    assert.equal(f.document.querySelector('#wab-section-host').hidden, false);
    results.push(kind + ' menu styling, bookmark capture, and clickable preview');
  }

  const pickerFixture = fixture();
  pickerFixture.saved.push(
    {id:'work',collection:'Work',chat:'Alice',messageId:'false_123@c.us_WORK',text:'Work note',media:[],savedAt:1},
    {id:'personal',collection:'Personal',chat:'Alice',messageId:'false_123@c.us_PERSONAL',text:'Personal note',media:[],savedAt:2}
  );
  pickerFixture.document.querySelector('.message-in').dispatchEvent(new pickerFixture.window.Event('contextmenu', {bubbles:true}));
  pickerFixture.send({action:'capture-context'}); await settle();
  const pickerRoot = pickerFixture.shadows.get('whatsapp-bookmarks-extension');
  const field = pickerRoot.querySelector('#wab-collection');
  const options = pickerRoot.querySelector('#wab-collection-options');
  assert.equal(options.hidden, false);
  assert.deepEqual([...options.children].map(node=>node.textContent), ['Unnamed','Personal','Work']);
  [...options.children].find(node=>node.textContent==='Work').click();
  assert.equal(field.value, 'Work'); assert.equal(options.hidden, true);
  pickerRoot.querySelector('.dialog').dispatchEvent(new pickerFixture.window.Event('submit', {bubbles:true,cancelable:true})); await settle();
  assert.equal(pickerFixture.saved.at(-1).collection, 'Work', 'An existing collection is reused');
  pickerFixture.document.querySelector('#main').insertAdjacentHTML('beforeend', message('false_123@c.us_NEW', 'Another note'));
  pickerFixture.document.querySelector('[data-id="false_123@c.us_NEW"] .message-in').dispatchEvent(new pickerFixture.window.Event('contextmenu', {bubbles:true}));
  pickerFixture.send({action:'capture-context'}); await settle();
  field.value = 'Per'; field.dispatchEvent(new pickerFixture.window.Event('input'));
  assert.ok([...options.children].some(node=>node.textContent==='Personal'), 'Existing collection names can be searched');
  field.value = 'Trips'; field.dispatchEvent(new pickerFixture.window.Event('input'));
  assert.equal(options.firstElementChild.textContent, 'Create “Trips”');
  const key = value => {const event=new pickerFixture.window.Event('keydown',{bubbles:true,cancelable:true});Object.defineProperty(event,'key',{value});field.dispatchEvent(event);};
  key('ArrowDown'); assert.equal(options.firstElementChild.getAttribute('aria-selected'), 'true');
  key('Enter'); assert.equal(field.value, 'Trips'); assert.equal(options.hidden, true);
  pickerRoot.querySelector('.dialog').dispatchEvent(new pickerFixture.window.Event('submit', {bubbles:true,cancelable:true})); await settle();
  assert.equal(pickerFixture.saved.at(-1).collection, 'Trips');
  pickerFixture.send({action:'capture-context'}); await settle();
  pickerRoot.querySelector('.collection-toggle').click();
  pickerRoot.querySelector('.collection-toggle').click();
  assert.ok([...options.children].some(node=>node.textContent==='Trips'), 'New collections appear when the picker is reopened');
  key('Escape'); assert.equal(options.hidden, true); assert.equal(pickerRoot.querySelector('.overlay').hidden, false, 'Escape closes picker before dialog');
  results.push('existing collection dropdown, filtering, creation, keyboard selection, and reopening');

  const referenceFixture = fixture();
  const newHeader = referenceFixture.document.querySelector('#main header');
  newHeader.outerHTML = '<div role="banner"><span dir="auto">Project room</span><button title="Search">Search</button></div>';
  referenceFixture.document.querySelector('#main [data-id]').removeAttribute('data-id');
  referenceFixture.document.querySelector('.message-in').dispatchEvent(new referenceFixture.window.Event('contextmenu',{bubbles:true}));
  // Simulate WhatsApp unmounting the header while opening the native menu.
  referenceFixture.document.querySelector('[role="banner"]').remove();
  referenceFixture.send({action:'capture-context'}); await settle();
  referenceFixture.shadows.get('whatsapp-bookmarks-extension').querySelector('.dialog').dispatchEvent(new referenceFixture.window.Event('submit',{bubbles:true,cancelable:true}));
  await settle();
  assert.equal(referenceFixture.saved.at(-1)?.chat, 'Project room', 'Plain-text header captured before it unmounts');
  results.push('chat headers without title attributes and stable pre-dialog references');

  const f=fixture();
  const textItem={id:'orphan',text:'Saved without chat information',media:[],collection:'Unnamed',savedAt:Date.now()};
  const imageItem={id:'image',text:'A saved image',media:[{kind:'image',data:'data:image/png;base64,AA=='}],collection:'Photos',savedAt:Date.now()-1};
  const audioItem={id:'audio',text:'',media:[{kind:'audio',data:'data:audio/ogg;base64,AA=='}],collection:'Audio',savedAt:Date.now()-2};
  f.saved.push(textItem,imageItem,audioItem);
  f.document.querySelector('.wab-nav-button').click();await settle();
  const section=f.shadows.get('wab-section-host'),viewer=f.shadows.get('wab-viewer-host');
  const previews=()=>section.querySelectorAll('.message-preview');
  previews()[0].click();await settle();
  assert.equal(viewer.querySelector('.text').textContent,textItem.text,'Orphan bookmarks open from their saved content');
  assert.equal(f.document.querySelector('#main header [title]').getAttribute('title'),'Alice');
  assert.equal(f.document.querySelector('#main header').inert,true);
  previews()[1].click();await settle();
  assert.equal(viewer.querySelector('.saved-image-button img').getAttribute('src'),imageItem.media[0].data);
  viewer.querySelector('.saved-image-button').click();
  assert.equal(viewer.querySelector('.lightbox img').getAttribute('src'),imageItem.media[0].data);
  viewer.querySelector('.lightbox-close').click();assert.equal(viewer.querySelector('.lightbox'),null);
  previews()[2].click();await settle();
  const audio=viewer.querySelector('audio');assert.ok(audio.src.startsWith('blob:'));assert.equal(f.audioBlobs.get(audio.src).type,'audio/ogg');assert.equal(audio.controls,true);assert.equal(audio.preload,'metadata');
  const oldAudioURL=audio.src;
  let paused=false;audio.pause=()=>{paused=true;};
  viewer.querySelector('.viewer-header button').click();
  assert.equal(paused,true,'Closing the viewer stops audio playback');
  assert.ok(f.revokedURLs.includes(oldAudioURL),'Audio URLs are revoked after closing');
  assert.equal(f.document.querySelector('#wab-viewer-host').hidden,true);
  assert.equal(f.document.querySelector('#main header').inert,undefined,'Original conversation accessibility is restored');
  assert.equal(f.document.querySelector('#main').classList.contains('wab-viewer-open'),false);
  results.push('saved text without references, expandable images, audio controls, and conversation restoration');

  const missing={id:'missing',text:'',media:[],mediaNote:'Audio was not available to copy.',collection:'Unnamed',savedAt:Date.now()+1};
  f.saved.push(missing);f.document.querySelector('.wab-nav-button').click();await settle();previews()[0].click();
  assert.ok(viewer.querySelector('.viewer-notice').textContent.includes('not copied'));
  assert.equal(viewer.querySelector('audio'),null,'Missing audio is not presented as playable');
  const file=viewer.querySelector('input[type="file"]');
  Object.defineProperty(file,'files',{value:[{type:'audio/ogg',size:1,data:'data:audio/ogg;base64,AQ=='}]});
  await file.onchange();await settle();
  assert.equal(f.saved.at(-1).media[0].kind,'audio');
  assert.equal(f.audioBlobs.get(viewer.querySelector('audio').src).type,'audio/ogg');
  results.push('attaching missing audio to an existing bookmark');

  const pointer=new f.window.Event('pointerdown',{bubbles:true});Object.defineProperty(pointer,'isTrusted',{value:true});
  f.document.querySelector('#side [title="Alice"]').dispatchEvent(pointer);
  assert.equal(f.document.querySelector('#wab-viewer-host').hidden,true,'Selecting a real chat dismisses the saved viewer');
  const welcome=fixture();welcome.saved.push(textItem);
  const placeholder=welcome.document.querySelector('#main');placeholder.removeAttribute('id');placeholder.getBoundingClientRect=()=>({left:444,right:1200,top:0,bottom:600,width:756,height:600});
  welcome.document.querySelector('.wab-nav-button').click();await settle();welcome.shadows.get('wab-section-host').querySelector('.message-preview').click();
  assert.equal(welcome.document.querySelector('#wab-viewer-host').parentElement,placeholder,'Viewer also opens in the welcome area');
  results.push('native chat selection and welcome-pane mounting');

  const nested=fixture();nested.saved.push({...textItem,messageId:'true_123@c.us_SAVED'});
  nested.document.querySelector('#main').outerHTML='<div class="right-column" style="position:absolute"><div class="welcome-content"><h1>Download WhatsApp for Mac</h1><p>Make calls and get a faster experience when you download the Mac app.</p></div></div>';
  const column=nested.document.querySelector('.right-column');
  column.getBoundingClientRect=()=>({left:444,right:1200,top:0,bottom:600,width:756,height:600});
  nested.document.querySelector('.welcome-content').getBoundingClientRect=()=>({left:500,right:1100,top:180,bottom:580,width:600,height:400});
  const hiddenMain=nested.document.createElement('div');hiddenMain.id='main';hiddenMain.getClientRects=()=>[];nested.document.querySelector('#app').append(hiddenMain);
  nested.document.querySelector('.wab-nav-button').click();await settle();
  const nestedList=nested.shadows.get('wab-section-host');nestedList.querySelector('.message-preview').click();await settle();
  const nestedViewer=nested.shadows.get('wab-viewer-host');
  assert.equal(nested.document.querySelector('#wab-viewer-host').parentElement,column,'Visible download pane is chosen instead of hidden #main');
  assert.equal(column.style.position,'absolute','Native right-pane positioning is preserved');
  assert.equal(nestedViewer.querySelectorAll('.message-bubble').length,1,'Only the selected saved message is displayed');
  assert.ok(nestedViewer.querySelector('.saved-message.outgoing'));
  assert.ok(nestedViewer.querySelector('.day-divider'));
  assert.equal(nestedList.querySelector('.message-preview').getAttribute('aria-pressed'),'true');
  assert.equal(nested.document.querySelector('#wab-section-host').hidden,false);
  nestedViewer.querySelector('.viewer-header button').click();
  assert.equal(column.style.position,'absolute');
  assert.equal(nested.document.querySelector('.welcome-content').getAttribute('aria-hidden'),null);
  results.push('nested Mac-download pane, hidden conversation rejection, single chat bubble, and native layout preservation');

  const scrollFixture=fixture();scrollFixture.saved.push({...textItem,text:'Long saved message\n'.repeat(500)});
  scrollFixture.document.querySelector('.wab-nav-button').click();await settle();scrollFixture.shadows.get('wab-section-host').querySelector('.message-preview').click();
  const scrollingRoot=scrollFixture.shadows.get('wab-viewer-host'),scrollBody=scrollingRoot.querySelector('.viewer-body');
  Object.defineProperties(scrollBody,{clientHeight:{value:400},scrollHeight:{value:5000},scrollTop:{value:0,writable:true}});
  let nativeWheel=0;scrollFixture.document.querySelector('#main').addEventListener('wheel',()=>nativeWheel++);
  const wheel=new scrollFixture.window.Event('wheel',{bubbles:true,cancelable:true});
  Object.defineProperties(wheel,{deltaY:{value:250},deltaMode:{value:0},ctrlKey:{value:false}});scrollingRoot.querySelector('.text').dispatchEvent(wheel);
  assert.equal(scrollBody.scrollTop,250);assert.equal(wheel.defaultPrevented,true);assert.equal(nativeWheel,0);
  const page=new scrollFixture.window.Event('keydown',{bubbles:true,cancelable:true});Object.defineProperty(page,'key',{value:'PageDown'});scrollBody.dispatchEvent(page);
  assert.equal(scrollBody.scrollTop,610);
  assert.ok([...scrollingRoot.querySelectorAll('style')].some(style=>style.textContent.includes('flex:1 1 0%')));
  results.push('long-message wheel and keyboard scrolling isolated from native chat handlers');

  // A real PCM WAV header allows byte-for-byte verification of the saved blob.
  const wav=Buffer.alloc(204);wav.write('RIFF',0);wav.writeUInt32LE(196,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(8000,24);wav.writeUInt32LE(8000,28);wav.writeUInt16LE(1,32);wav.writeUInt16LE(8,34);wav.write('data',36);wav.writeUInt32LE(160,40);wav.fill(128,44);
  const legacyAudio='data:application/octet-stream;base64,'+wav.toString('base64');
  const normalized=f.context.WABMedia.audioBlob(legacyAudio);
  assert.equal(normalized.type,'audio/wav');assert.deepEqual(Buffer.from(await normalized.arrayBuffer()),wav);
  assert.throws(()=>f.context.WABMedia.audioBlob('data:application/octet-stream;base64,AA=='),/recognizable/);
  assert.throws(()=>f.context.WABMedia.audioBlob('data:audio/ogg;base64,'),/empty/);
  results.push('audio format sniffing, legacy generic MIME repair, and exact audio bytes');

  const voice=fixture();voice.context.fetch=async()=>({ok:true,blob:async()=>new Blob([wav],{type:'application/octet-stream'})});
  const voiceMessage=voice.document.querySelector('.message-in');voiceMessage.innerHTML='<button aria-label="Play voice message"><span data-icon="ptt-play"></span></button>';
  voiceMessage.querySelector('button').dispatchEvent(new voice.window.Event('pointerdown',{bubbles:true}));
  const globalPlayer=voice.document.createElement('audio');globalPlayer.src='blob:native-voice';voice.document.body.append(globalPlayer);globalPlayer.dispatchEvent(new voice.window.Event('play',{bubbles:true}));
  await settle();voiceMessage.dispatchEvent(new voice.window.Event('contextmenu',{bubbles:true}));voice.send({action:'capture-context'});await settle();
  await waitUntil(()=>!voice.shadows.get('whatsapp-bookmarks-extension').querySelector('.save').disabled);
  voice.shadows.get('whatsapp-bookmarks-extension').querySelector('.dialog').dispatchEvent(new voice.window.Event('submit',{bubbles:true,cancelable:true}));await settle();
  assert.equal(voice.saved.at(-1).media[0]?.kind,'audio');assert.ok(voice.saved.at(-1).media[0].data.startsWith('data:audio/wav;base64,'));
  voice.document.querySelector('.wab-nav-button').click();await settle();voice.shadows.get('wab-section-host').querySelector('.message-preview').click();
  const voiceAudio=voice.shadows.get('wab-viewer-host').querySelector('audio');assert.ok(voiceAudio);assert.deepEqual(Buffer.from(await voice.audioBlobs.get(voiceAudio.src).arrayBuffer()),wav);
  results.push('native shared voice player capture through saving, reopening, and Blob playback source');

  const avatarVoice=fixture();const fetched=[];
  avatarVoice.context.fetch=async source=>{fetched.push(source);return {ok:true,blob:async()=>new Blob([wav],{type:'application/octet-stream'})};};
  const avatarMessage=avatarVoice.document.querySelector('.message-in');
  avatarMessage.innerHTML='<img alt="Profile photo" src="blob:avatar" width="120" height="120"><button aria-label="Play voice message"><span data-icon="ptt-play"></span></button>';
  avatarMessage.querySelector('button').addEventListener('click',()=>{
    const shared=avatarVoice.document.createElement('audio');shared.src='blob:actual-voice';avatarVoice.document.body.append(shared);shared.dispatchEvent(new avatarVoice.window.Event('play',{bubbles:true}));
  });
  avatarMessage.dispatchEvent(new avatarVoice.window.Event('contextmenu',{bubbles:true}));avatarVoice.send({action:'capture-context'});await settle();
  const avatarDialog=avatarVoice.shadows.get('whatsapp-bookmarks-extension');
  await waitUntil(()=>avatarDialog.querySelector('.save').disabled===false);
  assert.equal(avatarDialog.querySelector('.save').disabled,false,'Audio is loaded automatically from the selected message');
  assert.equal(avatarDialog.querySelector('.capture-tools').hidden,true);
  assert.equal(avatarDialog.querySelector('.manual-media'),null,'Manual attachment was removed from the save dialog');
  assert.equal(avatarDialog.querySelector('input[type="file"]'),null);
  assert.equal(avatarDialog.querySelector('.save').disabled,false);
  avatarDialog.querySelector('.dialog').dispatchEvent(new avatarVoice.window.Event('submit',{bubbles:true,cancelable:true}));await settle();
  assert.equal(avatarVoice.saved.at(-1).mediaKind,'audio');assert.equal(avatarVoice.saved.at(-1).media.length,1);assert.equal(avatarVoice.saved.at(-1).media[0].kind,'audio');
  assert.equal(fetched.includes('blob:avatar'),false,'Profile picture is never fetched as an attachment');
  results.push('voice-note avatar exclusion and automatic loading before saving');

  const sourceSwap=fixture();const oldSource=sourceSwap.document.querySelector('.message-in');
  oldSource.innerHTML='<button aria-label="Play voice message"><span data-icon="ptt-play"></span></button>';
  sourceSwap.context.fetch=async()=>({ok:true,blob:async()=>new Blob([wav],{type:'audio/wav'})});
  const sendBeforeSwap=sourceSwap.context.chrome.runtime.sendMessage;let swapped=false;
  sourceSwap.context.chrome.runtime.sendMessage=async data=>{
    const result=await sendBeforeSwap(data);
    if (data.action==='list' && !swapped) {
      swapped=true;oldSource.outerHTML='<div class="message-in"><button aria-label="Play voice message"><span data-icon="ptt-play"></span></button></div>';
      sourceSwap.document.querySelector('.message-in button').addEventListener('click',()=>{
        const player=sourceSwap.document.createElement('audio');player.src='blob:replacement-voice';sourceSwap.document.body.append(player);player.dispatchEvent(new sourceSwap.window.Event('play',{bubbles:true}));
      });
    }
    return result;
  };
  oldSource.dispatchEvent(new sourceSwap.window.Event('contextmenu',{bubbles:true}));sourceSwap.send({action:'capture-context'});await settle();
  const swapDialog=sourceSwap.shadows.get('whatsapp-bookmarks-extension');await waitUntil(()=>!swapDialog.querySelector('.save').disabled);
  assert.equal(oldSource.isConnected,false);assert.equal(swapDialog.querySelector('.save').disabled,false,'Replaced source element is rebound by message ID');
  assert.ok(swapDialog.querySelector('.capture-status').textContent.includes('ready'));
  results.push('automatic capture rebinds a selected message replaced by WhatsApp');

  const stalled=fixture();const realTimeout=stalled.context.setTimeout;stalled.context.setTimeout=(fn,ms)=>realTimeout(fn,ms>5000?5:ms);
  stalled.context.fetch=()=>new Promise(()=>{});
  const stalledMessage=stalled.document.querySelector('.message-in');stalledMessage.innerHTML='<button aria-label="Play voice message"><span data-icon="ptt-play"></span></button>';
  stalledMessage.querySelector('button').addEventListener('click',()=>{
    const player=stalled.document.createElement('audio');player.src='blob:stalled';stalled.document.body.append(player);player.dispatchEvent(new stalled.window.Event('play',{bubbles:true}));
  });
  stalledMessage.dispatchEvent(new stalled.window.Event('contextmenu',{bubbles:true}));stalled.send({action:'capture-context'});await settle();
  const stalledDialog=stalled.shadows.get('whatsapp-bookmarks-extension');await waitUntil(()=>stalledDialog.querySelector('.capture-status').textContent.includes('timed out'));
  assert.ok(stalledDialog.querySelector('.capture-status').textContent.includes('timed out'));
  assert.equal(stalledDialog.querySelector('.load-native-media').disabled,false,'Retry is enabled after a hung file read');
  assert.equal(stalledDialog.querySelector('.manual-media'),null);
  results.push('stalled audio reads end with an error and usable retry instead of indefinite preparing');
  assert.equal(stalledDialog.querySelector('.copy-debug').hidden,false);
  await stalledDialog.querySelector('.copy-debug').onclick();
  const debugText=stalledDialog.querySelector('.debug-report').value,debug=JSON.parse(debugText);
  assert.equal(debug.extensionVersion,'1.7.3');assert.equal(debug.phase,'error');assert.equal(debug.originalSource.mediaKind,'audio');
  assert.equal(stalledDialog.querySelector('.debug-report').hidden,false);
  assert.equal(debugText.includes('Alice'),false);assert.equal(debugText.includes('123@c.us'),false);assert.equal(debugText.includes('Keep this message'),false);assert.equal(debugText.includes('base64'),false);
  results.push('copyable capture diagnostics exclude chat names, message contents, IDs, and media bytes');

  const moveOnly=fixture();moveOnly.saved.push({id:'missing-audio',mediaKind:'audio',media:[],text:'',collection:'Old',savedAt:1});
  moveOnly.document.querySelector('.wab-nav-button').click();await settle();moveOnly.shadows.get('wab-section-host').querySelector('.entry-actions button').click();
  const moveDialog=moveOnly.shadows.get('whatsapp-bookmarks-extension');
  assert.equal(moveDialog.querySelector('.save').disabled,false);assert.equal(moveDialog.querySelector('.save').textContent,'Save collection');
  assert.equal(moveDialog.querySelector('.capture-tools').hidden,true);assert.ok(!moveDialog.querySelector('.capture-status').textContent.includes('Preparing'));
  results.push('moving older audio bookmarks does not require loading the original media');

  const detached=fixture();let nativePlays=0, nativePauses=0, bridgeFetches=0;
  class DetachedPlayer {
    constructor(){this.tagName='AUDIO';this.src='blob:detached-selected-voice';this.paused=true;this.muted=false;this.currentTime=0;this.events=new Map();}
    play(){nativePlays++;this.paused=false;return Promise.resolve();}
    pause(){nativePauses++;this.paused=true;}
    addEventListener(type,fn){this.events.set(type,fn);}
    removeEventListener(type){this.events.delete(type);}
  }
  detached.window.fetch=async()=>{bridgeFetches++;return {ok:true,blob:async()=>new Blob([wav],{type:'application/octet-stream'})};};
  detached.window.postMessage=data=>{
    const event=new detached.window.Event('message');
    Object.defineProperties(event,{source:{value:detached.window},origin:{value:'https://web.whatsapp.com'},data:{value:data}});
    setTimeout(()=>detached.window.dispatchEvent(event),0);
  };
  const pageContext=vm.createContext({window:detached.window,location:{origin:'https://web.whatsapp.com'},HTMLMediaElement:DetachedPlayer,FileReader:detached.context.FileReader,setTimeout,clearTimeout,setInterval,clearInterval});
  vm.runInContext(await readFile(new URL('../media-bridge.js',import.meta.url),'utf8'),pageContext);
  const detachedMessage=detached.document.querySelector('.message-in');detachedMessage.innerHTML='<button aria-label="Play voice message"><span data-icon="ptt-play"></span></button>';
  let selectedPlayer;
  detachedMessage.querySelector('button').addEventListener('click',()=>{selectedPlayer=new DetachedPlayer();selectedPlayer.play();});
  detachedMessage.dispatchEvent(new detached.window.Event('contextmenu',{bubbles:true}));detached.send({action:'capture-context'});
  await waitUntil(()=>detached.shadows.get('whatsapp-bookmarks-extension').querySelector('.save').disabled===false && nativePlays===1);
  const detachedDialog=detached.shadows.get('whatsapp-bookmarks-extension');
  assert.equal(detached.document.querySelectorAll('audio').length,0,'Native player is not attached to the DOM');
  assert.equal(nativePlays,1,'Selected voice note is loaded automatically');
  assert.ok(nativePauses>=1);assert.equal(selectedPlayer.muted,false,'Native mute state restored after capture');
  assert.equal(detachedDialog.querySelector('.save').disabled,false,'Saving is enabled without file attachment or an extra Load click');
  detachedDialog.querySelector('.dialog').dispatchEvent(new detached.window.Event('submit',{bubbles:true,cancelable:true}));await settle();
  assert.equal(detached.saved.at(-1).media[0].kind,'audio');
  assert.deepEqual(Buffer.from(await detached.context.WABMedia.audioBlob(detached.saved.at(-1).media[0].data).arrayBuffer()),wav);
  const fetchesAfterSave=bridgeFetches;new DetachedPlayer().play();await settle();
  assert.equal(bridgeFetches,fetchesAfterSave,'Ordinary playback is not copied after the selected-message capture ends');
  results.push('automatic selected-message capture from a detached native Audio player, without manual attachment');

  const videoFixture=fixture();const movie=Buffer.from([0,0,0,16,0x66,0x74,0x79,0x70,0x69,0x73,0x6f,0x6d,0,0,0,0]);
  videoFixture.context.fetch=async()=>({ok:true,blob:async()=>new Blob([movie],{type:'video/mp4'})});
  const videoMessage=videoFixture.document.querySelector('.message-in');videoMessage.innerHTML='<img src="blob:poster" width="240" height="180"><video></video>';
  videoMessage.querySelector('video').src='blob:original-video';
  videoMessage.dispatchEvent(new videoFixture.window.Event('contextmenu',{bubbles:true}));videoFixture.send({action:'capture-context'});await settle();
  await waitUntil(()=>!videoFixture.shadows.get('whatsapp-bookmarks-extension').querySelector('.save').disabled);
  videoFixture.shadows.get('whatsapp-bookmarks-extension').querySelector('.dialog').dispatchEvent(new videoFixture.window.Event('submit',{bubbles:true,cancelable:true}));await settle();
  assert.equal(videoFixture.saved.at(-1).media.length,1);assert.equal(videoFixture.saved.at(-1).media[0].kind,'video');
  videoFixture.document.querySelector('.wab-nav-button').click();await settle();videoFixture.shadows.get('wab-section-host').querySelector('.message-preview').click();
  const videoPlayer=videoFixture.shadows.get('wab-viewer-host').querySelector('video');assert.ok(videoPlayer);assert.equal(videoPlayer.controls,true);
  assert.equal(videoFixture.audioBlobs.get(videoPlayer.src).type,'video/mp4');assert.deepEqual(Buffer.from(await videoFixture.audioBlobs.get(videoPlayer.src).arrayBuffer()),movie);
  results.push('video file capture, poster exclusion, storage, and saved video controls');

  assert.equal(f.document.querySelector('.wab-nav-button').style.getPropertyValue('--wab-color-scheme'),'dark');
  f.document.documentElement.className='light';await settle();
  assert.equal(f.document.querySelector('#wab-viewer-host').style.getPropertyValue('--wab-color-scheme'),'light');
  results.push('viewer follows WhatsApp theme');
  return {passed:results.length,checks:results};
}
