import React from 'react';

import { generateText, randomIntFromInterval } from '@/utils/placeholders';

const PlaceholderEventPreview = () => {
  const eventNameLength = randomIntFromInterval(5, 25);
  const nameLength = randomIntFromInterval(5, 15);

  return (
    <div className='event-card--placeholder'>
      <div className='event-card--placeholder__cover' />
      <div className='event-card--placeholder__body'>
        <p className='event-card--placeholder__title'>{generateText(eventNameLength)}</p>

        <div className='event-card--placeholder__meta'>
          <span>{generateText(nameLength)}</span>
          <span>{generateText(nameLength)}</span>
          <span>{generateText(nameLength)}</span>
        </div>
      </div>
    </div>
  );
};

export { PlaceholderEventPreview as default };
