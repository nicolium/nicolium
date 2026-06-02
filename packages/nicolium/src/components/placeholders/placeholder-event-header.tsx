import React from 'react';

import { generateText, randomIntFromInterval } from '@/utils/placeholders';

const PlaceholderEventHeader = () => {
  const eventNameLength = randomIntFromInterval(5, 25);
  const organizerNameLength = randomIntFromInterval(5, 30);
  const dateLength = randomIntFromInterval(5, 30);
  const locationLength = randomIntFromInterval(5, 30);

  return (
    <div className='event-header--placeholder'>
      <p className='event-header--placeholder__title'>{generateText(eventNameLength)}</p>

      <div className='event-header--placeholder__details'>
        <p>{generateText(organizerNameLength)}</p>
        <p>{generateText(dateLength)}</p>
        <p>{generateText(locationLength)}</p>
      </div>
    </div>
  );
};

export { PlaceholderEventHeader as default };
