import iconCaretRight from '@phosphor-icons/core/regular/caret-right.svg';
import { Link, useMatchRoute, type LinkOptions } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useState } from 'react';

import Icon from '@/components/ui/icon';
import Select from '@/components/ui/select';
import { SelectDropdown } from '@/components/ui/select-dropdown';

interface IList {
  children: React.ReactNode;
}

const List: React.FC<IList> = ({ children }) => <div className='⁂-list'>{children}</div>;

type IListItem = {
  className?: string;
  label: React.ReactNode;
  labelClassName?: string;
  hint?: React.ReactNode;
  href?: string;
  onClick?(): void;
  isSelected?: boolean;
  children?: React.ReactElement<any> | Array<React.ReactElement<any>>;
  size?: 'sm' | 'md';
  actionIcon?: string;
} & (LinkOptions | {});

const ListItem: React.FC<IListItem> = ({
  className,
  label,
  labelClassName,
  hint,
  children,
  href,
  onClick,
  isSelected,
  size = 'md',
  actionIcon,
  ...rest
}) => {
  const matchRoute = useMatchRoute();
  const isActive = 'to' in rest ? matchRoute({ to: rest.to }) !== false : false;

  const [domId] = useState(`list-group-${crypto.randomUUID()}`);
  const labelId = `${domId}-label`;
  const hintId = `${domId}-hint`;

  const onKeyDown: React.KeyboardEventHandler<HTMLAnchorElement | HTMLDivElement> = (e) => {
    if (e.key === 'Enter') {
      onClick!();
    }
  };

  const LabelComp = 'to' in rest || href || onClick ? 'span' : 'label';

  const renderChildren = React.useCallback(
    () =>
      children
        ? React.Children.map(children, (child: React.ReactElement<any>) => {
            if (React.isValidElement(child)) {
              const props = child.props as any;
              const isSelect = child.type === SelectDropdown || child.type === Select;
              const childLabelledBy = props['aria-labelledby'];
              const childDescribedBy = props['aria-describedby'];
              const ariaLabelledBy = childLabelledBy ? `${childLabelledBy} ${labelId}` : labelId;
              const ariaDescribedBy = hint
                ? childDescribedBy
                  ? `${childDescribedBy} ${hintId}`
                  : hintId
                : childDescribedBy;

              return React.cloneElement(child, {
                // @ts-expect-error
                id: domId,
                'aria-labelledby': ariaLabelledBy,
                'aria-describedby': ariaDescribedBy,
                className: clsx(
                  {
                    'w-auto': isSelect,
                  },
                  props.className,
                ),
              });
            }

            return null;
          })
        : null,
    [children, domId, labelId, hint, hintId],
  );

  const classNames = clsx('⁂-list-item', className, {
    '⁂-list-item--md': size === 'md',
    '⁂-list-item--sm': size === 'sm',
    '⁂-list-item--active': isActive,
  });

  const body = (
    <>
      <div className={clsx('⁂-list-item__label', labelClassName)}>
        <LabelComp id={labelId} {...(LabelComp === 'label' ? { htmlFor: domId } : {})}>
          {label}
        </LabelComp>

        {hint ? (
          <span id={hintId} className='⁂-list-item__hint'>
            {hint}
          </span>
        ) : null}
      </div>

      {'to' in rest || href || onClick ? (
        <div className='⁂-list-item__body'>
          {children}

          <Icon src={actionIcon || iconCaretRight} aria-hidden />
        </div>
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
