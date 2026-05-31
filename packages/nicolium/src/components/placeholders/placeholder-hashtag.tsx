import React from 'react';

import { generateText, randomIntFromInterval } from '@/utils/placeholders';

/** Fake hashtag to display while data is loading. */
const PlaceholderHashtag: React.FC = () => {
  const length = randomIntFromInterval(15, 30);

  return (
    <div className='hashtag--placeholder'>
      <p>{generateText(length)}</p>
    </div>
  );
};

export { PlaceholderHashtag as default };
