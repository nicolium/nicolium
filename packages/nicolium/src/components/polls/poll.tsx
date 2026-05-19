import clsx from 'clsx';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { useCurrentAccount } from '@/contexts/current-account-context';
import { usePollQuery, usePollVoteMutation } from '@/queries/statuses/use-poll';
import { useModalsActions } from '@/stores/modals';
import { useStatusMeta } from '@/stores/status-meta';

import PollFooter from './poll-footer';
import PollOption from './poll-option';

import type { NormalizedStatus as Status } from '@/queries/statuses/normalize';

type Selected = Record<number, boolean>;

interface IPoll {
  id: string;
  status: Pick<Status, 'id' | 'url'>;
  language?: string;
  truncate?: boolean;
}

const Poll: React.FC<IPoll> = ({ id, status, language, truncate }): React.JSX.Element | null => {
  const { openModal } = useModalsActions();

  const isLoggedIn = useCurrentAccount();

  const { data: poll } = usePollQuery(id);
  // TODO: handle pending mutation state
  const { mutate: vote } = usePollVoteMutation(id);

  const { showPollResults } = useStatusMeta(status.id);

  const [selected, setSelected] = useState({} as Selected);

  const openUnauthorizedModal = () => {
    openModal('UNAUTHORIZED', {
      action: 'POLL_VOTE',
      ap_id: status?.url,
    });
  };

  const toggleOption = (value: number) => {
    if (isLoggedIn) {
      if (poll?.multiple) {
        const tmp = { ...selected };
        if (tmp[value]) {
          delete tmp[value];
        } else {
          tmp[value] = true;
        }
        setSelected(tmp);
      } else {
        const tmp: Selected = {};
        tmp[value] = true;
        setSelected(tmp);
        vote([value]);
      }
    } else {
      openUnauthorizedModal();
    }
  };

  if (!poll) return null;

  const showResults = poll.voted || poll.expired || !!showPollResults;

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className='⁂-poll__container'
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {!showResults && poll.multiple && (
        <span className='⁂-poll__explanation'>
          <FormattedMessage
            id='poll.choose_multiple'
            defaultMessage="Choose as many as you'd like."
          />
        </span>
      )}

      <div className={clsx('⁂-poll', { '⁂-poll--truncate': truncate })}>
        <div className='⁂-poll__options'>
          {poll.options.map((option, i) => (
            <PollOption
              key={i}
              poll={poll}
              option={option}
              index={i}
              showResults={showResults}
              active={!!selected[i]}
              onToggle={toggleOption}
              language={language}
              truncate={truncate}
            />
          ))}
        </div>

        <PollFooter
          poll={poll}
          showResults={showResults}
          selected={selected}
          statusId={status.id}
        />
      </div>
    </div>
  );
};

export { type Selected, Poll as default };
