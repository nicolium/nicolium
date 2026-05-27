import iconEmpty from '@phosphor-icons/core/regular/empty.svg';
import React from 'react';

import Icon from './ui/icon';

interface IEmptyMessage {
  heading?: React.ReactNode;
  text: React.ReactNode;
  icon?: string | false;
}

const EmptyMessage: React.FC<IEmptyMessage> = ({ heading, text, icon = iconEmpty }) => (
  <div className='empty-message'>
    {icon !== false && <Icon src={icon} aria-hidden />}

    {heading && <h2>{heading}</h2>}
    <p>{text}</p>
  </div>
);

export { EmptyMessage };
