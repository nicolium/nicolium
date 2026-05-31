import React from 'react';

import { randomIntFromInterval, generateText } from '@/utils/placeholders';

interface IPlaceholderDisplayName {
  maxLength: number;
  minLength: number;
  withSuffix?: boolean;
}

/** Fake display name to show when data is loading. */
const PlaceholderDisplayName: React.FC<IPlaceholderDisplayName> = React.memo(
  ({ minLength, maxLength, withSuffix = true }) => {
    const length = randomIntFromInterval(maxLength, minLength);
    const acctLength = randomIntFromInterval(maxLength, minLength);

    return (
      <div className='placeholder-display-name'>
        <p>{generateText(length)}</p>
        {withSuffix && <p>{generateText(acctLength)}</p>}
      </div>
    );
  },
);

PlaceholderDisplayName.displayName = 'PlaceholderDisplayName';

export { PlaceholderDisplayName as default };
