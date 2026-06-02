import { lazy } from 'react';

export const AccountHoverCard = lazy(() => import('@/components/accounts/account-hover-card'));
export const Audio = lazy(() => import('@/components/media/audio'));
export const ChatWidget = lazy(() => import('@/features/chats/components/chat-widget/chat-widget'));
export const ComposeEditor = lazy(() => import('@/features/compose/editor'));
export const ComposeForm = lazy(() => import('@/features/compose/components/compose-form'));
export const DatePicker = lazy(() => import('@/components/ui/date-picker'));
export const DropdownNavigation = lazy(() => import('@/components/navigation/dropdown-navigation'));
export const EmojiPicker = lazy(() => import('@/features/emoji/components/emoji-picker'));
export const EventHeader = lazy(() => import('@/components/statuses/events/event-header'));
export const MediaGallery = lazy(() => import('@/components/media/media-gallery'));
export const ModalRoot = lazy(() => import('@/features/ui/components/modal-root'));
export const ProfileField = lazy(() => import('@/components/accounts/profile-field'));
export const ProfileInfoPanel = lazy(() => import('@/components/panels/profile-info-panel'));
export const StatusHoverCard = lazy(() => import('@/components/statuses/status-hover-card'));
export const UserPanel = lazy(() => import('@/components/accounts/user-panel'));
export const Video = lazy(() => import('@/components/media/video'));
