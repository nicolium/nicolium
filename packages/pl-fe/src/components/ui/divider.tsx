import React from 'react';

import Text from './text';

import type { Sizes as TextSizes } from './text';

interface IDivider {
  text?: string;
  textSize?: TextSizes;
}

/** Divider */
const Divider = ({ text, textSize = 'md' }: IDivider) => (
  <div className='⁂-divider' data-testid='divider'>
    <div aria-hidden='true'>
      <div />
    </div>

    {text && (
      <div className='⁂-divider__text'>
        <span data-testid='divider-text'>
          <Text size={textSize} tag='span' theme='inherit'>
            {text}
          </Text>
        </span>
      </div>
    )}
  </div>
);

export { Divider as default };
