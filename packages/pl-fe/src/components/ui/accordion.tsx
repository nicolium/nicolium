import clsx from 'clsx';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import DropdownMenu from '@/components/dropdown-menu';

import Icon from './icon';

import type { Menu } from '@/components/dropdown-menu';

const messages = defineMessages({
  collapse: { id: 'accordion.collapse', defaultMessage: 'Collapse' },
  expand: { id: 'accordion.expand', defaultMessage: 'Expand' },
});

interface IAccordion {
  headline: React.ReactNode;
  children?: React.ReactNode;
  menu?: Menu;
  expanded?: boolean;
  onToggle?: (value: boolean) => void;
  action?: () => void;
  actionIcon?: string;
  actionLabel?: string;
}

/**
 * Accordion
 * An accordion is a vertically stacked group of collapsible sections.
 */
const Accordion: React.FC<IAccordion> = ({ headline, children, menu, expanded = false, onToggle = () => {}, action, actionIcon, actionLabel }) => {
  const intl = useIntl();

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    onToggle(!expanded);
    e.preventDefault();
  };

  const handleAction = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!action) return;

    action();
    e.preventDefault();
  };

  return (
    <div className={clsx('⁂-accordion', {
      '⁂-accordion--expanded': expanded,
    })}
    >
      <button
        type='button'
        onClick={handleToggle}
        title={intl.formatMessage(expanded ? messages.collapse : messages.expand)}
        aria-expanded={expanded}
        className='⁂-accordion__header'
      >
        <span>{headline}</span>

        <div className='⁂-accordion__header__actions'>
          {menu && (
            <DropdownMenu
              items={menu}
              src={require('@phosphor-icons/core/regular/dots-three-vertical.svg')}
            />
          )}
          {action && actionIcon && (
            <button className='⁂-accordion__header__action' onClick={handleAction} title={actionLabel}>
              <Icon src={actionIcon} aria-hidden />
            </button>
          )}
          <Icon
            src={require('@phosphor-icons/core/regular/caret-down.svg')}
            className='⁂-accordion__header__chevron'
            aria-hidden
          />
        </div>
      </button>

      <div
        className='⁂-accordion__body'
      >
        <p>{children}</p>
      </div>
    </div>
  );
};

export { Accordion as default };
