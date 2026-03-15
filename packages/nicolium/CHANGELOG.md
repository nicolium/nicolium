# Changelog

## Unreleased

Changes made since the project forked from Soapbox in April 2024.

### Major changes

- Switched to a separate library [`pl-api`](https://codeberg.org/nicolium/nicolium/src/branch/develop/packages/pl-api) for Mastodon API integration. It is mostly written from scratch, inheriting minor code parts from Soapbox/Mastodon. This also comes with improved compatibility with various Mastodon API extensions and abstracts out the implementation details.

### Added

- Cat ears

**Behavior:**

- Notifications of the same type and reposts of the same post are grouped client-side.
- Date is displayed for notifications that are not about new posts.
- Replies to your posts are displayed differently to other mentions in notification list.
- Hashtags from the last line of a post are displayed in a separate component. Adapted [from Mastodon](https://github.com/mastodon/mastodon/pull/26499).
- Native grouped notifications are used on Mastodon.
- Likes, reposts and reactions lists are displayed on long press of respective buttons.
- User local time is displayed on profile and in account hover card, if specified in profile fields.
- Poll results can be displayed before voting.

**Settings:**

- You can add image description to your avatar/backend, if supported by backend.
- GoToSocial users can manage post interaction policies.
- Users can set interface theme color.
- Users can adjust interface size.
- Users can use system font for emoji rendering.

**Composing posts:**

- WYSIWYG text formatting, available if Markdown is supported.
- When writing posts, links to statuses are added as quotes, when supported by backend.
- You can select post language manually, when composing.
- You can write posts with multiple language versions, when supported by backend.
- Language detection is done client-side for composed posts, utilizing `fasttext.wasm.js`.
- Draft posts. They are stored locally only and work with any backend.
- New visibility scopes are supported – local-only and list-only for Pleroma. Local-only is a separate switch on GoToSocial.
- On backends that support explicit mentioning, you can choose to include mentions in your replies body.
- GoToSocial users can set per-post interaction policies.
- When adding a URL with tracking parameters, a suggestion to remove them from the URL is displayed.
- On supported backends, you can see post preview before posting.
- When entering a long, all-lowercase hashtag, a suggestion about hashtag accessibility is displayed.

**Dashboard:**

- Dashboard main page displays metrics included in Mastodon admin dashboard, if supported by backend.

**Features:**

- The most recent scrobble is displayed on user profile/card.
- Users can generate _interaction circles_ for their profiles.
- You can bite users, if supported by backend.
- You can browse Bubble timeline, if supported by backend.
- Mastodon displays trending articles on Search page.
- Posts can be addressed to lists of users, on Pleroma.
- Support for events with external registration.
- Added a dedicated wrench reaction button.
- Interaction requests are supported. You can review pending requests and you get informed if your backend doesn't let you reply to a post. Supported on GoToSocial.
- Events with external sign up are supported.
- Application name used to post a status is displayed.
- Outgoing follow requests are displayed, if supported by backend.
- It is possible to remove tracking parameters from URLs in displayed posts.
- Displayed media now have a button for alternative text preview.
- Links in displayed posts can be configured to always display target domain, even when it's not a part of their content.
- Users can configure redirects from popular websites to proxy services like Nitter and Piped in displayed posts.
- It is possible to boost a post with specific visibility, if supported by backend.
- Pleroma shoutbox is displayed on chats page.
- Displaying user-provided media can be disabled, media descriptions will be displayed instead.
- MFM can be displayed on compatible backends.
- Lists can be set as exclusive and replies policy can be set up, if supported by backend.
- Threads can be displayed in a linear view, similarly to traditional Pleroma-FE, as an alternative to tree view. You can expand spoilers with one click.

### Changed

**Behavior:**

- Separated favourites from reaction emojis. Limit for one reaction per post is removed. Facebook-like emoji reaction bar is removed.
- Simplified sensitive text/media logic.
- Reposting user is mentioned, when replying to a reposted status.
- Notification types filtering options are reasonably merged.
- Search results are never cleared by just leaving the page.
- Status spoilers are displayed with a collapse/expand button, not in an overlay.
- Mentions and hashtags in bio no longer link to external pages.
- Quotes are counted with reblogs for non-detailed statuses.
- Reactions/favourites/reblogs list modal is displayed on long press.
- Various accessibility changes, focused on screen reader compatibility.

**Settings:**

- Moved missing description confirmation option back to Settings page.
- Profile fields can be reordered on the Edit profile page.
- Explicit addressing can be disabled on supported backends.
- Developers options are no longer hidden behind a challenge.

**Composing posts:**

- Custom emojis are now split into categories.
- GoToSocial users can post with date in the past.
- Post scopes were renamed to match wording used by Mastodon.

**UI changes:**

- Removed header. Search bar and profile dropdown are moved to the sidebar. Mobile sidebar button is moved to the thumb navigation.
- Floating action button for creating new posts is moved to the thumb navigation.
- Mobile sidebar UI is changed to look like a popover.
- Added some animations, improved consistency of the existing ones.
- Max width of the layout is increased.
- Updated Lists UI, to match the overall style.
- RSS button is displayed in account header for local users, when unauthenticated.
- Conversations page is always displayed, even when Chats are supported.
- Made it woke.
- Emojis are zoomed on hover.
- Event create/edit form is now a page, instead of a modal.
- A star is used for favorite icon, instead of a heart.
- Account avatars are squared.
- Background gradients can be disabled. Some other visual behavior depends on this setting.
- Tabler Icons were replaced with Phosphor Icons.
- The entire loading process uses the same animation now.
- Changed status info and notification title design.
- Redesigned audio/video player controls.

**Internal:**

- Migrated some local stores from Redux to Zustand. Other stores have been migrated away from `immutable`, before moving them either to Zustand or TanStack Query.
- Posts are now emojified during render, instead of when inserting posts to the state.
- Barrel exports are no longer used.
- Search page uses URL params now.
- Themes use `adoptedStyleSheets` to work with stricter CSP.
- Settings store uses a different key in development environment.
- Styles are being migrated from TailwindCSS to just scss.
- Default max image size is increased to match Mastodon limits.

**Dependencies:**

- Replaced `react-popper` and `react-overlays` with `@floating-ui/react`.
- `uuid` package is replaced by the `randomUUID()` method.

### Removed

- Removed Truth Social-specific features.
- Removed Nostr-specific stuff.
- Removed Rumble-specific embed handling.
- Removed option that pretends to disable name editing for verified users.
- Removed Call to Action banner.
- Removed links to block explorers for crypto addresses.
- Removed support for custom apps provided during build.
- Removed so called 'GDPR banner'.
- Removed embed page which loads too much for the use case.

### Fixed

- When initializing FaviconService, canvas export permission is checked.
- Improved regex for mentions in post composer.
- Post tombstones don't interrupt status navigation with hotkeys.
- Emojis are supported in poll options.
- Unsupported content types are not listed as available, when composing a post.
- Admin dashboard now works on non-Pleroma backends.
- Removed excessive calls to `fetchOwnAccounts`.
- Media modal displays the whole thread correctly.
- BrowsersList is actually being used now.
