import clsx from 'clsx';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import type { BaseModalProps } from '@/features/ui/components/modal-root';

interface DropdownMenuModalProps {
  /** The element initiating opening the modal. */
  element?: HTMLElement;
  content?: React.JSX.Element;
}

const DropdownMenuModal: React.FC<BaseModalProps & DropdownMenuModalProps> = ({
  content,
  onClose,
}) => {
  const handleClick: React.MouseEventHandler<HTMLElement> = (e) => {
    onClose('DROPDOWN_MENU');
    e.stopPropagation();
  };
  const [firstRender, setFirstRender] = React.useState(true);

  const handleClickOutside: React.MouseEventHandler<HTMLElement> = (e) => {
    if ((e.target as HTMLElement).id === 'dropdown-menu-modal') {
      handleClick(e);
    }
  };

  React.useEffect(() => {
    setFirstRender(false);
  }, []);

  return (
    <div
      id='dropdown-menu-modal'
      className={clsx('dropdown-menu-modal', {
        'dropdown-menu-modal--first-render': firstRender,
      })}
      role='presentation'
      onClick={handleClickOutside}
    >
      <div>
        {content}
        <div className='dropdown-menu-modal__close'>
          <button onClick={handleClick}>
            <FormattedMessage id='lightbox.close' defaultMessage='Close' />
          </button>
        </div>
      </div>
    </div>
  );
};

export { DropdownMenuModal as default, type DropdownMenuModalProps };
