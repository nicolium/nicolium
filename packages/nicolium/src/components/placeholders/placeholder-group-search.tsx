import React from 'react';

import { generateText, randomIntFromInterval } from '@/utils/placeholders';

const PlaceholderGroupSearch = ({ withJoinAction = true }: { withJoinAction?: boolean }) => {
  const groupNameLength = randomIntFromInterval(12, 20);

  return (
    <div className='placeholder-group-search'>
      <div className='placeholder-group-search__main'>
        <div className='placeholder-group-search__avatar' />

        <div className='placeholder-group-search__content'>
          <p className='placeholder-group-search__name'>{generateText(groupNameLength)}</p>

          <div className='placeholder-group-search__meta'>
            <span>{generateText(6)}</span>
            <span className='placeholder-group-search__meta-text--separated'>
              {generateText(6)}
            </span>
          </div>
        </div>
      </div>

      {withJoinAction && <div className='placeholder-group-search__action' />}
    </div>
  );
};

export { PlaceholderGroupSearch as default };
