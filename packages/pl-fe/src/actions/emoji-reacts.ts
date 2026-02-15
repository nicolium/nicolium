import { defineMessages, IntlShape } from 'react-intl';

import { useSettingsStore } from '@/stores/settings';
import toast from '@/toast';
import { isLoggedIn } from '@/utils/auth';
import { supportsEmojiReacts } from '@/utils/check-instance-capability';

import { getClient } from '../api';

import { importEntities } from './importer';

import type { AppDispatch, RootState } from '@/store';

const EMOJI_REACT_REQUEST = 'EMOJI_REACT_REQUEST' as const;
const EMOJI_REACT_FAIL = 'EMOJI_REACT_FAIL' as const;

const UNEMOJI_REACT_REQUEST = 'UNEMOJI_REACT_REQUEST' as const;

const messages = defineMessages({
  unsupported: { id: 'emoji_reactions.unsupported_by_remote', defaultMessage: '@{acct}’s instance most likely doesn’t understand emoji reactions. The user will not get notified of the reaction.' },
});

const noOp = () => () => new Promise(f =>{
  f(undefined);
});

const emojiReact = (statusId: string, emoji: string, custom: string | undefined = undefined, intl: IntlShape) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return dispatch(noOp());

    dispatch(emojiReactRequest(statusId, emoji, custom));

    return getClient(getState).statuses.createStatusReaction(statusId, emoji).then((response) => {
      dispatch(importEntities({ statuses: [response] }));

      const checkEmojiReactsSupport = !response.account.local && useSettingsStore.getState().settings.checkEmojiReactsSupport;

      if (checkEmojiReactsSupport) {
        supportsEmojiReacts(response.account.ap_id ?? response.account.url).then((result) => {
          if (result === 'false') {
            toast.info(intl.formatMessage(messages.unsupported, { acct: response.account.acct }));
          }
        }).catch((e) => {});
      }
    }).catch((error) => {
      dispatch(emojiReactFail(statusId, emoji, error));
    });
  };

const unEmojiReact = (statusId: string, emoji: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return dispatch(noOp());

    dispatch(unEmojiReactRequest(statusId, emoji));

    return getClient(getState).statuses.deleteStatusReaction(statusId, emoji).then(response => {
      dispatch(importEntities({ statuses: [response] }));
    });
  };

const emojiReactRequest = (statusId: string, emoji: string, custom?: string) => ({
  type: EMOJI_REACT_REQUEST,
  statusId,
  emoji,
  custom,
});

const emojiReactFail = (statusId: string, emoji: string, error: unknown) => ({
  type: EMOJI_REACT_FAIL,
  statusId,
  emoji,
  error,
});

const unEmojiReactRequest = (statusId: string, emoji: string) => ({
  type: UNEMOJI_REACT_REQUEST,
  statusId,
  emoji,
});

type EmojiReactsAction =
  | ReturnType<typeof emojiReactRequest>
  | ReturnType<typeof emojiReactFail>
  | ReturnType<typeof unEmojiReactRequest>

export {
  EMOJI_REACT_REQUEST,
  EMOJI_REACT_FAIL,
  UNEMOJI_REACT_REQUEST,
  emojiReact,
  unEmojiReact,
  type EmojiReactsAction,
};
