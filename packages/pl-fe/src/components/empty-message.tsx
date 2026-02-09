import React from 'react';

import Icon from './ui/icon';

interface IEmptyMessage {
  text: React.ReactNode;
  icon?: string;
}

const EmptyMessage: React.FC<IEmptyMessage> = ({ text, icon = require('@phosphor-icons/core/regular/empty.svg') }) => (
  <div className='⁂-empty-message'>
    <Icon src={icon} aria-hidden />

    <p>{text}</p>
  </div>
);

export { EmptyMessage };
