import React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';

import { ignoreHashtagCasingSuggestion } from 'pl-fe/actions/compose';
import { changeSetting } from 'pl-fe/actions/settings';
import Button from 'pl-fe/components/ui/button';
import HStack from 'pl-fe/components/ui/hstack';
import Stack from 'pl-fe/components/ui/stack';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useCompose } from 'pl-fe/hooks/use-compose';
import toast from 'pl-fe/toast';

import Warning from './warning';

const messages = defineMessages({
  hashtagCasingSuggestionsDisabled: { id: 'compose.hashtag_casing_suggestion.disabled', defaultMessage: 'You will no longer receive suggestions about hashtag capitalization.' },
});

interface IHashtagCasingSuggestion {
  composeId: string;
}

const HashtagCasingSuggestion = ({
  composeId,
}: IHashtagCasingSuggestion) => {
  const dispatch = useAppDispatch();

  const compose = useCompose(composeId);
  const suggestion = compose.hashtagCasingSuggestion;

  const onIgnore = () => {
    dispatch(ignoreHashtagCasingSuggestion(composeId));
  };

  const onDontAskAgain = () => {
    dispatch(changeSetting(['ignoreHashtagCasingSuggestions'], true, { showAlert: false, save: true }));
    toast.info(messages.hashtagCasingSuggestionsDisabled);
    dispatch(ignoreHashtagCasingSuggestion(composeId));
  };

  if (!suggestion) return null;

  return (
    <Warning
      animated
      message={
        <Stack space={1}>
          <span>
            <FormattedMessage
              id='compose.hashtag_casing_suggestion.body'
              defaultMessage='Does the hashtag {hashtag} include more than one word? Prefer capitalizing the first letter of each word for improved readability and accessibility.'
              values={{ hashtag: <span className='font-medium'>{suggestion}</span> }}
            />
          </span>
          <HStack space={2} justifyContent='end'>
            <Button
              theme='muted'
              size='xs'
              onClick={onIgnore}
            >
              <FormattedMessage id='compose.hashtag_casing_suggestion.ignore' defaultMessage='Ignore' />
            </Button>
            <Button
              theme='muted'
              size='xs'
              onClick={onDontAskAgain}
            >
              <FormattedMessage id='compose.hashtag_casing_suggestion.dont_ask_again' defaultMessage='Don’t ask again' />
            </Button>
          </HStack>
        </Stack>
      }
    />
  );
};

export { HashtagCasingSuggestion as default };
