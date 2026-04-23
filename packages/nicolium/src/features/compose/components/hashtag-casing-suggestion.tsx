import React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';

import { changeSetting } from '@/actions/settings';
import Button from '@/components/ui/button';
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
        <div className='flex flex-col gap-1'>
          <span>
            <FormattedMessage
              id='compose.hashtag_casing_suggestion.body'
              defaultMessage='Does the hashtag {hashtag} include more than one word? Prefer capitalizing the first letter of each word for improved readability and accessibility.'
              values={{ hashtag: <span className='font-medium'>{suggestion}</span> }}
            />
          </span>
          <div className='flex justify-end gap-2'>
            <Button theme='muted' size='xs' onClick={onIgnore}>
              <FormattedMessage
                id='compose.hashtag_casing_suggestion.ignore'
                defaultMessage='Ignore'
              />
            </Button>
            <Button theme='muted' size='xs' onClick={onDontAskAgain}>
              <FormattedMessage
                id='compose.hashtag_casing_suggestion.dont_ask_again'
                defaultMessage='Don’t ask again'
              />
            </Button>
          </div>
        </div>
      }
    />
  );
};

export { HashtagCasingSuggestion as default };
