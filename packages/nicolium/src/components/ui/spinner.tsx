import React from 'react';
import { FormattedMessage } from 'react-intl';

import Text from './text';

import './spinner.css';

interface ISpinner {
  /** Width and height of the spinner in pixels. */
  size?: number;
  /** Whether to display "Loading..." beneath the spinner. */
  withText?: boolean;
}

/** Spinning loading placeholder. */
const Spinner = ({ size = 30, withText = true }: ISpinner) => (
  <div className='flex flex-col items-center justify-center gap-2'>
    <div className='spinner' style={{ width: size, height: size }}>
      {Array.from(Array(12).keys()).map((i) => (
        <div key={i}>&nbsp;</div>
      ))}
    </div>

    {withText && (
      <Text theme='muted' tracking='wide'>
        <FormattedMessage id='loading_indicator.label' defaultMessage='Loading…' />
      </Text>
    )}
  </div>
);

export { Spinner as default };
