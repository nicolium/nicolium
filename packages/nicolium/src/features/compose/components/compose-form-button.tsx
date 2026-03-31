import React from 'react';

import IconButton from '@/components/ui/icon-button';

interface IComposeFormButton {
  icon: string;
  title?: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

const ComposeFormButton: React.FC<IComposeFormButton> = ({
  icon,
  title,
  active,
  disabled,
  onClick,
}) => (
  <div>
    <IconButton
      className='⁂-compose-form__button'
      src={icon}
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
    />
  </div>
);

export { ComposeFormButton as default };
