import React from 'react';

import { generateText, randomIntFromInterval } from '@/utils/placeholders';

const PlaceholderEventHeader = () => {
  const eventNameLength = randomIntFromInterval(5, 25);
  const organizerNameLength = randomIntFromInterval(5, 30);
  const dateLength = randomIntFromInterval(5, 30);
  const locationLength = randomIntFromInterval(5, 30);

  return (
    <div className='flex animate-pulse flex-col gap-2 text-primary-50 dark:text-primary-800'>
      <p className='text-lg'>{generateText(eventNameLength)}</p>

      <div className='flex flex-col gap-1'>
        <p>{generateText(organizerNameLength)}</p>
        <p>{generateText(dateLength)}</p>
        <p>{generateText(locationLength)}</p>
      </div>
    </div>
  );
};

export { PlaceholderEventHeader as default };
