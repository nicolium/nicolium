import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Button from '@/components/ui/button';
import HStack from '@/components/ui/hstack';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';
import Tooltip from '@/components/ui/tooltip';
import { usePollQuery, usePollVoteMutation } from '@/queries/statuses/use-poll';
import { useStatusMetaActions } from '@/stores/status-meta';

import RelativeTimestamp from '../relative-timestamp';

import type { Selected } from './poll';
import type { Poll } from 'pl-api';

const messages = defineMessages({
  closed: { id: 'poll.closed', defaultMessage: 'Closed' },
  nonAnonymous: {
    id: 'poll.non_anonymous.label',
    defaultMessage: 'Other instances may display the options you voted for',
  },
});

interface IPollFooter {
  poll: Poll;
  showResults: boolean;
  selected: Selected;
  statusId: string;
}

const PollFooter: React.FC<IPollFooter> = ({
  poll,
  showResults,
  selected,
  statusId,
}): React.JSX.Element => {
  const intl = useIntl();

  const { refetch } = usePollQuery(poll.id);
  const { mutate: vote } = usePollVoteMutation(poll.id);

  const { toggleShowPollResults } = useStatusMetaActions();

  const handleVote = () => {
    vote(Object.keys(selected).map((optionId) => parseInt(optionId, 10)));
  };

  const handleRefresh: React.EventHandler<React.MouseEvent> = (e) => {
    refetch();
    e.stopPropagation();
    e.preventDefault();
  };

  const timeRemaining =
    poll.expires_at &&
    (poll.expired ? (
      intl.formatMessage(messages.closed)
    ) : (
      <RelativeTimestamp weight='medium' timestamp={poll.expires_at} futureDate />
    ));

  let votesCount = null;

  if (poll.multiple && poll.voters_count !== null) {
    votesCount = (
      <FormattedMessage
        id='poll.total_people'
        defaultMessage='{count, plural, one {# person} other {# people}}'
        values={{ count: poll.voters_count }}
      />
    );
  } else {
    votesCount = (
      <FormattedMessage
        id='poll.total_votes'
        defaultMessage='{count, plural, one {# vote} other {# votes}}'
        values={{ count: poll.votes_count }}
      />
    );
  }

  return (
    <Stack space={4} data-testid='poll-footer'>
      {!showResults && poll.multiple && (
        <Button onClick={handleVote} theme='primary' block>
          <FormattedMessage id='poll.vote' defaultMessage='Submit Vote' />
        </Button>
      )}

      <HStack space={1.5} alignItems='center' wrap>
        {poll.non_anonymous && (
          <>
            <Tooltip text={intl.formatMessage(messages.nonAnonymous)}>
              <Text theme='muted' weight='medium'>
                <FormattedMessage id='poll.non_anonymous' defaultMessage='Public poll' />
              </Text>
            </Tooltip>

            <span className='⁂-separator' />
          </>
        )}

        {showResults && (
          <>
            <button
              className='text-gray-600 underline'
              onClick={handleRefresh}
              data-testid='poll-refresh'
            >
              <Text theme='muted' weight='medium'>
                <FormattedMessage id='poll.refresh' defaultMessage='Refresh' />
              </Text>
            </button>

            <span className='⁂-separator' />
          </>
        )}

        {!poll.voted && !poll.expired && (
          <>
            <button
              className='text-gray-600 underline'
              onClick={() => {
                toggleShowPollResults(statusId);
              }}
              data-testid='poll-refresh'
            >
              <Text theme='muted' weight='medium'>
                {showResults ? (
                  <FormattedMessage id='poll.hide_results' defaultMessage='Hide results' />
                ) : (
                  <FormattedMessage id='poll.show_results' defaultMessage='Show results' />
                )}
              </Text>
            </button>

            <span className='⁂-separator' />
          </>
        )}

        <Text theme='muted' weight='medium'>
          {votesCount}
        </Text>

        {poll.expires_at !== null && (
          <>
            <span className='⁂-separator' />
            <Text weight='medium' theme='muted' data-testid='poll-expiration'>
              {timeRemaining}
            </Text>
          </>
        )}
      </HStack>
    </Stack>
  );
};

export { PollFooter as default };
