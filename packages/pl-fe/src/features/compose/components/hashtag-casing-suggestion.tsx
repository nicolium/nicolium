import React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { spring } from 'react-motion';

import { ignoreHashtagCasingSuggestion } from 'pl-fe/actions/compose';
import { changeSetting } from 'pl-fe/actions/settings';
import Button from 'pl-fe/components/ui/button';
import HStack from 'pl-fe/components/ui/hstack';
import Stack from 'pl-fe/components/ui/stack';
import OptionalMotion from 'pl-fe/features/ui/util/optional-motion';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useCompose } from 'pl-fe/hooks/use-compose';
import toast from 'pl-fe/toast';

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
  const suggestion = compose.hashtag_casing_suggestion;

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
    <OptionalMotion defaultStyle={{ opacity: 0, scaleX: 0.85, scaleY: 0.75 }} style={{ opacity: spring(1, { damping: 35, stiffness: 400 }), scaleX: spring(1, { damping: 35, stiffness: 400 }), scaleY: spring(1, { damping: 35, stiffness: 400 }) }}>
      {({ opacity, scaleX, scaleY }) => (
        <Stack space={1} className='rounded border border-solid border-gray-400 bg-transparent px-2.5 py-2 text-xs text-gray-900 dark:border-gray-800 dark:text-white' style={{ opacity: opacity, transform: `scale(${scaleX}, ${scaleY})` }}>
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
      )}
    </OptionalMotion>
  );
};

export { HashtagCasingSuggestion as default };
