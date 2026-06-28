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

type OpenModalProps =
  | [type: 'ALT_TEXT', props: AltTextModalProps, element?: HTMLElement, scopeUrl?: string]
  | [
      type: 'ANTENNA_EDITOR',
      props: AntennaEditorModalProps,
      element?: HTMLElement,
      scopeUrl?: string,
    ]
  | [
      type: 'BIRTHDAYS' | 'CREATE_GROUP' | 'HOTKEYS',
      props?: undefined,
      element?: HTMLElement,
      scopeUrl?: string,
    ]
  | [type: 'BOOST', props: BoostModalProps, element?: HTMLElement, scopeUrl?: string]
  | [type: 'CIRCLE_EDITOR', props: CircleEditorModalProps, element?: HTMLElement, scopeUrl?: string]
  | [
      type: 'COMPARE_HISTORY',
      props: CompareHistoryModalProps,
      element?: HTMLElement,
      scopeUrl?: string,
    ]
  | [type: 'COMPONENT', props: ComponentModalProps, element?: HTMLElement, scopeUrl?: string]
  | [type: 'COMPOSE', props?: ComposeModalProps, element?: HTMLElement, scopeUrl?: string]
  | [
      type: 'COMPOSE_INTERACTION_POLICY',
      props?: ComposeInteractionPolicyModalProps,
      element?: HTMLElement,
      scopeUrl?: string,
    ]
  | [type: 'CONFIRM', props: ConfirmationModalProps, element?: HTMLElement, scopeUrl?: string]
  | [type: 'CRYPTO_DONATE', props: ICryptoAddress]
  | [type: 'DISLIKES', props: DislikesModalProps, element?: HTMLElement, scopeUrl?: string]
  | [type: 'DROPDOWN_MENU', props: DropdownMenuModalProps, element?: HTMLElement, scopeUrl?: string]
  | [
      type: 'EDIT_ANNOUNCEMENT',
      props?: EditAnnouncementModalProps,
      element?: HTMLElement,
      scopeUrl?: string,
    ]
  | [
      type: 'EDIT_BOOKMARK_FOLDER',
      props: EditBookmarkFolderModalProps,
      element?: HTMLElement,
      scopeUrl?: string,
    ]
  | [type: 'EDIT_DOMAIN', props?: EditDomainModalProps, element?: HTMLElement, scopeUrl?: string]
  | [
      type: 'EDIT_DOMAIN_BLOCK',
      props?: EditDomainBlockModalProps,
      element?: HTMLElement,
      scopeUrl?: string,
    ]
  | [
      type: 'EDIT_FEDERATION',
      props: EditFederationModalProps,
      element?: HTMLElement,
      scopeUrl?: string,
    ]
  | [type: 'EDIT_RULE', props?: EditRuleModalProps, element?: HTMLElement, scopeUrl?: string]
  | [type: 'EMBED', props: EmbedModalProps, element?: HTMLElement, scopeUrl?: string]
  | [type: 'EVENT_MAP', props: EventMapModalProps, element?: HTMLElement, scopeUrl?: string]
  | [
      type: 'EVENT_PARTICIPANTS',
      props: EventParticipantsModalProps,
      element?: HTMLElement,
      scopeUrl?: string,
    ]
  | [
      type: 'FAMILIAR_FOLLOWERS',
      props: FamiliarFollowersModalProps,
      element?: HTMLElement,
      scopeUrl?: string,
    ]
  | [type: 'FAVOURITES', props: FavouritesModalProps, element?: HTMLElement, scopeUrl?: string]
  | [type: 'INTERACT_AS', props: InteractAsModalProps, element?: HTMLElement, scopeUrl?: string]
  | [type: 'JOIN_EVENT', props: JoinEventModalProps, element?: HTMLElement, scopeUrl?: string]
  | [type: 'LIST_ADDER', props: ListAdderModalProps, element?: HTMLElement, scopeUrl?: string]
  | [type: 'LIST_EDITOR', props: ListEditorModalProps, element?: HTMLElement, scopeUrl?: string]
  | [type: 'MEDIA', props: MediaModalProps, element?: HTMLElement, scopeUrl?: string]
  | [type: 'MENTIONS', props: MentionsModalProps, element?: HTMLElement, scopeUrl?: string]
  | [
      type: 'MISSING_DESCRIPTION',
      props: MissingDescriptionModalProps,
      element?: HTMLElement,
      scopeUrl?: string,
    ]
  | [type: 'BLOCK_MUTE', props: BlockMuteModalProps, element?: HTMLElement, scopeUrl?: string]
  | [type: 'REACTIONS', props: ReactionsModalProps, element?: HTMLElement, scopeUrl?: string]
  | [type: 'REBLOGS', props: ReblogsModalProps, element?: HTMLElement, scopeUrl?: string]
  | [
      type: 'REPLY_MENTIONS',
      props: ReplyMentionsModalProps,
      element?: HTMLElement,
      scopeUrl?: string,
    ]
  | [type: 'REPORT', props: ReportModalProps, element?: HTMLElement, scopeUrl?: string]
  | [
      type: 'SELECT_BOOKMARK_FOLDER',
      props: SelectBookmarkFolderModalProps,
      element?: HTMLElement,
      scopeUrl?: string,
    ]
  | [
      type: 'SELECT_DRIVE_FILE',
      props: SelectDriveFileModalProps,
      element?: HTMLElement,
      scopeUrl?: string,
    ]
  | [type: 'TEXT_FIELD', props: TextFieldModalProps, element?: HTMLElement, scopeUrl?: string]
  | [
      type: 'UNAUTHORIZED',
      props?: UnauthorizedModalProps,
      element?: HTMLElement,
      scopeUrl?: string,
    ];

type ModalType = OpenModalProps[0];

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

  const openModal: (...args: OpenModalProps) => void = (...args) => {
    const [type, props, element] = args;
    actions.openModal(...([type, props, element, scopeUrl] as OpenModalProps));
  };

  return {
    openModal,
    closeModal: actions.closeModal,
  };
};

export { useModalsStore, useModalsActions, useModals, useHasModals };
