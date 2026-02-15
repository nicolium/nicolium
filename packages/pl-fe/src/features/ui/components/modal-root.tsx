import React, { Suspense, lazy } from 'react';

import { cancelReplyCompose } from '@/actions/compose';
import Base from '@/components/modal-root';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useModals, useModalsActions } from '@/stores/modals';

import ModalLoading from './modal-loading';

/* eslint sort-keys: "error" */
const MODAL_COMPONENTS = {
  ALT_TEXT: lazy(() => import('@/modals/alt-text-modal')),
  ANTENNA_EDITOR: lazy(() => import('@/modals/antenna-editor-modal')),
  BIRTHDAYS: lazy(() => import('@/modals/birthdays-modal')),
  BLOCK_MUTE: lazy(() => import('@/modals/block-mute-modal')),
  BOOST: lazy(() => import('@/modals/boost-modal')),
  CIRCLE_EDITOR: lazy(() => import('@/modals/circle-editor-modal')),
  COMPARE_HISTORY: lazy(() => import('@/modals/compare-history-modal')),
  COMPONENT: lazy(() => import('@/modals/component-modal')),
  COMPOSE: lazy(() => import('@/modals/compose-modal')),
  COMPOSE_INTERACTION_POLICY: lazy(() => import('@/modals/compose-interaction-policy-modal')),
  CONFIRM: lazy(() => import('@/modals/confirmation-modal')),
  CREATE_GROUP: lazy(() => import('@/modals/manage-group-modal')),
  CRYPTO_DONATE: lazy(() => import('@/modals/crypto-donate-modal')),
  DISLIKES: lazy(() => import('@/modals/dislikes-modal')),
  DROPDOWN_MENU: lazy(() => import('@/modals/dropdown-menu-modal')),
  EDIT_ANNOUNCEMENT: lazy(() => import('@/modals/edit-announcement-modal')),
  EDIT_BOOKMARK_FOLDER: lazy(() => import('@/modals/edit-bookmark-folder-modal')),
  EDIT_DOMAIN: lazy(() => import('@/modals/edit-domain-modal')),
  EDIT_FEDERATION: lazy(() => import('@/modals/edit-federation-modal')),
  EDIT_RULE: lazy(() => import('@/modals/edit-rule-modal')),
  EMBED: lazy(() => import('@/modals/embed-modal')),
  EVENT_MAP: lazy(() => import('@/modals/event-map-modal')),
  EVENT_PARTICIPANTS: lazy(() => import('@/modals/event-participants-modal')),
  FAMILIAR_FOLLOWERS: lazy(() => import('@/modals/familiar-followers-modal')),
  FAVOURITES: lazy(() => import('@/modals/favourites-modal')),
  HOTKEYS: lazy(() => import('@/modals/hotkeys-modal')),
  JOIN_EVENT: lazy(() => import('@/modals/join-event-modal')),
  LIST_ADDER: lazy(() => import('@/modals/list-adder-modal')),
  LIST_EDITOR: lazy(() => import('@/modals/list-editor-modal')),
  MEDIA: lazy(() => import('@/modals/media-modal')),
  MENTIONS: lazy(() => import('@/modals/mentions-modal')),
  MISSING_DESCRIPTION: lazy(() => import('@/modals/missing-description-modal')),
  REACTIONS: lazy(() => import('@/modals/reactions-modal')),
  REBLOGS: lazy(() => import('@/modals/reblogs-modal')),
  REPLY_MENTIONS: lazy(() => import('@/modals/reply-mentions-modal')),
  REPORT: lazy(() => import('@/modals/report-modal')),
  SELECT_BOOKMARK_FOLDER: lazy(() => import('@/modals/select-bookmark-folder-modal')),
  SELECT_DRIVE_FILE: lazy(() => import('@/modals/select-drive-file-modal')),
  TEXT_FIELD: lazy(() => import('@/modals/text-field-modal')),
  UNAUTHORIZED: lazy(() => import('@/modals/unauthorized-modal')),
};

type ModalType = keyof typeof MODAL_COMPONENTS | null;

type BaseModalProps = {
  /** Action to close the modal. */
  onClose(type?: ModalType): void;
};

const ModalRoot: React.FC = () => {
  const renderLoading = (modalId: string) => !['MEDIA', 'BOOST', 'CONFIRM'].includes(modalId) ? <ModalLoading /> : null;

  const dispatch = useAppDispatch();
  const modals = useModals();
  const { closeModal } = useModalsActions();
  const { modalType: type, modalProps: props } = modals.at(-1) ?? { modalProps: {}, modalType: null };
  const index = modals.length - 1;

  const onClickClose = (type?: ModalType, all?: boolean) => {
    switch (type) {
      case 'COMPOSE':
        dispatch(cancelReplyCompose());
        break;
      default:
        break;
    }

    closeModal(type, all);
  };

  const Component = type !== null ? (MODAL_COMPONENTS as Record<keyof typeof MODAL_COMPONENTS, React.ExoticComponent<any>>)[type] : null;

  return (
    <Base onClose={onClickClose} type={type} modalIndex={index}>
      {(Component && !!type) && (
        <Suspense fallback={renderLoading(type)}>
          <Component key={index} {...props} onClose={onClickClose} />
        </Suspense>
      )}
    </Base>
  );
};

export { type BaseModalProps, type ModalType, ModalRoot as default };
