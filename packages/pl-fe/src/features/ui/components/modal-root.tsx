import React, { Suspense, lazy } from 'react';

import { cancelReplyCompose } from 'pl-fe/actions/compose';
import Base from 'pl-fe/components/modal-root';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useModals, useModalsActions } from 'pl-fe/stores/modals';

import ModalLoading from './modal-loading';

/* eslint sort-keys: "error" */
const MODAL_COMPONENTS = {
  ALT_TEXT: lazy(() => import('pl-fe/modals/alt-text-modal')),
  ANTENNA_EDITOR: lazy(() => import('pl-fe/modals/antenna-editor-modal')),
  BIRTHDAYS: lazy(() => import('pl-fe/modals/birthdays-modal')),
  BLOCK_MUTE: lazy(() => import('pl-fe/modals/block-mute-modal')),
  BOOST: lazy(() => import('pl-fe/modals/boost-modal')),
  CIRCLE_EDITOR: lazy(() => import('pl-fe/modals/circle-editor-modal')),
  COMPARE_HISTORY: lazy(() => import('pl-fe/modals/compare-history-modal')),
  COMPONENT: lazy(() => import('pl-fe/modals/component-modal')),
  COMPOSE: lazy(() => import('pl-fe/modals/compose-modal')),
  COMPOSE_INTERACTION_POLICY: lazy(() => import('pl-fe/modals/compose-interaction-policy-modal')),
  CONFIRM: lazy(() => import('pl-fe/modals/confirmation-modal')),
  CREATE_GROUP: lazy(() => import('pl-fe/modals/manage-group-modal')),
  CRYPTO_DONATE: lazy(() => import('pl-fe/modals/crypto-donate-modal')),
  DISLIKES: lazy(() => import('pl-fe/modals/dislikes-modal')),
  DROPDOWN_MENU: lazy(() => import('pl-fe/modals/dropdown-menu-modal')),
  EDIT_ANNOUNCEMENT: lazy(() => import('pl-fe/modals/edit-announcement-modal')),
  EDIT_BOOKMARK_FOLDER: lazy(() => import('pl-fe/modals/edit-bookmark-folder-modal')),
  EDIT_DOMAIN: lazy(() => import('pl-fe/modals/edit-domain-modal')),
  EDIT_FEDERATION: lazy(() => import('pl-fe/modals/edit-federation-modal')),
  EDIT_RULE: lazy(() => import('pl-fe/modals/edit-rule-modal')),
  EMBED: lazy(() => import('pl-fe/modals/embed-modal')),
  EVENT_MAP: lazy(() => import('pl-fe/modals/event-map-modal')),
  EVENT_PARTICIPANTS: lazy(() => import('pl-fe/modals/event-participants-modal')),
  FAMILIAR_FOLLOWERS: lazy(() => import('pl-fe/modals/familiar-followers-modal')),
  FAVOURITES: lazy(() => import('pl-fe/modals/favourites-modal')),
  HOTKEYS: lazy(() => import('pl-fe/modals/hotkeys-modal')),
  JOIN_EVENT: lazy(() => import('pl-fe/modals/join-event-modal')),
  LIST_ADDER: lazy(() => import('pl-fe/modals/list-adder-modal')),
  LIST_EDITOR: lazy(() => import('pl-fe/modals/list-editor-modal')),
  MEDIA: lazy(() => import('pl-fe/modals/media-modal')),
  MENTIONS: lazy(() => import('pl-fe/modals/mentions-modal')),
  MISSING_DESCRIPTION: lazy(() => import('pl-fe/modals/missing-description-modal')),
  REACTIONS: lazy(() => import('pl-fe/modals/reactions-modal')),
  REBLOGS: lazy(() => import('pl-fe/modals/reblogs-modal')),
  REPLY_MENTIONS: lazy(() => import('pl-fe/modals/reply-mentions-modal')),
  REPORT: lazy(() => import('pl-fe/modals/report-modal')),
  SELECT_BOOKMARK_FOLDER: lazy(() => import('pl-fe/modals/select-bookmark-folder-modal')),
  SELECT_DRIVE_FILE: lazy(() => import('pl-fe/modals/select-drive-file-modal')),
  TEXT_FIELD: lazy(() => import('pl-fe/modals/text-field-modal')),
  UNAUTHORIZED: lazy(() => import('pl-fe/modals/unauthorized-modal')),
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
  const { modalType: type, modalProps: props } = modals.at(-1) || { modalProps: {}, modalType: null };
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
