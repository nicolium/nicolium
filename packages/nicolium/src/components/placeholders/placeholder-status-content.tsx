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
    <div className='placeholder-status-content'>
      <p>{generateText(length)}</p>
    </div>
  );
};

export { PlaceholderStatusContent as default };
