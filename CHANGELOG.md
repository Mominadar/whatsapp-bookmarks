# Changelog

## 1.7.2 — 2026-11-11
### Fixed
- Copying a PDF/document into a bookmark failed with WhatsApp's new PDF viewer; its Download button is now found reliably and the viewer is closed afterwards.
- The Bookmark button in WhatsApp's image/PDF viewer toolbar no longer shows a text label, so it matches the neighbouring icons.

### Improved
- Saved-message viewer uses proper icons for the back arrow, image close button and collection subtitle.

## 1.7.1 — 2026-11-11
### Fixed
- Bookmarking a regular message no longer waits on the shared-contact lookup; only contact cards do.
- Collection counts in the dropdown no longer become part of the option text.

## 1.7.0 — 2026-11-10
### Added
- Shared contacts are now bookmarked as proper contact cards: name, selectable phone numbers and a Copy number button, styled like WhatsApp's own contact card.
- New "Contacts" type filter.

### Improved
- The extension now uses WhatsApp's own font stack instead of the browser default, so it matches the rest of the page.
- Redesigned the bookmark dialog: sectioned layout, quoted-message style preview, bordered fields with focus states and rounded action buttons.
- Redesigned the collections dropdown: folder icons, bookmark counts, a highlighted current collection, a clearer "Create" row, an empty state and an animated chevron.

## 1.6.1 — 2026-11-06
### Fixed
- Audio player in the viewer collapsed to a tiny control without a seek bar.
- With a type filter active, collections that had no matching bookmarks still appeared (e.g. `Ideas · 0`).

### Improved
- More compact list cards: the sender's name is no longer repeated in 1:1 chats, so more bookmarks fit on screen.
- Store screenshots can now be generated from the real UI with invented data (`promo/screens/`).

## 1.6.0 — 2026-11-06
First production release.

### Added
- Extension logo and toolbar/store icons (`assets/`).
- Document and file bookmarks (PDF, Office, text, zip, …) captured through WhatsApp's own download, with an in-pane viewer (**Open**, **Download**, inline PDF/text).
- **Save without the file** when media cannot be copied, so a bookmark is never blocked.
- Redesigned bookmarks list: card layout, chat avatars, type and collection pills, total count, richer empty state.
- Optional per-bookmark **Label**.
- Filters: collection-name filter plus content-type chips (Text, Audio, Video, Files, Links, Images).
- Clickable links in saved text; selectable/copyable text.
- Privacy policy, store listing text, packaging script.

### Improved
- Voice-note and video capture reliability (race between capture listeners, longer time budget for video, safer control selection, viewer cleanup).
- Right-hand viewer stays reachable and on screen even if WhatsApp's layout would block clicks or re-render the pane.
- Bookmark icon in the main navigation is measured against the native icon so it lines up.
- Equal-height list cards; wrapping filter chips that no longer overflow the pane.

### Fixed
- Bookmarking a voice note or video no longer closes the open chat (the menu is dismissed without sending Escape).
- Viewer video sizing in the right-hand pane.

## 1.5.x
Internal development builds (media capture diagnostics, collections, viewer).
