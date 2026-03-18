import React from 'react';

import { randomIntFromInterval, generateText } from '@/utils/placeholders';

const PlaceholderSidebarTrends = ({ limit }: { limit: number }) => {
  const trend = randomIntFromInterval(6, 3);
  const stat = randomIntFromInterval(10, 3);

  return (
    <>
      {new Array(limit).fill(undefined).map((_, idx) => (
        <div
          key={idx}
          className='flex animate-pulse flex-col text-primary-200 dark:text-primary-700'
        >
          <p>{generateText(trend)}</p>
          <p>{generateText(stat)}</p>
        </div>
      ))}
    </>
  );
};

export { PlaceholderSidebarTrends as default };
