import React from 'react';

import { randomIntFromInterval, generateText } from '@/utils/placeholders';

const PlaceholderSidebarSuggestions = ({ limit }: { limit: number }) => {
  const length = randomIntFromInterval(15, 3);
  const acctLength = randomIntFromInterval(15, 3);

  return (
    <>
      {new Array(limit).fill(undefined).map((_, idx) => (
        <div key={idx} className='sidebar-suggestion--placeholder'>
          <div className='sidebar-suggestion--placeholder__avatar' />

          <div className='sidebar-suggestion--placeholder__name'>
            <p>{generateText(length)}</p>
            <p>{generateText(acctLength)}</p>
          </div>
        </div>
      ))}
    </>
  );
};

export { PlaceholderSidebarSuggestions as default };
