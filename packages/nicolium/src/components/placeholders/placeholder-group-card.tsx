import React from 'react';

import { generateText, randomIntFromInterval } from '@/utils/placeholders';

const PlaceholderGroupCard = () => {
  const groupNameLength = randomIntFromInterval(12, 20);

  return (
    <div className='group-card group-card--framed group-card--placeholder'>
      <div className='group-card__cover group-card__cover--placeholder' />

      <div className='group-card__avatar'>
        <div className='group-card__avatar-placeholder' />
      </div>

      <div className='group-card__info'>
        <p className='group-card__name group-card__name--placeholder'>
          {generateText(groupNameLength)}
        </p>

        <div className='group-card__meta group-card__meta--placeholder'>
          <span>{generateText(6)}</span>
          <span>{generateText(6)}</span>
        </div>
      </div>
    </div>
  );
};

export { PlaceholderGroupCard as default };
