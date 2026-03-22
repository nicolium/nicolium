import React from 'react';

import { generateText, randomIntFromInterval } from '@/utils/placeholders';

/** Fake hashtag to display while data is loading. */
const PlaceholderHashtag: React.FC = () => {
  const length = randomIntFromInterval(15, 30);

  return (
    <div className='text-primary-200 no-reduce-motion:animate-pulse dark:text-primary-700'>
      <p>{generateText(length)}</p>
    </div>
  );
};

export { PlaceholderHashtag as default };
