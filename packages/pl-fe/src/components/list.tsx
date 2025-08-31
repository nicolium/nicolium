import clsx from 'clsx';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import Select from 'pl-fe/components/ui/select';
import { SelectDropdown } from 'pl-fe/features/forms';

interface IList {
  children: React.ReactNode;
}

const List: React.FC<IList> = ({ children }) => (
  <div className='⁂-list'>{children}</div>
);

interface IListItem {
  className?: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  to?: string;
  href?: string;
  onClick?(): void;
  isSelected?: boolean;
  children?: React.ReactNode;
  size?: 'sm' | 'md';
}

const ListItem: React.FC<IListItem> = ({ className, label, hint, children, to, href, onClick, isSelected, size = 'md' }) => {
  const [domId] = useState(`list-group-${crypto.randomUUID()}`);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onClick!();
    }
  };

  const LabelComp = to || href || onClick ? 'span' : 'label';

  const renderChildren = React.useCallback(() => React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      const isSelect = child.type === SelectDropdown || child.type === Select;

      return React.cloneElement(child, {
        // @ts-ignore
        id: domId,
        className: clsx({
          'w-auto': isSelect,
        }, child.props.className),
      });
    }

    return null;
  }), [children, domId]);

  const classNames = clsx('⁂-list-item',
    className,
    {
      '⁂-list-item--md': size === 'md',
      '⁂-list-item--sm': size === 'sm',
    },
  );

  const body = (
    <>
      <div className='⁂-list-item__label'>
        <LabelComp htmlFor={domId}>{label}</LabelComp>

        {hint ? (
          <span className='⁂-list-item__hint'>{hint}</span>
        ) : null}
      </div>

      {(to || href || onClick) ? (
        <HStack space={1} alignItems='center' className='⁂-list-item__body'>
          {children}

          <Icon src={require('@tabler/icons/outline/chevron-right.svg')} />
        </HStack>
      ) : null}

      {typeof to === 'undefined' && typeof onClick === 'undefined' ? renderChildren() : null}
    </>
  );

  if (to) return (
    <Link className={classNames} to={to}>
      {body}
    </Link>
  );

  const Comp = onClick || href ? 'a' : 'div';
  const linkProps = onClick || href ? { onClick, onKeyDown, tabIndex: 0, role: 'link', ...(href && { href, target: '_blank' }) } : {};

  return (
    <Comp
      className={classNames}
      {...linkProps}
    >
      {body}
    </Comp>
  );
};

export { List as default, type IListItem, ListItem };
