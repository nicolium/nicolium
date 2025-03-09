import React from 'react';
import { FormattedMessage } from 'react-intl';
import { spring } from 'react-motion';

import Button from 'pl-fe/components/ui/button';
import HStack from 'pl-fe/components/ui/hstack';
import Stack from 'pl-fe/components/ui/stack';
import OptionalMotion from 'pl-fe/features/ui/util/optional-motion';
import { useCompose } from 'pl-fe/hooks/use-compose';

interface IClearLinkSuggestion {
  composeId: string;
  handleAccept: (key: string) => void;
  handleReject: (key: string) => void;
}

const ClearLinkSuggestion = ({
  composeId,
  handleAccept,
  handleReject,
}: IClearLinkSuggestion) => {
  const compose = useCompose(composeId);
  const suggestion = compose.clear_link_suggestion;

  if (!suggestion) return null;

  return (
    <OptionalMotion defaultStyle={{ opacity: 0, scaleX: 0.85, scaleY: 0.75 }} style={{ opacity: spring(1, { damping: 35, stiffness: 400 }), scaleX: spring(1, { damping: 35, stiffness: 400 }), scaleY: spring(1, { damping: 35, stiffness: 400 }) }}>
      {({ opacity, scaleX, scaleY }) => (
        <Stack space={1} className='rounded border border-solid border-gray-400 bg-transparent px-2.5 py-2 text-xs text-gray-900 dark:border-gray-800 dark:text-white' style={{ opacity: opacity, transform: `scale(${scaleX}, ${scaleY})` }}>
          <span>
            <FormattedMessage
              id='compose.clear_link_suggestion.body'
              defaultMessage='The link {url} likely includes tracking elements used to mark your online activity. They are not required for the URL to work. Do you want to remove them?'
              values={{ url: <span className='underline'>{suggestion.originalUrl.length > 20 ? suggestion.originalUrl.slice(0, 20) + '…' : suggestion.originalUrl}</span> }}
            />
          </span>
          <HStack space={2} justifyContent='end'>
            <Button
              theme='muted'
              size='xs'
              onClick={() => handleReject(suggestion.key)}
            >
              <FormattedMessage id='compose.clear_link_suggestion.ignore' defaultMessage='Ignore' />
            </Button>
            <Button
              theme='muted'
              size='xs'
              onClick={() => handleAccept(suggestion.key)}
            >
              <FormattedMessage id='compose.clear_link_suggestion.remove' defaultMessage='Remove' />
            </Button>
          </HStack>
        </Stack>
      )}
    </OptionalMotion>
  );
};

export { ClearLinkSuggestion as default };
