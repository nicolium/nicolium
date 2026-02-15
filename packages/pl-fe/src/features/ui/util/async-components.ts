import { lazy } from 'react';

// Pages
export const AboutPage = lazy(() => import('@/pages/utils/about'));
export const AccountGallery = lazy(() => import('@/pages/accounts/account-gallery'));
export const AccountTimeline = lazy(() => import('@/pages/accounts/account-timeline'));
export const AdminAccount = lazy(() => import('@/pages/dashboard/account'));
export const Aliases = lazy(() => import('@/pages/settings/aliases'));
export const Announcements = lazy(() => import('@/pages/dashboard/announcements'));
export const Antennas = lazy(() => import('@/pages/account-lists/antennas'));
export const AntennaTimeline = lazy(() => import('@/pages/timelines/antenna-timeline'));
export const AuthTokenList = lazy(() => import('@/pages/settings/auth-token-list'));
export const AwaitingApproval = lazy(() => import('@/pages/dashboard/awaiting-approval'));
export const Backups = lazy(() => import('@/pages/settings/backups'));
export const Blocks = lazy(() => import('@/pages/settings/blocks'));
export const BookmarkFolders = lazy(() => import('@/pages/status-lists/bookmark-folders'));
export const Bookmarks = lazy(() => import('@/pages/status-lists/bookmarks'));
export const BubbleTimeline = lazy(() => import('@/pages/timelines/bubble-timeline'));
export const ChatIndex = lazy(() => import('@/pages/chats/chats'));
export const Circle = lazy(() => import('@/pages/fun/circle'));
export const Circles = lazy(() => import('@/pages/account-lists/circles'));
export const CircleTimeline = lazy(() => import('@/pages/timelines/circle-timeline'));
export const CommunityTimeline = lazy(() => import('@/pages/timelines/community-timeline'));
export const ComposeEvent = lazy(() => import('@/pages/statuses/compose-event'));
export const EditEvent = lazy(() =>
  import('@/pages/statuses/compose-event').then((m) => ({ default: m.EditEventPage })),
);
export const Conversations = lazy(() => import('@/pages/status-lists/conversations'));
export const CreateApp = lazy(() => import('@/pages/developers/create-app'));
export const CryptoDonate = lazy(() => import('@/pages/utils/crypto-donate'));
export const Dashboard = lazy(() => import('@/pages/dashboard/dashboard'));
export const DeleteAccount = lazy(() => import('@/pages/settings/delete-account'));
export const Developers = lazy(() => import('@/pages/developers/developers'));
export const Directory = lazy(() => import('@/pages/account-lists/directory'));
export const DomainBlocks = lazy(() => import('@/pages/settings/domain-blocks'));
export const Domains = lazy(() => import('@/pages/dashboard/domains'));
export const DraftStatuses = lazy(() => import('@/pages/status-lists/draft-statuses'));
export const Drive = lazy(() => import('@/pages/drive/drive'));
export const EditEmail = lazy(() => import('@/pages/settings/edit-email'));
export const EditFilter = lazy(() => import('@/pages/settings/edit-filter'));
export const EditGroup = lazy(() => import('@/pages/groups/edit-group'));
export const EditPassword = lazy(() => import('@/pages/settings/edit-password'));
export const EditProfile = lazy(() => import('@/pages/settings/edit-profile'));
export const EventDiscussion = lazy(() => import('@/pages/statuses/event-discussion'));
export const EventInformation = lazy(() => import('@/pages/statuses/event-information'));
export const Events = lazy(() => import('@/pages/status-lists/events'));
export const ExportData = lazy(() => import('@/pages/settings/export-data'));
export const ExternalLogin = lazy(() => import('@/pages/auth/external-login'));
export const FavouritedStatuses = lazy(() => import('@/pages/status-lists/favourited-statuses'));
export const FederationRestrictions = lazy(() => import('@/pages/utils/federation-restrictions'));
export const Filters = lazy(() => import('@/pages/settings/filters'));
export const FollowedTags = lazy(() => import('@/pages/settings'));
export const Followers = lazy(() => import('@/pages/account-lists/followers'));
export const Following = lazy(() => import('@/pages/account-lists/following'));
export const FollowRequests = lazy(() => import('@/pages/account-lists/follow-requests'));
export const GenericNotFound = lazy(() => import('@/pages/utils/generic-not-found'));
export const GroupBlockedMembers = lazy(() => import('@/pages/groups/group-blocked-members'));
export const GroupGallery = lazy(() => import('@/pages/groups/group-gallery'));
export const GroupMembers = lazy(() => import('@/pages/groups/group-members'));
export const GroupMembershipRequests = lazy(
  () => import('@/pages/groups/group-membership-requests'),
);
export const GroupTimeline = lazy(() => import('@/pages/timelines/group-timeline'));
export const Groups = lazy(() => import('@/pages/groups/groups'));
export const HashtagTimeline = lazy(() => import('@/pages/timelines/hashtag-timeline'));
export const HomeTimeline = lazy(() => import('@/pages/timelines/home-timeline'));
export const ImportData = lazy(() => import('@/pages/settings/import-data'));
export const IntentionalError = lazy(() => import('@/pages/utils/intentional-error'));
export const InteractionPolicies = lazy(() => import('@/pages/settings/interaction-policies'));
export const InteractionRequests = lazy(() => import('@/pages/status-lists/interaction-requests'));
export const LandingPage = lazy(() => import('@/pages/utils/landing'));
export const LandingTimeline = lazy(() => import('@/pages/timelines/landing-timeline'));
export const LinkTimeline = lazy(() => import('@/pages/timelines/link-timeline'));
export const Lists = lazy(() => import('@/pages/account-lists/lists'));
export const ListTimeline = lazy(() => import('@/pages/timelines/list-timeline'));
export const LoginPage = lazy(() => import('@/pages/auth/login'));
export const LogoutPage = lazy(() => import('@/pages/auth/logout'));
export const ManageGroup = lazy(() => import('@/pages/groups/manage-group'));
export const MediaGallery = lazy(() => import('@/components/media-gallery'));
export const Migration = lazy(() => import('@/pages/settings/migration'));
export const ModerationLog = lazy(() => import('@/pages/dashboard/moderation-log'));
export const Mutes = lazy(() => import('@/pages/settings/mutes'));
export const NewStatus = lazy(() => import('@/pages/utils/new-status'));
export const Notifications = lazy(() => import('@/pages/notifications/notifications'));
export const OutgoingFollowRequests = lazy(
  () => import('@/pages/account-lists/outgoing-follow-requests'),
);
export const PasswordReset = lazy(() => import('@/pages/auth/password-reset'));
export const PinnedStatuses = lazy(() => import('@/pages/status-lists/pinned-statuses'));
export const FrontendConfig = lazy(() => import('@/pages/dashboard/frontend-config'));
export const PublicTimeline = lazy(() => import('@/pages/timelines/public-timeline'));
export const Quotes = lazy(() => import('@/pages/status-lists/quotes'));
export const Report = lazy(() => import('@/pages/dashboard/report'));
export const Reports = lazy(() => import('@/pages/dashboard/reports'));
export const RegisterInvite = lazy(() => import('@/pages/auth/register-with-invite'));
export const RegistrationPage = lazy(() => import('@/pages/auth/registration'));
export const Relays = lazy(() => import('@/pages/dashboard/relays'));
export const RemoteTimeline = lazy(() => import('@/pages/timelines/remote-timeline'));
export const RssFeedSubscriptions = lazy(() => import('@/pages/settings/rss-feed-subscriptions'));
export const Rules = lazy(() => import('@/pages/dashboard/rules'));
export const ScheduledStatuses = lazy(() => import('@/pages/status-lists/scheduled-statuses'));
export const Search = lazy(() => import('@/pages/search/search'));
export const ServiceWorkerInfo = lazy(() => import('@/pages/developers/service-worker-info'));
export const ServerInfo = lazy(() => import('@/pages/utils/server-info'));
export const Settings = lazy(() => import('@/pages/settings/settings'));
export const SettingsStore = lazy(() => import('@/pages/developers/settings-store'));
export const Share = lazy(() => import('@/pages/utils/share'));
export const Status = lazy(() => import('@/pages/statuses/status'));
export const TestTimeline = lazy(() => import('@/pages/timelines/test-timeline'));
export const ThemeEditor = lazy(() => import('@/pages/dashboard/theme-editor'));
export const Privacy = lazy(() => import('@/pages/settings/privacy'));
export const UserIndex = lazy(() => import('@/pages/dashboard/user-index'));
export const WrenchedTimeline = lazy(() => import('@/pages/timelines/wrenched-timeline'));

// Panels
export const AccountNotePanel = lazy(
  () => import('@/features/ui/components/panels/account-note-panel'),
);
export const AnnouncementsPanel = lazy(
  () => import('@/components/announcements/announcements-panel'),
);
export const BirthdayPanel = lazy(() => import('@/features/ui/components/panels/birthday-panel'));
export const CryptoDonatePanel = lazy(
  () => import('@/features/crypto-donate/components/crypto-donate-panel'),
);
export const GroupMediaPanel = lazy(
  () => import('@/features/ui/components/panels/group-media-panel'),
);
export const InstanceInfoPanel = lazy(
  () => import('@/features/ui/components/panels/instance-info-panel'),
);
export const InstanceModerationPanel = lazy(
  () => import('@/features/ui/components/panels/instance-moderation-panel'),
);
export const LatestAccountsPanel = lazy(
  () => import('@/features/admin/components/latest-accounts-panel'),
);
export const MyGroupsPanel = lazy(() => import('@/features/ui/components/panels/my-groups-panel'));
export const NewEventPanel = lazy(() => import('@/features/ui/components/panels/new-event-panel'));
export const NewGroupPanel = lazy(() => import('@/features/ui/components/panels/new-group-panel'));
export const PinnedAccountsPanel = lazy(
  () => import('@/features/ui/components/panels/pinned-accounts-panel'),
);
export const ProfileFieldsPanel = lazy(
  () => import('@/features/ui/components/panels/profile-fields-panel'),
);
export const ProfileInfoPanel = lazy(
  () => import('@/features/ui/components/panels/profile-info-panel'),
);
export const ProfileMediaPanel = lazy(
  () => import('@/features/ui/components/panels/profile-media-panel'),
);
export const PromoPanel = lazy(() => import('@/features/ui/components/panels/promo-panel'));
export const SignUpPanel = lazy(() => import('@/features/ui/components/panels/sign-up-panel'));
export const TrendsPanel = lazy(() => import('@/features/ui/components/panels/trends-panel'));
export const UserPanel = lazy(() => import('@/features/ui/components/panels/user-panel'));
export const WhoToFollowPanel = lazy(
  () => import('@/features/ui/components/panels/who-to-follow-panel'),
);

export const Audio = lazy(() => import('@/features/audio'));
export const ChatWidget = lazy(() => import('@/features/chats/components/chat-widget/chat-widget'));
export const ComposeEditor = lazy(() => import('@/features/compose/editor'));
export const ComposeForm = lazy(() => import('@/features/compose/components/compose-form'));
export const DatePicker = lazy(() => import('@/features/birthdays/date-picker'));
export const DropdownNavigation = lazy(() => import('@/components/dropdown-navigation'));
export const EmojiPicker = lazy(() => import('@/features/emoji/components/emoji-picker'));
export const EventHeader = lazy(() => import('@/features/event/components/event-header'));
export const MfaForm = lazy(() => import('@/features/security/mfa-form'));
export const ModalRoot = lazy(() => import('@/features/ui/components/modal-root'));
export const ProfileField = lazy(() => import('@/features/ui/components/profile-field'));
export const AccountHoverCard = lazy(() => import('@/components/account-hover-card'));
export const StatusHoverCard = lazy(() => import('@/components/status-hover-card'));
export const Video = lazy(() => import('@/features/video'));
