# Changelog

## Unreleased

Changes made since the project forked from Soapbox in April 2024.

> This changelog does not cover every UI change, consistency improvement, optimization, accessibility improvement, or backend compatibility update — maintaining such a list manually would be impractical.

### Major changes

- Switched to a separate library [`pl-api`](https://codeberg.org/nicolium/nicolium/src/branch/develop/packages/pl-api) for Mastodon API integration. It is mostly written from scratch, inheriting minor code parts from Soapbox/Mastodon. This also comes with improved compatibility with various Mastodon API extensions and abstracts out the implementation details.
- Migrated client data stores from Redux to Zustand and remote data stores to TanStack Query. Stores have been migrated away from `immutable`.
- Migrated router from React Router to TanStack Router.
- Styles are being migrated from TailwindCSS to SCSS.
- Cat ears.

### Added

#### Behavior
- Notifications of the same type and reposts of the same post are grouped client-side.
- Native grouped notifications are used on Mastodon.
- Date is displayed for notifications that are not about new posts.
- Replies to your posts are displayed differently from other mentions in the notification list.
- Hashtags from the last line of a post are displayed in a separate component. Adapted [from Mastodon](https://github.com/mastodon/mastodon/pull/26499).
- Likes, reposts, and reactions lists are displayed on long press of respective buttons.
- User local time is displayed on profile and in account hover card, if specified in profile fields.
- Poll results can be displayed before voting.
- Home timeline remembers scroll position by default and restores it when you return to the app.
- A "Skip pinned posts" button was added to user profiles.
- Posts in timelines are displayed grouped together if they belong to the same context.

#### Composing posts

- WYSIWYG text formatting, available if Markdown is supported.
- Links to statuses are added as quotes when supported by backend.
- Manual post language selection.
- Posts with multiple language versions, when supported by backend.
- Client-side language detection for composed posts via `fasttext.wasm.js`.
- Draft posts, stored locally and compatible with any backend.
- New visibility scopes: local-only and list-only for Pleroma; local-only as a separate switch on GoToSocial.
- Optional inclusion of mentions in reply body on backends that support explicit mentioning.
- Per-post interaction policies for GoToSocial users.
- Suggestion to remove tracking parameters when adding a URL.
- Post preview before posting, on supported backends.
- Suggestion about hashtag accessibility when entering long, all-lowercase hashtags.

#### Features

- Most recent scrobble is displayed on user profile/card.
- Users can generate _interaction circles_ for their profiles.
- Bite users, if supported by backend.
- Bubble timeline, if supported by backend.
- Mastodon displays trending articles on the Search page.
- Posts can be addressed to lists of users on Pleroma.
- Events with external registration.
- Dedicated wrench reaction button.
- Interaction requests: review pending requests and get informed if your backend doesn't let you reply to a post (GoToSocial).
- Application name used to post a status is displayed.
- Outgoing follow requests are displayed, if supported by backend.
- Remove tracking parameters from URLs in displayed posts.
- Button for alternative text preview on displayed media.
- Option to always display target domain for links, even when not part of content.
- Configurable redirects from popular websites to proxy services like Nitter and Piped in displayed posts.
- Boost a post with specific visibility, if supported by backend.
- Pleroma shoutbox on the chats page.
- Option to disable user-provided media, showing descriptions instead.
- MFM rendering on compatible backends.
- Exclusive lists and replies policy, if supported by backend.
- Linear thread view (similar to traditional Pleroma-FE) as an alternative to tree view, with one-click spoiler expansion.
- Iceshrimp.NET drive support for uploading, managing, and attaching files to posts.
- Local post translation (including private posts, also for unauthenticated users) on browsers supporting the Translator API.
- Auto-expiring blocks on Pleroma.
- Antennas and circles on Mastodon forks that implement those.

#### Settings

- Image descriptions for avatar/header, if supported by backend.
- GoToSocial users can manage post interaction policies.
- Interface theme color selection.
- Adjustable interface size.
- Option to use system font for emoji rendering.

#### Dashboard

- Dashboard main page displays metrics from the Mastodon admin dashboard, if supported by backend.

### Changed

#### Behavior

- Separated favourites from reaction emojis; removed per-post reaction limit and Facebook-like emoji reaction bar.
- Simplified sensitive text/media logic.
- Reposting user is mentioned when replying to a reposted status.
- Notification type filtering options are reasonably merged.
- Search results are never cleared by just leaving the page.
- Status spoilers use a collapse/expand button instead of an overlay.
- Mentions and hashtags in bio no longer link to external pages.
- Quotes are counted with reblogs for non-detailed statuses.
- Reactions/favourites/reblogs list modal is displayed on long press.
- Various accessibility improvements, focused on screen reader compatibility.
- Users get asked to update account note when blocking/muting accounts.
- Bookmark folder selection modal supports filtering by search.
- Improved meta information for posts to improve Reader Mode on Firefox.

#### Composing posts

- Custom emojis are split into categories.
- GoToSocial users can post with a date in the past.
- Post scopes renamed to match Mastodon wording.

#### Settings

- Missing description confirmation option moved back to the Settings page.
- Profile fields can be reordered on the Edit profile page.
- Explicit addressing can be disabled on supported backends.
- Developer options are no longer hidden behind a challenge.

#### UI

- Removed header; search bar and profile dropdown moved to the sidebar; mobile sidebar button moved to thumb navigation.
- Floating action button for new posts moved to thumb navigation.
- Mobile sidebar styled as a popover.
- Added animations and improved consistency of existing ones.
- Increased max width of the layout.
- Updated Lists UI to match overall style.
- RSS button displayed in account header for local users when unauthenticated.
- Conversations page is always displayed, even when Chats are supported.
- Made it woke.
- Emojis zoom on hover.
- Event create/edit form is now a page instead of a modal.
- Star used for favourite icon instead of a heart.
- Account avatars are squared.
- Background gradients can be disabled; some visual behavior depends on this setting.
- Tabler Icons replaced with Phosphor Icons.
- Unified loading animation across the entire loading process.
- Redesigned status info and notification title.
- Redesigned audio/video player controls.
- Animations and accessibility improvements for UI elements like sliders.

#### Internal

- Posts are emojified during render instead of when inserting into state.
- Barrel exports are no longer used.
- Search page uses URL params.
- Themes use `adoptedStyleSheets` to work with stricter CSP.
- Settings store uses a different key in development environment.
- Default max image size increased to match Mastodon limits.

#### Dependencies

- Replaced `react-popper` and `react-overlays` with `@floating-ui/react`.
- Replaced `uuid` package with the `randomUUID()` method.
- Inlined some libraries, like the PullToRefresh component, directly into the app.
- Removed `react-motion`; adopted migration to `@react-spring/web` from Mastodon.
- Replaced a fork of `react-hotkeys` with Mastodon's hotkey handling system.
- Replaced FlexSearch with `fuzzysort` for emoji search.
- Replaced ESLint with `oxfmt` and `oxlint`.

### Removed

- Truth Social-specific features.
- Nostr-specific features.
- Rumble-specific embed handling.
- Option that pretends to disable name editing for verified users.
- Call to Action banner.
- Links to block explorers for crypto addresses.
- Support for custom apps provided during build.
- So called 'GDPR banner'.
- Embed page (loaded too much for the use case).

### Fixed

- Canvas export permission is checked when initializing FaviconService.
- Improved regex for mentions in post composer.
- Post tombstones no longer interrupt status navigation with hotkeys.
- Emojis are supported in poll options.
- Unsupported content types are not listed as available when composing a post.
- Admin dashboard now works on non-Pleroma backends.
- Removed excessive calls to `fetchOwnAccounts`.
- Media modal displays the whole thread correctly.
