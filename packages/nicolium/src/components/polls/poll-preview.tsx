import noop from 'lodash/noop';
import React from 'react';

import PollOption from '@/components/polls/poll-option';

import type { Poll } from 'pl-api';

interface IPollPreview {
  poll: Poll;
}

const PollPreview: React.FC<IPollPreview> = ({ poll }) => {
  if (typeof poll !== 'object') {
    return null;
  }

  return (
    <div className='flex flex-col gap-2'>
      {poll.options.map((option, i) => (
        <PollOption
          key={i}
          poll={poll}
          option={option}
          index={i}
          showResults={false}
          active={false}
          onToggle={noop}
        />
      ))}
    </div>
  );
};

export { PollPreview as default };
