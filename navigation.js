(() => {
  'use strict';
  function messageIdentity(value = '') {
    const match = /^(?:true|false)_(.+?@(?:c\.us|s\.whatsapp\.net|g\.us|lid|broadcast|newsletter))_(.+)$/.exec(value);
    return match ? { chatId:match[1], key:match[2] } : { chatId:'', key:value };
  }
  globalThis.WABNavigation = { messageIdentity };
})();
