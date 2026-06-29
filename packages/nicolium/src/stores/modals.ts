import { create } from 'zustand';
import { mutative } from 'zustand-mutative';

import { useScopeUrl } from '@/hooks/use-scope-url';

import type { ICryptoAddress } from '@/features/crypto-donate/components/crypto-address';
import type { AltTextModalProps } from '@/modals/alt-text-modal';
import type { AntennaEditorModalProps } from '@/modals/antenna-editor-modal';
import type { BlockMuteModalProps } from '@/modals/block-mute-modal';
import type { BoostModalProps } from '@/modals/boost-modal';
import type { CircleEditorModalProps } from '@/modals/circle-editor-modal';
import type { CompareHistoryModalProps } from '@/modals/compare-history-modal';
import type { ComponentModalProps } from '@/modals/component-modal';
import type { ComposeInteractionPolicyModalProps } from '@/modals/compose-interaction-policy-modal';
import type { ComposeModalProps } from '@/modals/compose-modal';
import type { ConfirmationModalProps } from '@/modals/confirmation-modal';
import type { DislikesModalProps } from '@/modals/dislikes-modal';
import type { DropdownMenuModalProps } from '@/modals/dropdown-menu-modal';
import type { EditAnnouncementModalProps } from '@/modals/edit-announcement-modal';
import type { EditBookmarkFolderModalProps } from '@/modals/edit-bookmark-folder-modal';
import type { EditDomainBlockModalProps } from '@/modals/edit-domain-block-modal';
import type { EditDomainModalProps } from '@/modals/edit-domain-modal';
import type { EditFederationModalProps } from '@/modals/edit-federation-modal';
import type { EditRuleModalProps } from '@/modals/edit-rule-modal';
import type { EmbedModalProps } from '@/modals/embed-modal';
import type { EventMapModalProps } from '@/modals/event-map-modal';
import type { EventParticipantsModalProps } from '@/modals/event-participants-modal';
import type { FamiliarFollowersModalProps } from '@/modals/familiar-followers-modal';
import type { FavouritesModalProps } from '@/modals/favourites-modal';
import type { InteractAsModalProps } from '@/modals/interact-as-modal';
import type { JoinEventModalProps } from '@/modals/join-event-modal';
import type { ListAdderModalProps } from '@/modals/list-adder-modal';
import type { ListEditorModalProps } from '@/modals/list-editor-modal';
import type { MediaModalProps } from '@/modals/media-modal';
import type { MentionsModalProps } from '@/modals/mentions-modal';
import type { MissingDescriptionModalProps } from '@/modals/missing-description-modal';
import type { ReactionsModalProps } from '@/modals/reactions-modal';
import type { ReblogsModalProps } from '@/modals/reblogs-modal';
import type { ReplyMentionsModalProps } from '@/modals/reply-mentions-modal';
import type { ReportModalProps } from '@/modals/report-modal';
import type { SelectBookmarkFolderModalProps } from '@/modals/select-bookmark-folder-modal';
import type { SelectDriveFileModalProps } from '@/modals/select-drive-file-modal';
import type { TextFieldModalProps } from '@/modals/text-field-modal';
import type { UnauthorizedModalProps } from '@/modals/unauthorized-modal';

type OpenModalType = {
  ALT_TEXT: AltTextModalProps;
  ANTENNA_EDITOR: AntennaEditorModalProps;
  BIRTHDAYS: undefined;
  BLOCK_MUTE: BlockMuteModalProps;
  BOOST: BoostModalProps;
  CIRCLE_EDITOR: CircleEditorModalProps;
  COMPARE_HISTORY: CompareHistoryModalProps;
  COMPONENT: ComponentModalProps;
  COMPOSE: ComposeModalProps;
  COMPOSE_INTERACTION_POLICY: ComposeInteractionPolicyModalProps;
  CONFIRM: ConfirmationModalProps;
  CREATE_GROUP: undefined;
  CRYPTO_DONATE: ICryptoAddress;
  DISLIKES: DislikesModalProps;
  DROPDOWN_MENU: DropdownMenuModalProps;
  EDIT_ANNOUNCEMENT: EditAnnouncementModalProps;
  EDIT_BOOKMARK_FOLDER: EditBookmarkFolderModalProps;
  EDIT_DOMAIN: EditDomainModalProps;
  EDIT_DOMAIN_BLOCK: EditDomainBlockModalProps;
  EDIT_FEDERATION: EditFederationModalProps;
  EDIT_RULE: EditRuleModalProps;
  EMBED: EmbedModalProps;
  EVENT_MAP: EventMapModalProps;
  EVENT_PARTICIPANTS: EventParticipantsModalProps;
  FAMILIAR_FOLLOWERS: FamiliarFollowersModalProps;
  FAVOURITES: FavouritesModalProps;
  HOTKEYS: undefined;
  INTERACT_AS: InteractAsModalProps;
  JOIN_EVENT: JoinEventModalProps;
  LIST_ADDER: ListAdderModalProps;
  LIST_EDITOR: ListEditorModalProps;
  MEDIA: MediaModalProps;
  MENTIONS: MentionsModalProps;
  MISSING_DESCRIPTION: MissingDescriptionModalProps;
  REACTIONS: ReactionsModalProps;
  REBLOGS: ReblogsModalProps;
  REPLY_MENTIONS: ReplyMentionsModalProps;
  REPORT: ReportModalProps;
  SELECT_BOOKMARK_FOLDER: SelectBookmarkFolderModalProps;
  SELECT_DRIVE_FILE: SelectDriveFileModalProps;
  TEXT_FIELD: TextFieldModalProps;
  UNAUTHORIZED: UnauthorizedModalProps;
};

type ModalType = keyof OpenModalType;

type Modal = {
  modalType: ModalType;
  modalProps?: Record<string, any>;
  element?: HTMLElement;
  scopeUrl?: string;
};

type Modals = Array<Modal>;

type State = {
  modals: Modals;
  actions: {
    /** Open a modal of the given type */
    openModal: <T extends ModalType>(
      type: T,
      props?: OpenModalType[T],
      element?: HTMLElement,
      scopeUrl?: string,
    ) => void;
    /** Close the modal */
    closeModal: (modalType?: ModalType | null, all?: boolean) => void;
    /** Update the account scope of the topmost modal */
    setScopeUrl: (scopeUrl: string) => void;
  };
};

const useModalsStore = create<State>()(
  mutative(
    (set) => ({
      modals: [],
      actions: {
        openModal: (
          ...[modalType, modalProps, element = document.activeElement as HTMLElement, scopeUrl]
        ) => {
          set((state) => {
            state.modals.push({ modalType, modalProps, element, scopeUrl } as any);
          });
        },
        closeModal: (modalType, all) => {
          set((state) => {
            if (state.modals.length === 0) {
              return;
            }
            let closedModal: (typeof state.modals)[number] | undefined;
            if (all) {
              closedModal = state.modals[0];
              state.modals = [];
            } else if (!modalType) {
              closedModal = state.modals[state.modals.length - 1];
              state.modals = state.modals.slice(0, -1);
            } else if (state.modals.some((modal) => modalType === modal.modalType)) {
              const lastIndex = state.modals.findLastIndex(
                (modal) => modalType === modal.modalType,
              );
              closedModal = state.modals[lastIndex];
              state.modals = state.modals.slice(0, lastIndex);
            }
            const element = closedModal?.element || closedModal?.modalProps?.element;
            if (element) {
              setTimeout(() => (element as HTMLElement).focus(), 0);
            }
          });
        },
        setScopeUrl: (scopeUrl) => {
          set((state) => {
            const modal = state.modals.at(-1);
            if (modal) modal.scopeUrl = scopeUrl;
          });
        },
      },
    }),
    {
      enableAutoFreeze: false,
    },
  ),
);

const useModals = () => useModalsStore((state) => state.modals);
const useHasModals = () => useModals().length > 0;

const useModalsActions = () => {
  const scopeUrl = useScopeUrl();
  const actions = useModalsStore((state) => state.actions);

  const openModal: <T extends ModalType>(
    type: T,
    props?: OpenModalType[T],
    element?: HTMLElement,
  ) => void = (...args) => {
    const [type, props, element] = args;
    actions.openModal(type, props, element, scopeUrl);
  };

  return {
    openModal,
    closeModal: actions.closeModal,
    setScopeUrl: actions.setScopeUrl,
  };
};

export { useModalsStore, useModalsActions, useModals, useHasModals };
