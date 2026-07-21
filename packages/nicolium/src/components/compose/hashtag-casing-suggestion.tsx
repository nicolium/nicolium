import React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';

import { changeSetting } from '@/actions/settings';
import { useCompose, useComposeActions } from '@/stores/compose';
import toast from '@/toast';

import Warning from './warning';

const messages = defineMessages({
  hashtagCasingSuggestionsDisabled: {
    id: 'compose.hashtag_casing_suggestion.disabled',
    defaultMessage: 'You will no longer receive suggestions about hashtag capitalization.',
  },
});

interface IHashtagCasingSuggestion {
  composeId: string;
}

const HashtagCasingSuggestion = ({ composeId }: IHashtagCasingSuggestion) => {
  const { updateCompose } = useComposeActions();

  const compose = useCompose(composeId);
  const suggestion = compose.hashtagCasingSuggestion;

  const onIgnore = () => {
    updateCompose(composeId, (draft) => {
      draft.hashtagCasingSuggestion = null;
      draft.hashtagCasingSuggestionIgnored = true;
    });
  };

  const onDontAskAgain = () => {
    changeSetting(['ignoreHashtagCasingSuggestions'], true, { showAlert: false, save: true });
    toast.info(messages.hashtagCasingSuggestionsDisabled);
    onIgnore();
  };

  if (!suggestion) return null;

  return (
    <Warning
      animated
      message={
        <div className='hashtag-casing-suggestion'>
          <span>
            <FormattedMessage
              id='compose.hashtag_casing_suggestion.body'
              defaultMessage='Does the hashtag {hashtag} include more than one word? Prefer capitalizing the first letter of each word for improved readability and accessibility.'
              values={{
                hashtag: <span className='hashtag-casing-suggestion__hashtag'>{suggestion}</span>,
              }}
            />
          </span>
          <div className='hashtag-casing-suggestion__actions'>
            <button type='button' onClick={onIgnore}>
              <FormattedMessage
                id='compose.hashtag_casing_suggestion.ignore'
                defaultMessage='Ignore'
              />
            </button>
            <button type='button' onClick={onDontAskAgain}>
              <FormattedMessage
                id='compose.hashtag_casing_suggestion.dont_ask_again'
                defaultMessage='Don’t ask again'
              />
            </button>
          </div>
        </div>
      }
    />
  );
};

export { HashtagCasingSuggestion as default };
