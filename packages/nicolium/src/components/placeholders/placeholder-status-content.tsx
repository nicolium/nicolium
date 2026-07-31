import React from 'react';

import { randomIntFromInterval, generateText } from '@/utils/placeholders';

interface IPlaceholderStatusContent {
  maxLength: number;
  minLength: number;
}

/** Fake status content while data is loading. */
const PlaceholderStatusContent: React.FC<IPlaceholderStatusContent> = ({
  minLength,
  maxLength,
}) => {
  const length = randomIntFromInterval(maxLength, minLength);

  return (
    <div className='placeholder-status-content' aria-hidden>
      <p>{generateText(length)}</p>
    </div>
  );
};

export { PlaceholderStatusContent as default };
