# Privacy Policy — WhatsApp Bookmarks

_Last updated: 2026-11-06_

WhatsApp Bookmarks is a browser extension that runs only on `https://web.whatsapp.com`. It is an independent project and is not affiliated with WhatsApp or Meta.

## What the extension stores
When you choose **Bookmark** on a message, the extension saves, on your device only:

- the message text, sender name, chat name, date and time shown on screen;
- any voice note, video, image or file you bookmarked (up to 25 MB each);
- the collection name and optional label you entered.

## Where it is stored
In the extension's own local IndexedDB database inside your Chrome profile. It is not synced, uploaded or shared. Anyone with access to your Chrome profile on this computer can view it.

## What the extension does not do
- It does not send any data to the developer or any third party. The only network requests it makes are to WhatsApp's own media servers, to read the media of a message you chose to bookmark.
- It does not use analytics, telemetry, advertising or tracking.
- It does not read or store messages you have not chosen to bookmark.
- It does not use WhatsApp's private application APIs or your credentials.

## How it reads media
To copy a bookmarked voice note, video or file, the extension briefly observes the media player or download link of the message you selected, only while the bookmark dialog is open. It then stops observing.

## Debug report
The optional **Copy debug info** button copies a report to your clipboard on request. It contains structural information (selector counts, control types, capture status) and excludes chat names, message contents, message IDs and media bytes. It is never sent anywhere automatically.

## Your control
You can remove any bookmark in the extension, or delete everything by uninstalling the extension or clearing its site data.

## Changes
If this policy changes, the date above will be updated and the change recorded in `CHANGELOG.md`.

## Contact
Open an issue in the project repository.
