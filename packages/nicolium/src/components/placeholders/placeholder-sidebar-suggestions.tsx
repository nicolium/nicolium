import React from 'react';

import { randomIntFromInterval, generateText } from '@/utils/placeholders';

const PlaceholderSidebarSuggestions = ({ limit }: { limit: number }) => {
  const length = randomIntFromInterval(15, 3);
  const acctLength = randomIntFromInterval(15, 3);

  return (
    <>
      {new Array(limit).fill(undefined).map((_, idx) => (
        <div key={idx} className='flex w-full animate-pulse items-center gap-2'>
          <div className='block size-9 rounded-full bg-primary-200 text-center dark:bg-primary-700' />

          <div className='flex flex-col text-primary-200 dark:text-primary-700'>
            <p>{generateText(length)}</p>
            <p>{generateText(acctLength)}</p>
          </div>
        </div>
      ))}
    </>
  );
};

export { PlaceholderSidebarSuggestions as default };
