import { lazy } from 'react';

// Panels
export const AccountNotePanel = lazy(() => import('@/components/panels/account-note-panel'));
export const AnnouncementsPanel = lazy(
  () => import('@/components/announcements/announcements-panel'),
);
export const BirthdayPanel = lazy(() => import('@/components/panels/birthday-panel'));
export const CryptoDonatePanel = lazy(
  () => import('@/features/crypto-donate/components/crypto-donate-panel'),
);
export const GroupMediaPanel = lazy(() => import('@/components/panels/group-media-panel'));
export const InstanceInfoPanel = lazy(() => import('@/components/panels/instance-info-panel'));
export const InstanceModerationPanel = lazy(
  () => import('@/components/panels/instance-moderation-panel'),
);
export const LatestAccountsPanel = lazy(
  () => import('@/features/admin/components/latest-accounts-panel'),
);
export const MyGroupsPanel = lazy(() => import('@/components/panels/my-groups-panel'));
export const NewEventPanel = lazy(() => import('@/components/panels/new-event-panel'));
export const NewGroupPanel = lazy(() => import('@/components/panels/new-group-panel'));
export const NotificationsPanel = lazy(() => import('@/components/panels/notifications-panel'));
export const PinnedAccountsPanel = lazy(() => import('@/components/panels/pinned-accounts-panel'));
export const ProfileFieldsPanel = lazy(() => import('@/components/panels/profile-fields-panel'));
export const ProfileInfoPanel = lazy(() => import('@/components/panels/profile-info-panel'));
export const ProfileMediaPanel = lazy(() => import('@/components/panels/profile-media-panel'));
export const PromoPanel = lazy(() => import('@/components/panels/promo-panel'));
export const SignUpPanel = lazy(() => import('@/components/panels/sign-up-panel'));
export const TrendsPanel = lazy(() => import('@/components/panels/trends-panel'));
export const UserPanel = lazy(() => import('@/components/panels/user-panel'));
export const WhoToFollowPanel = lazy(() => import('@/components/panels/who-to-follow-panel'));

export const Audio = lazy(() => import('@/components/media/audio'));
export const ChatWidget = lazy(() => import('@/features/chats/components/chat-widget/chat-widget'));
export const ComposeEditor = lazy(() => import('@/features/compose/editor'));
export const ComposeForm = lazy(() => import('@/features/compose/components/compose-form'));
export const DatePicker = lazy(() => import('@/features/birthdays/date-picker'));
export const DropdownNavigation = lazy(() => import('@/components/navigation/dropdown-navigation'));
export const EmojiPicker = lazy(() => import('@/features/emoji/components/emoji-picker'));
export const EventHeader = lazy(() => import('@/components/statuses/events/event-header'));
export const MediaGallery = lazy(() => import('@/components/media/media-gallery'));
export const ModalRoot = lazy(() => import('@/features/ui/components/modal-root'));
export const ProfileField = lazy(() => import('@/features/ui/components/profile-field'));
export const AccountHoverCard = lazy(() => import('@/components/accounts/account-hover-card'));
export const StatusHoverCard = lazy(() => import('@/components/statuses/status-hover-card'));
export const Video = lazy(() => import('@/components/media/video'));
