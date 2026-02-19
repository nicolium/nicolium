import { Link, type LinkOptions } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useState } from 'react';

import HStack from '@/components/ui/hstack';
import Icon from '@/components/ui/icon';
import Select from '@/components/ui/select';
import { SelectDropdown } from '@/features/forms';

interface IList {
  children: React.ReactNode;
}

const List: React.FC<IList> = ({ children }) => <div className='⁂-list'>{children}</div>;

type IListItem = {
  className?: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  href?: string;
  onClick?(): void;
  isSelected?: boolean;
  children?: React.ReactNode;
  size?: 'sm' | 'md';
} & (LinkOptions | {});

const ListItem: React.FC<IListItem> = ({
  className,
  label,
  hint,
  children,
  href,
  onClick,
  isSelected,
  size = 'md',
  ...rest
}) => {
  const [domId] = useState(`list-group-${crypto.randomUUID()}`);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onClick!();
    }
  };

  const LabelComp = 'to' in rest || href || onClick ? 'span' : 'label';

  const renderChildren = React.useCallback(
    () =>
      React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          const isSelect = child.type === SelectDropdown || child.type === Select;

          return React.cloneElement(child, {
            // @ts-ignore
            id: domId,
            className: clsx(
              {
                'w-auto': isSelect,
              },
              child.props.className,
            ),
          });
        }

        return null;
      }),
    [children, domId],
  );

  const classNames = clsx('⁂-list-item', className, {
    '⁂-list-item--md': size === 'md',
    '⁂-list-item--sm': size === 'sm',
  });

  const body = (
    <>
      <div className='⁂-list-item__label'>
        <LabelComp htmlFor={domId}>{label}</LabelComp>

        {hint ? <span className='⁂-list-item__hint'>{hint}</span> : null}
      </div>

      {'to' in rest || href || onClick ? (
        <HStack space={1} alignItems='center' className='⁂-list-item__body'>
          {children}

          <Icon src={require('@phosphor-icons/core/regular/caret-right.svg')} aria-hidden />
        </HStack>
      ) : null}

      {!('to' in rest) && typeof onClick === 'undefined' ? renderChildren() : null}
    </>
  );

  if ('to' in rest)
    return (
      <Link className={classNames} {...rest}>
        {body}
      </Link>
    );

  const Comp = onClick || href ? 'a' : 'div';
  const linkProps =
    onClick || href
      ? { onClick, onKeyDown, tabIndex: 0, role: 'link', ...(href && { href, target: '_blank' }) }
      : {};

  return (
    <Comp className={classNames} {...linkProps}>
      {body}
    </Comp>
  );
};

export { List as default, type IListItem, ListItem };
