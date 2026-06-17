# Changelog

## Unreleased

### Changed

- Picture-in-picture is not deployed on narrow screens.
- Hardcoded `text/x.misskeymarkdown` as mimetype supported on Sharkey.

### Fixed

- When closing a modal triggered by long pressing an action, it brings focus back on correct element.

## v1.0.0-rc.2

### Fixed

- 'Fill available width' toggle behavior.
- Zoomed in media returns to the initial position when zoomed out for a while.

## v1.0.0-rc.1

### Changed

- Follow button for locked accounts displays the text 'Request follow' now
- Minor style improvements
- Polish translation update

## v1.0.0-rc.0

### Added

- Deck interface
  - Available on separate page (`/deck`).
  - Available column types: timelines, notifications, accounts, search, trending hashtags/accounts/statuses, bookmarks, chat lists and specific chats, scheduled posts and drafts.
  - Each column has separate routing.
  - Columns can be moved, resized and set to take all available width.
  - Hotkeys are available for switching, moving and resizing columns and in-column routing.
- Option to disable video looping.
- Support for creating invites on Pleroma.
- Picture-in-picture mode for videos ported from Mastodon.

### Changed

- Migrated away from TailwindCSS.
- Changed color shifting and shading algorithm.
- Improvements to timeline hotkey navigation.
- Option to control video looping (disabled by default).
- Option to hide social media counters can now apply to detailed status view.
- Bookmarks page uses the same picker in header as one used on timelines page.
- In-browser language detector is used instead of fastText when the API is available.
- Updated delete post moderation endpoint for Iceshrimp.NET.
- Updated translations: Chinese (simplified Han, thanks to Poesty Li) French (thanks to Capitaine Caverne), Polish

### Fixed

- Display of content type in Iceshrimp.NET when set to default.
- GoToSocial interaction policy management button is visible again.
- Custom emojis can't override unicode emojis when they have the same shortcode.
- Up/down keys work correctly on drive page.
- Videos now pause when scrolled out of view.
- Fixed regressions related to default post privacy and content type handling change.
- Emoji picker styles load correctly on Akkoma with its strict CSP configuration.
- Opening emoji picker doesn't cause jumping issues.
- Post composer falls back to simple textarea on Servo.

### Removed

- Components such as \<Button /\> and \<Text /\>.

## v0.3.2

### Fixed

- Reports querying behavior for GoToSocial <=v0.21.2

## v0.3.1

### Added

- Pages such as birthdays and announcements for narrow screens.
- Option to hide notifications from accounts marked as automated.
- You can add a link to your Favourites page to the navigation menu.

### Changed

- Updated URL cleaning rules for YouTube links.
- Added feedback for saving drafts and a few more UI interactions.
- Further work on migrating styles from TailwindCSS.
- Subscription and follow settings are moved to the Following button displayed on profile page.

### Fixed

- Hashtag visibility warning doesn't display when using default post visibility, when it's set to public.
- Iceshrimp.NET example Nginx config now doesn't break custom emojis.
- Replies and other parameters of saved drafts are stored properly.

## v0.3.0

### Added

- Links to specific accounts, lists and other pages can be added to the navigation menu.
- A sidebar widget showing the most recent post from a specific account.
- Refresh button for timmelines and notifications page for non-touchscreen devices.
- Option to disable link previews or their media in posts.
- `mastodon-async-refresh` header support ported from Mastodon.
- Support for Iceshrimp.NET 2FA configuration.
- Support for `restricted` timeline mode (only visible for admins) on backends that implement it.
- Muted threads page on Iceshrimp.NET.
- When no navigation items are pinned, thumb navigation menu conditionally displays a dot indicating unread notifications or messages.
- Admin dashboard on Pleroma/Akkoma/Mitra allows configuring default user interface settings.
- Admin interface for managing domain allows/blocks.
- Basic support for Iceshrimp.NET admin API, including reports and domain blocks management.
- Filters/mutes handling in quoted posts.

### Changed

- Default settings now disable autoloading new timeline items and infinite scroll.
- Edit profile page offers autosuggestion for mentions, emojis and hashtags.
- Chat message composer uses the autosuggest input component used in other places, replacing external combobox library.
- Narrow mode is used for the navigation menu on some breakpoints.
- Sidebar is now hidden when all items are removed from it, making the main column wider.
- Reworked account list page in the admin dashboard.
- Iceshrimp.NET access token should now be persisted across sessions.
- Further work on migrating styles from TailwindCSS.
- Legacy config path is no longer supported.
- Made strings across the app more consistent.

### Fixed

- About page doesn't render infinite loading animation anymore.
- Pending posts render consistently with persisted posts in thread view.
- Quotes are not counted with reblogs when quote button is displayed in post actions.
- Modified default post content type and visibility setting behavior to fix cases where they were not applied correctly.

## v0.2.1

### Changed

- Added toast on resetting customizable items to default.
- Infinite scroll is now disabled by default.
- WebSocket connection is now retried on connection loss.
- When autoplaying GIFs is disabled, you now have to hover it for 0.5 seconds to play it, instead of just hovering it.

### Fixed

- Improvements for RTL languages.
- Drag and drop works correctly on WebKit browsers.
- Fixed styling issue with icon size in bottom navigation.
- GIFs in preview cards are not displayed automatically, respecting the autoplay setting.

## v0.2.0

### Meta

- Introduced a rule that forbids introducing LLM-generated first-party code.
- Added a .devcontainer configuration.
- Sponsors from GitHub Sponsors are now listed in the README.

### Added

- Option to reorganize, add, or remove items in the sidebar, navigation menu and status action bar.
- Option to include custom CSS in instance configuration, either as a string or a stylesheet link.
- Option to disallow unauthenticated users from visiting remote content.
- Option to filter out posts containing media without alternative text.
- Option to display nested quotes.
- Boost scheduling on supported backends (Iceshrimp.NET).
- MFA support for Iceshrimp.NET.
- Pleroma instance configuration from the admin dashboard.
- Text wrap toggle button for code blocks in posts.

### Changed

- Reorganized settings into categories.
- Option to disable the Chats pane in settings.
- Boost privacy can be set in a boost confirmation modal.
- Post translations can be displayed side-by-side with the original text.
- Longer profile bios are truncated with a "Show more" button.
- Link previews are displayed when the quoted post is not available.
- _Advanced mode_ for filtering can be switched from the notifications page.
- Improved unavailable posts display on Pleroma, and unavailable parent post information on Akkoma.
- Improved display of followers count when partially hidden by the user.
- Updated feature definitions for snac2, NeoDB, and Iceshrimp.NET.
- Various changes to the UI animations.
- Continued work on migrating styles from TailwindCSS.

### Fixed

- Nicolium no longer infinitely tries to load a timeline it's not authorized to access.
- Scheduled posts with polls no longer crash.
- Media modal works on scheduled/drafted posts page.
- Ctrl+Enter hotkey for posting works in the subject field.
- Private boosts are marked as such again in timelines.
- Instance announcements management.
- Upload progress is now correctly displayed.
- Progress bar component state and animation.
- Sidebar active state is now handled more consistently.
- Dropdown menu overlay no longer blinks when opened on mobile.
- Improved back button behavior in columns.
- Avatars are correctly displayed next to usernames in MFM.
- Interaction circles can be displayed as HTML instead of canvas, fixing CORS-related issues.

## v0.1.2

### Changed

- Collapsed posts can be expanded without switching to the thread view.
- Posts can be previewed on touchscreen devices by clicking on the 'Replying to' text on a reply.
- Continued work on migrating styles from TailwindCSS.
- Some dropdown menus now don't get opened as a modal on mobile.
- Updated feature detection for Hollo.

### Fixed

- Finished the content-type bugfixes.
- Polling is now disabled when the instance doesn't support `since_id` parameter.
- It's now possible to edit a multilingual post.
- Unread notification count on Hollo is now handled correctly.

## v0.1.1

### Added

- Missing ARIA attributes and other minor accessibility improvements.

### Changed

- Continued work on migrating styles from TailwindCSS.
- Some files were moved to different locations.
- Added a warning related to CORS configuration when signing in to an external instance.

### Fixed

- Removed `console.log` statement accidentally left in the release code.
- Requests without body do not get `Content-Type: application/json` appended by default, which fixes a bug with GoToSocial.
- Last status in a thread view, if expanded, no longer gets bottom padding.

## v0.1.0

> This list includes changes made since the project forked from Soapbox in April 2024. It does not cover every UI change, consistency improvement, optimization, accessibility improvement, or backend compatibility update — maintaining such a list manually would be impractical.

### Major changes

- Switched to a separate library [`pl-api`](https://codeberg.org/nicolium/nicolium/src/packages/pl-api) for Mastodon API integration. It is mostly written from scratch, inheriting minor code parts from Soapbox/Mastodon. This also comes with improved compatibility with various Mastodon API extensions and abstracts out the implementation details.
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
