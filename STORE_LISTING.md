# Chrome Web Store listing

Copy these into the developer dashboard.

## Name
WhatsApp Bookmarks

> Naming risk: store reviewers can reject names that lead with a third-party trademark. If the listing is rejected, use **Bookmarks for WhatsApp Web** and keep the "not affiliated" disclaimer in the description.

## Summary (max 132 characters)
Save WhatsApp Web messages, voice notes, videos, images and files into named collections, stored privately on your device.

## Category
Productivity

## Description
Keep the WhatsApp messages that matter.

WhatsApp Bookmarks adds a **Bookmark** option to the message menu on WhatsApp Web. Save a message into a named collection and find it again in a clean bookmarks pane beside your chats.

★ Save text, voice notes, videos, images and files (PDF, Word, Excel and more)
★ Organise into collections and add an optional label to any bookmark
★ Filter by collection name and by type: Text, Audio, Video, Files, Links, Images
★ Open any bookmark in a chat-style viewer: select and copy text, click links, play audio and video, view images, open or download files
★ Move, relabel or remove bookmarks any time
★ Matches WhatsApp's light and dark themes

PRIVATE BY DESIGN
Everything is stored on your device. No account, no server, no analytics, no ads. Nothing is sent to the developer or any third party; the extension only runs on web.whatsapp.com and only reads the media of messages you choose to bookmark. Bookmarks stay available even if the original message is deleted.

NOTES
• Media is limited to 25 MB per item. View-once media is not supported.
• WhatsApp changes its web app often; if the Bookmark option disappears after an update, refresh the page and check for an extension update.

This extension is an independent project and is not affiliated with, endorsed by, or sponsored by WhatsApp or Meta.

## Single purpose
Let users save WhatsApp Web messages (including their media) into named, locally stored collections and view them later.

## Permission justifications
| Permission / access | Why it is needed |
| --- | --- |
| Host access: `https://web.whatsapp.com/*` | The content scripts add the Bookmark menu item, bookmarks pane and viewer to WhatsApp Web, and read the message you choose to bookmark. |
| `contextMenus` | Adds the fallback "Bookmark this WhatsApp message" entry to Chrome's right-click menu on WhatsApp Web. |
| `unlimitedStorage` | Saved voice notes, videos and files can be large; this stops IndexedDB hitting the default quota. Data never leaves the device. |
| Page-world script (`media-bridge.js`, `world: "MAIN"`) | Observes the selected message's media player or download link, only during an active capture, so the real file bytes can be copied. |

## Data usage disclosures (privacy practices tab)
- Collects: **website content** (the messages and media the user chooses to bookmark), stored locally only.
- Not sold or transferred to third parties; not used for purposes unrelated to the single purpose; not used for creditworthiness or lending.
- Remote code: **No**. All code is bundled in the package.
- Privacy policy URL: host `PRIVACY.md` (for example on GitHub Pages or the repository's raw/blob URL) and paste the link.

## Assets to upload
- Store icon 128×128: `assets/icon-128.png` (a 512×512 master is in `assets/icon-512.png`).
- **Screenshots (ready):** `store/screenshots/` has six 1280×800 PNGs (menu, save dialog, browse/open, voice notes, files/PDF, dark theme). They were rendered from the real extension code against a mock chat page with invented people and messages, so no private chats appear. The Web Store accepts up to five; the first five are a good set, and the dark-theme one is a nice sixth if you want it. Regenerate with `node promo/screens/render-screens.mjs store/screenshots` after UI changes.
- Optional demo video: `store/whatsapp-bookmarks-promo.mp4` (31 s, 1920×1080, silent; the Web Store takes a YouTube link, so upload it there first).
- Optional promo tiles: small 440×280, marquee 1400×560.
