import React from 'react';

interface IDivider {
  text?: string;
}

/** Divider */
const Divider = ({ text }: IDivider) => (
  <div className='divider' data-testid='divider'>
    <div aria-hidden='true'>
      <div />
    </div>

    {text && (
      <div className='divider__text'>
        <span data-testid='divider-text'>{text}</span>
      </div>
    )}
  </div>
);

export { Divider as default };
