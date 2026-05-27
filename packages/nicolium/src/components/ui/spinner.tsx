import React from 'react';
import { FormattedMessage } from 'react-intl';

interface ISpinner {
  /** Width and height of the spinner in pixels. */
  size?: number;
  /** Whether to display "Loading..." beneath the spinner. */
  withText?: boolean;
}

/** Spinning loading placeholder. */
const Spinner = ({ size = 30, withText = true }: ISpinner) => (
  <div className='spinner__container'>
    <div className='spinner' style={{ width: size, height: size }}>
      {Array.from(Array(12).keys()).map((i) => (
        <div key={i}>&nbsp;</div>
      ))}
    </div>

    {withText && (
      <p>
        <FormattedMessage id='loading_indicator.label' defaultMessage='Loading…' />
      </p>
    )}
  </div>
);

export { Spinner as default };
