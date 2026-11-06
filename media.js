(() => {
  'use strict';
  function audioType(bytes, fallback = '') {
    const text = (start, end) => String.fromCharCode(...bytes.slice(start, end));
    if (text(0, 4) === 'OggS') return 'audio/ogg';
    if (text(0, 4) === 'RIFF' && text(8, 12) === 'WAVE') return 'audio/wav';
    if (text(4, 8) === 'ftyp') return 'audio/mp4';
    if (text(0, 3) === 'ID3') return 'audio/mpeg';
    if (text(0, 4) === 'fLaC') return 'audio/flac';
    if ([0x1a,0x45,0xdf,0xa3].every((value,index) => bytes[index] === value)) return 'audio/webm';
    if (bytes[0] === 0xff && (bytes[1] & 0xf6) === 0xf0) return 'audio/aac';
    if (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0) return 'audio/mpeg';
    return /^(audio|video)\//i.test(fallback) ? fallback : '';
  }
  function mediaBlob(data, kind = 'audio') {
    const match = /^data:([^,]*),(.*)$/s.exec(data || '');
    if (!match) throw new Error('The audio file was not saved. Attach the downloaded audio or play it in WhatsApp and bookmark it again.');
    let bytes;
    try {
      if (/;base64(?:;|$)/i.test(match[1])) {
        const binary = atob(match[2].replace(/\s/g, ''));
        bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
      } else bytes = new TextEncoder().encode(decodeURIComponent(match[2]));
    } catch { throw new Error('The saved audio is damaged. Attach the downloaded audio file to replace it.'); }
    if (!bytes.length) throw new Error('The saved audio file is empty. Attach the downloaded audio file.');
    const declared = match[1].split(';')[0];
    const detected = audioType(bytes, declared);
    const mime = kind === 'video' ? detected === 'audio/mp4' ? 'video/mp4' : detected === 'audio/webm' ? 'video/webm' : /^video\//.test(declared) ? declared : '' : detected;
    if (!mime) throw new Error('This bookmark does not contain a recognizable audio file. Attach the downloaded audio file.');
    return new Blob([bytes], {type:mime});
  }
  const audioBlob = data => mediaBlob(data, 'audio');
  async function readFile(file, expected = '') {
    if (!file || !file.size) throw new Error('This file is empty. Choose the original downloaded media file.');
    if (file.size > 25*1024*1024) throw new Error('Attachments must be 25 MB or smaller.');
    const data = await new Promise((resolve,reject) => {
      const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('Could not read this file.'));reader.readAsDataURL(file);
    });
    const declared=(file.type || '').split('/')[0];
    const extension=(file.name || '').split('.').pop().toLowerCase();
    let kind=expected || (['image','audio','video'].includes(declared)?declared:'');
    if (kind==='document' || (!kind && (declared==='application' || declared==='text' || isDocumentName(file.name)) && !/^(opus|ogg|oga|mp3|m4a|aac|wav)$/.test(extension))) {
      const blob=documentBlob(data,file.name);
      return {kind:'document',data:data.replace(/^data:[^,]*,/,`data:${blob.type};base64,`),name:file.name || 'document'};
    }
    if (!kind && /^(mp4|mov|m4v|webm)$/.test(extension)) kind='video';
    if (!kind) kind='audio'; // Sniff bytes for .opus/.ogg and unknown MIME types.
    if (kind==='image') return {kind,data};
    const blob=mediaBlob(data,kind);
    return {kind,data:data.replace(/^data:[^,]*,/,`data:${blob.type};base64,`)};
  }
  const DOCUMENT_TYPES = {pdf:'application/pdf',doc:'application/msword',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',xls:'application/vnd.ms-excel',xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',ppt:'application/vnd.ms-powerpoint',pptx:'application/vnd.openxmlformats-officedocument.presentationml.presentation',txt:'text/plain',csv:'text/csv',rtf:'application/rtf',zip:'application/zip',json:'application/json',xml:'application/xml',html:'text/html',htm:'text/html',odt:'application/vnd.oasis.opendocument.text',ods:'application/vnd.oasis.opendocument.spreadsheet',epub:'application/epub+zip'};
  const isDocumentName = name => /\.([a-z0-9]{1,5})$/i.test(name || '') && Object.hasOwn(DOCUMENT_TYPES, /\.([a-z0-9]{1,5})$/i.exec(name)[1].toLowerCase());
  function documentType(name = '', declared = '', bytes = []) {
    if (String.fromCharCode(...bytes.slice(0, 5)) === '%PDF-') return 'application/pdf';
    const extension = (/\.([a-z0-9]{1,5})$/i.exec(name || '') || [])[1]?.toLowerCase();
    const known = extension && Object.hasOwn(DOCUMENT_TYPES, extension) ? DOCUMENT_TYPES[extension] : '';
    if (known) return known;
    return declared && !/^(application\/octet-stream)?$/.test(declared) ? declared : 'application/octet-stream';
  }
  // Returns {mime, bytes} for a saved document data URL, with a MIME type repaired from the file name or contents.
  function documentBlob(data, name = '') {
    const match = /^data:([^,]*),(.*)$/s.exec(data || '');
    if (!match) throw new Error('The document was not saved. Bookmark the original message again.');
    let bytes;
    try { bytes = Uint8Array.from(atob(match[2].replace(/\s/g, '')), character => character.charCodeAt(0)); }
    catch { throw new Error('The saved document is damaged. Bookmark the original message again.'); }
    if (!bytes.length) throw new Error('The saved document is empty.');
    return new Blob([bytes], {type:documentType(name, match[1].split(';')[0], bytes)});
  }
  globalThis.WABMedia = { audioBlob, audioType, mediaBlob, readFile, documentBlob, documentType, isDocumentName };
})();
