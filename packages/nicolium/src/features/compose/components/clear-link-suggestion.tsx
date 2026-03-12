import React from 'react';
import { FormattedMessage } from 'react-intl';

import Button from '@/components/ui/button';
import { useCompose } from '@/hooks/use-compose';

import Warning from './warning';

interface IClearLinkSuggestion {
  composeId: string;
  handleAccept: (key: string) => void;
  handleReject: (key: string) => void;
}

const ClearLinkSuggestion = ({ composeId, handleAccept, handleReject }: IClearLinkSuggestion) => {
  const compose = useCompose(composeId);
  const suggestion = compose.clearLinkSuggestion;

  if (!suggestion) return null;

  return (
    <Warning
      animated
      message={
        <div className='flex flex-col gap-1'>
          <span>
            <FormattedMessage
              id='compose.clear_link_suggestion.body'
              defaultMessage='The link {url} likely includes tracking elements used to mark your online activity. They are not required for the URL to work. Do you want to remove them?'
              values={{
                url: (
                  <span className='underline'>
                    {suggestion.originalUrl.length > 20
                      ? suggestion.originalUrl.slice(0, 20) + '…'
                      : suggestion.originalUrl}
                  </span>
                ),
              }}
            />
          </span>
          <div className='flex justify-end gap-2'>
            <Button
              theme='muted'
              size='xs'
              onClick={() => {
                handleReject(suggestion.key);
              }}
            >
              <FormattedMessage id='compose.clear_link_suggestion.ignore' defaultMessage='Ignore' />
            </Button>
            <Button
              theme='muted'
              size='xs'
              onClick={() => {
                handleAccept(suggestion.key);
              }}
            >
              <FormattedMessage id='compose.clear_link_suggestion.remove' defaultMessage='Remove' />
            </Button>
          </div>
        </div>
      }
    />
  );
};

export { ClearLinkSuggestion as default };
