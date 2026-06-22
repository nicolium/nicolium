import { create } from 'zustand';
import { mutative } from 'zustand-mutative';

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

type OpenModalProps =
  | [type: 'ALT_TEXT', props: AltTextModalProps, element?: HTMLElement, accountUrl?: string]
  | [
      type: 'ANTENNA_EDITOR',
      props: AntennaEditorModalProps,
      element?: HTMLElement,
      accountUrl?: string,
    ]
  | [
      type: 'BIRTHDAYS' | 'CREATE_GROUP' | 'HOTKEYS',
      props?: undefined,
      element?: HTMLElement,
      accountUrl?: string,
    ]
  | [type: 'BOOST', props: BoostModalProps, element?: HTMLElement, accountUrl?: string]
  | [
      type: 'CIRCLE_EDITOR',
      props: CircleEditorModalProps,
      element?: HTMLElement,
      accountUrl?: string,
    ]
  | [
      type: 'COMPARE_HISTORY',
      props: CompareHistoryModalProps,
      element?: HTMLElement,
      accountUrl?: string,
    ]
  | [type: 'COMPONENT', props: ComponentModalProps, element?: HTMLElement, accountUrl?: string]
  | [type: 'COMPOSE', props?: ComposeModalProps, element?: HTMLElement, accountUrl?: string]
  | [
      type: 'COMPOSE_INTERACTION_POLICY',
      props?: ComposeInteractionPolicyModalProps,
      element?: HTMLElement,
      accountUrl?: string,
    ]
  | [type: 'CONFIRM', props: ConfirmationModalProps, element?: HTMLElement, accountUrl?: string]
  | [type: 'CRYPTO_DONATE', props: ICryptoAddress]
  | [type: 'DISLIKES', props: DislikesModalProps, element?: HTMLElement, accountUrl?: string]
  | [
      type: 'DROPDOWN_MENU',
      props: DropdownMenuModalProps,
      element?: HTMLElement,
      accountUrl?: string,
    ]
  | [
      type: 'EDIT_ANNOUNCEMENT',
      props?: EditAnnouncementModalProps,
      element?: HTMLElement,
      accountUrl?: string,
    ]
  | [
      type: 'EDIT_BOOKMARK_FOLDER',
      props: EditBookmarkFolderModalProps,
      element?: HTMLElement,
      accountUrl?: string,
    ]
  | [type: 'EDIT_DOMAIN', props?: EditDomainModalProps, element?: HTMLElement, accountUrl?: string]
  | [
      type: 'EDIT_DOMAIN_BLOCK',
      props?: EditDomainBlockModalProps,
      element?: HTMLElement,
      accountUrl?: string,
    ]
  | [
      type: 'EDIT_FEDERATION',
      props: EditFederationModalProps,
      element?: HTMLElement,
      accountUrl?: string,
    ]
  | [type: 'EDIT_RULE', props?: EditRuleModalProps, element?: HTMLElement, accountUrl?: string]
  | [type: 'EMBED', props: EmbedModalProps, element?: HTMLElement, accountUrl?: string]
  | [type: 'EVENT_MAP', props: EventMapModalProps, element?: HTMLElement, accountUrl?: string]
  | [
      type: 'EVENT_PARTICIPANTS',
      props: EventParticipantsModalProps,
      element?: HTMLElement,
      accountUrl?: string,
    ]
  | [
      type: 'FAMILIAR_FOLLOWERS',
      props: FamiliarFollowersModalProps,
      element?: HTMLElement,
      accountUrl?: string,
    ]
  | [type: 'FAVOURITES', props: FavouritesModalProps, element?: HTMLElement, accountUrl?: string]
  | [type: 'JOIN_EVENT', props: JoinEventModalProps, element?: HTMLElement, accountUrl?: string]
  | [type: 'LIST_ADDER', props: ListAdderModalProps, element?: HTMLElement, accountUrl?: string]
  | [type: 'LIST_EDITOR', props: ListEditorModalProps, element?: HTMLElement, accountUrl?: string]
  | [type: 'MEDIA', props: MediaModalProps, element?: HTMLElement, accountUrl?: string]
  | [type: 'MENTIONS', props: MentionsModalProps, element?: HTMLElement, accountUrl?: string]
  | [
      type: 'MISSING_DESCRIPTION',
      props: MissingDescriptionModalProps,
      element?: HTMLElement,
      accountUrl?: string,
    ]
  | [type: 'BLOCK_MUTE', props: BlockMuteModalProps, element?: HTMLElement, accountUrl?: string]
  | [type: 'REACTIONS', props: ReactionsModalProps, element?: HTMLElement, accountUrl?: string]
  | [type: 'REBLOGS', props: ReblogsModalProps, element?: HTMLElement, accountUrl?: string]
  | [
      type: 'REPLY_MENTIONS',
      props: ReplyMentionsModalProps,
      element?: HTMLElement,
      accountUrl?: string,
    ]
  | [type: 'REPORT', props: ReportModalProps, element?: HTMLElement, accountUrl?: string]
  | [
      type: 'SELECT_BOOKMARK_FOLDER',
      props: SelectBookmarkFolderModalProps,
      element?: HTMLElement,
      accountUrl?: string,
    ]
  | [
      type: 'SELECT_DRIVE_FILE',
      props: SelectDriveFileModalProps,
      element?: HTMLElement,
      accountUrl?: string,
    ]
  | [type: 'TEXT_FIELD', props: TextFieldModalProps, element?: HTMLElement, accountUrl?: string]
  | [
      type: 'UNAUTHORIZED',
      props?: UnauthorizedModalProps,
      element?: HTMLElement,
      accountUrl?: string,
    ];

type ModalType = OpenModalProps[0];

type Modal = {
  modalType: ModalType;
  modalProps?: Record<string, any>;
  element?: HTMLElement;
  accountUrl?: string;
};

type Modals = Array<Modal>;

type State = {
  modals: Modals;
  actions: {
    /** Open a modal of the given type */
    openModal: (...args: OpenModalProps) => void;
    /** Close the modal */
    closeModal: (modalType?: ModalType | null, all?: boolean) => void;
  };
};

const useModalsStore = create<State>()(
  mutative(
    (set) => ({
      modals: [],
      actions: {
        openModal: (
          ...[modalType, modalProps, element = document.activeElement as HTMLElement, accountUrl]
        ) => {
          set((state) => {
            state.modals.push({ modalType, modalProps, element, accountUrl } as any);
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
      },
    }),
    {
      enableAutoFreeze: false,
    },
  ),
);

const useModalsActions = () => useModalsStore((state) => state.actions);
const useModals = () => useModalsStore((state) => state.modals);
const useHasModals = () => useModals().length > 0;

export { useModalsStore, useModalsActions, useModals, useHasModals };
