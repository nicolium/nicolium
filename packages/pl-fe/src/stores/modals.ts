import { create } from 'zustand';
import { mutative } from 'zustand-mutative';

import type { ICryptoAddress } from 'pl-fe/features/crypto-donate/components/crypto-address';
import type { ModalType } from 'pl-fe/features/ui/components/modal-root';
import type { AltTextModalProps } from 'pl-fe/modals/alt-text-modal';
import type { BoostModalProps } from 'pl-fe/modals/boost-modal';
import type { CircleEditorModalProps } from 'pl-fe/modals/circle-editor-modal';
import type { CompareHistoryModalProps } from 'pl-fe/modals/compare-history-modal';
import type { ComponentModalProps } from 'pl-fe/modals/component-modal';
import type { ComposeInteractionPolicyModalProps } from 'pl-fe/modals/compose-interaction-policy-modal';
import type { ComposeModalProps } from 'pl-fe/modals/compose-modal';
import type { ConfirmationModalProps } from 'pl-fe/modals/confirmation-modal';
import type { DislikesModalProps } from 'pl-fe/modals/dislikes-modal';
import type { DropdownMenuModalProps } from 'pl-fe/modals/dropdown-menu-modal';
import type { EditAnnouncementModalProps } from 'pl-fe/modals/edit-announcement-modal';
import type { EditBookmarkFolderModalProps } from 'pl-fe/modals/edit-bookmark-folder-modal';
import type { EditDomainModalProps } from 'pl-fe/modals/edit-domain-modal';
import type { EditFederationModalProps } from 'pl-fe/modals/edit-federation-modal';
import type { EditRuleModalProps } from 'pl-fe/modals/edit-rule-modal';
import type { EmbedModalProps } from 'pl-fe/modals/embed-modal';
import type { EventMapModalProps } from 'pl-fe/modals/event-map-modal';
import type { EventParticipantsModalProps } from 'pl-fe/modals/event-participants-modal';
import type { FamiliarFollowersModalProps } from 'pl-fe/modals/familiar-followers-modal';
import type { FavouritesModalProps } from 'pl-fe/modals/favourites-modal';
import type { JoinEventModalProps } from 'pl-fe/modals/join-event-modal';
import type { ListAdderModalProps } from 'pl-fe/modals/list-adder-modal';
import type { ListEditorModalProps } from 'pl-fe/modals/list-editor-modal';
import type { MediaModalProps } from 'pl-fe/modals/media-modal';
import type { MentionsModalProps } from 'pl-fe/modals/mentions-modal';
import type { MissingDescriptionModalProps } from 'pl-fe/modals/missing-description-modal';
import type { MuteModalProps } from 'pl-fe/modals/mute-modal';
import type { ReactionsModalProps } from 'pl-fe/modals/reactions-modal';
import type { ReblogsModalProps } from 'pl-fe/modals/reblogs-modal';
import type { ReplyMentionsModalProps } from 'pl-fe/modals/reply-mentions-modal';
import type { ReportModalProps } from 'pl-fe/modals/report-modal';
import type { SelectBookmarkFolderModalProps } from 'pl-fe/modals/select-bookmark-folder-modal';
import type { TextFieldModalProps } from 'pl-fe/modals/text-field-modal';
import type { UnauthorizedModalProps } from 'pl-fe/modals/unauthorized-modal';

type OpenModalProps =
  | [type: 'ALT_TEXT', props: AltTextModalProps]
  | [type: 'BIRTHDAYS' | 'CREATE_GROUP' | 'HOTKEYS']
  | [type: 'BOOST', props: BoostModalProps]
  | [type: 'CIRCLE_EDITOR', props: CircleEditorModalProps]
  | [type: 'COMPARE_HISTORY', props: CompareHistoryModalProps]
  | [type: 'COMPONENT', props: ComponentModalProps]
  | [type: 'COMPOSE', props?: ComposeModalProps]
  | [type: 'COMPOSE_INTERACTION_POLICY', props?: ComposeInteractionPolicyModalProps]
  | [type: 'CONFIRM', props: ConfirmationModalProps]
  | [type: 'CRYPTO_DONATE', props: ICryptoAddress]
  | [type: 'DISLIKES', props: DislikesModalProps]
  | [type: 'DROPDOWN_MENU', props: DropdownMenuModalProps]
  | [type: 'EDIT_ANNOUNCEMENT', props?: EditAnnouncementModalProps]
  | [type: 'EDIT_BOOKMARK_FOLDER', props: EditBookmarkFolderModalProps]
  | [type: 'EDIT_DOMAIN', props?: EditDomainModalProps]
  | [type: 'EDIT_FEDERATION', props: EditFederationModalProps]
  | [type: 'EDIT_RULE', props?: EditRuleModalProps]
  | [type: 'EMBED', props: EmbedModalProps]
  | [type: 'EVENT_MAP', props: EventMapModalProps]
  | [type: 'EVENT_PARTICIPANTS', props: EventParticipantsModalProps]
  | [type: 'FAMILIAR_FOLLOWERS', props: FamiliarFollowersModalProps]
  | [type: 'FAVOURITES', props: FavouritesModalProps]
  | [type: 'JOIN_EVENT', props: JoinEventModalProps]
  | [type: 'LIST_ADDER', props: ListAdderModalProps]
  | [type: 'LIST_EDITOR', props: ListEditorModalProps]
  | [type: 'MEDIA', props: MediaModalProps]
  | [type: 'MENTIONS', props: MentionsModalProps]
  | [type: 'MISSING_DESCRIPTION', props: MissingDescriptionModalProps]
  | [type: 'MUTE', props: MuteModalProps]
  | [type: 'REACTIONS', props: ReactionsModalProps]
  | [type: 'REBLOGS', props: ReblogsModalProps]
  | [type: 'REPLY_MENTIONS', props: ReplyMentionsModalProps]
  | [type: 'REPORT', props: ReportModalProps]
  | [type: 'SELECT_BOOKMARK_FOLDER', props: SelectBookmarkFolderModalProps]
  | [type: 'TEXT_FIELD', props: TextFieldModalProps]
  | [type: 'UNAUTHORIZED', props?: UnauthorizedModalProps];

type Modals = Array<{
  modalType: ModalType;
  modalProps?: Record<string, any>;
}>;

type State = {
  modals: Modals;
  actions: {
    /** Open a modal of the given type */
    openModal: (...[modalType, modalProps]: OpenModalProps) => void;
    /** Close the modal */
    closeModal: (modalType?: ModalType) => void;
  };
};

const useModalsStore = create<State>()(mutative((set) => ({
  modals: [],
  actions: {
    openModal: (...[modalType, modalProps]) => set((state: State) => {
      state.modals.push({ modalType, modalProps });
    }),
    closeModal: (modalType) => set((state: State) => {
      if (state.modals.length === 0) {
        return;
      }
      let closedModal: Record<string, any> | undefined;
      if (modalType === undefined) {
        closedModal = state.modals[state.modals.length - 1].modalProps;
        state.modals = state.modals.slice(0, -1);
      } else if (state.modals.some((modal) => modalType === modal.modalType)) {
        const lastIndex = state.modals.findLastIndex((modal) => modalType === modal.modalType);
        closedModal = state.modals[lastIndex].modalProps;
        state.modals = state.modals.slice(0, lastIndex);
      }
      if (closedModal?.element) {
        const element = closedModal.element;
        setTimeout(() => element.focus(), 0);
      }
    }),
  },
}), {
  enableAutoFreeze: false,
}));

const useModalsActions = () => useModalsStore((state) => state.actions);
const useModals = () => useModalsStore((state) => state.modals);
const useHasModals = () => useModals().length > 0;

export { useModalsStore, useModalsActions, useModals, useHasModals };
