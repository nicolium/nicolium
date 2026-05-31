import React from 'react';

import { randomIntFromInterval, generateText } from '@/utils/placeholders';

/** Fake link preview to display while data is loading. */
const PlaceholderCard: React.FC = React.memo(() => (
  <div className='status-card status-card--placeholder'>
    <div className='status-card--placeholder__image'>&nbsp;</div>

    <div className='status-card--placeholder__description'>
      <p>{generateText(randomIntFromInterval(5, 25))}</p>
      <p>{generateText(randomIntFromInterval(5, 75))}</p>
      <p>{generateText(randomIntFromInterval(5, 15))}</p>
    </div>
  </div>
));

PlaceholderCard.displayName = 'PlaceholderCard';

export { PlaceholderCard as default };
