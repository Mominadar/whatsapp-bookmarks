# Changelog

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
