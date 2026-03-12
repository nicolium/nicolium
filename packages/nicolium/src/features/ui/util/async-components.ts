import { lazy } from 'react';

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
export const DropdownNavigation = lazy(() => import('@/components/navigation/dropdown-navigation'));
export const EmojiPicker = lazy(() => import('@/features/emoji/components/emoji-picker'));
export const EventHeader = lazy(() => import('@/features/event/components/event-header'));
export const MediaGallery = lazy(() => import('@/components/media/media-gallery'));
export const ModalRoot = lazy(() => import('@/features/ui/components/modal-root'));
export const ProfileField = lazy(() => import('@/features/ui/components/profile-field'));
export const AccountHoverCard = lazy(() => import('@/components/accounts/account-hover-card'));
export const StatusHoverCard = lazy(() => import('@/components/statuses/status-hover-card'));
export const Video = lazy(() => import('@/features/video'));
