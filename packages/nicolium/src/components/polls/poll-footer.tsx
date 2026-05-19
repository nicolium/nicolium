import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

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

const PollFooter: React.FC<IPollFooter> = ({ poll, showResults, selected, statusId }) => {
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
    <div className='⁂-poll__footer' data-testid='poll-footer'>
      {!showResults && poll.multiple && (
        <button className='⁂-poll__submit-button' onClick={handleVote}>
          <FormattedMessage id='poll.vote' defaultMessage='Submit vote' />
        </button>
      )}

      <div className='⁂-poll__footer__details'>
        {poll.non_anonymous && (
          <>
            <Tooltip text={intl.formatMessage(messages.nonAnonymous)}>
              <span>
                <FormattedMessage id='poll.non_anonymous' defaultMessage='Public poll' />
              </span>
            </Tooltip>

            <span className='⁂-separator' />
          </>
        )}

        {showResults && (
          <>
            <button onClick={handleRefresh} data-testid='poll-refresh'>
              <span>
                <FormattedMessage id='poll.refresh' defaultMessage='Refresh' />
              </span>
            </button>

            <span className='⁂-separator' />
          </>
        )}

        {!poll.voted && !poll.expired && (
          <>
            <button
              onClick={() => {
                toggleShowPollResults(statusId);
              }}
              data-testid='poll-refresh'
            >
              <span>
                {showResults ? (
                  <FormattedMessage id='poll.hide_results' defaultMessage='Hide results' />
                ) : (
                  <FormattedMessage id='poll.show_results' defaultMessage='Show results' />
                )}
              </span>
            </button>

            <span className='⁂-separator' />
          </>
        )}

        <span>{votesCount}</span>

        {poll.expires_at !== null && (
          <>
            <span className='⁂-separator' />
            <span data-testid='poll-expiration'>{timeRemaining}</span>
          </>
        )}
      </div>
    </div>
  );
};

export { PollFooter as default };
