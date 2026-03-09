import { useNavigate, type LinkOptions } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useEffect, useRef } from 'react';

import Counter from '@/components/ui/counter';
import Icon from '@/components/ui/icon';
import Toggle from '@/components/ui/toggle';
import { userTouching } from '@/utils/is-mobile';

type Menu = Array<MenuItem | null>;

type MenuItem = {
  action?: React.EventHandler<React.KeyboardEvent | React.MouseEvent>;
  active?: boolean;
  checked?: boolean;
  count?: number;
  destructive?: boolean;
  href?: string;
  icon?: string;
  meta?: string;
  middleClick?(event: React.MouseEvent): void;
  onChange?: (value: boolean) => void;
  target?: React.HTMLAttributeAnchorTarget;
  text: string;
  type?: 'toggle' | 'radio';
  items?: Menu;
  onSelectFile?: (files: FileList) => void;
  accept?: string;
  disabled?: boolean;
} & (LinkOptions | { to?: undefined });

interface IDropdownMenuItem {
  index: number;
  item: MenuItem | null;
  onClick?(goBack?: boolean): void;
  autoFocus?: boolean;
  onSetTab: (tab?: number) => void;
}

const DropdownMenuItem = ({ index, item, onClick, autoFocus, onSetTab }: IDropdownMenuItem) => {
  const navigate = useNavigate();

  const itemRef = useRef<HTMLAnchorElement>(null);
  const fileElement = useRef<HTMLInputElement>(null);

  const handleClick: React.EventHandler<React.MouseEvent | React.KeyboardEvent> = (event) => {
    event.stopPropagation();

    if (!item) return;
    if (item.disabled) {
      event.preventDefault();
      return;
    }

    if (item.items?.length) {
      event.preventDefault();
      onSetTab(index);
      return;
    }

    if (item.onSelectFile) {
      fileElement.current?.click();
      return;
    }

    if (onClick) onClick(!(item.to && userTouching.matches));

    if (item.to) {
      event.preventDefault();
      if (userTouching.matches) {
        navigate({ to: item.to, params: item.params, search: item.search, replace: true });
      } else navigate({ to: item.to, params: item.params, search: item.search });
    } else if (typeof item.action === 'function') {
      const action = item.action;
      event.preventDefault();
      action(event);
    }
  };

  const handleAuxClick: React.EventHandler<React.MouseEvent> = (event) => {
    if (!item) return;
    if (item.disabled) return;
    if (item.onSelectFile) fileElement.current?.click();
    if (onClick) onClick();

    if (event.button === 1 && item.middleClick) {
      item.middleClick(event);
    }
  };

  const handleItemKeyPress: React.EventHandler<React.KeyboardEvent> = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleClick(event);
    }
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!item) return;
    if (item.disabled) return;

    if (item.onChange) item.onChange(event.target.checked);
  };

  const handleSelectFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.files?.length && item?.onSelectFile) {
      item.onSelectFile(e.target.files);
    }
  };

  useEffect(() => {
    const firstItem = index === 0;

    if (itemRef.current && (autoFocus ? firstItem : item?.active)) {
      itemRef.current.focus({ preventScroll: true });
    }
  }, [index]);

  if (item === null) {
    return <hr />;
  }

  return (
    <li>
      <a
        href={item.href ?? item.to ?? '#'}
        role='button'
        tabIndex={item.disabled ? -1 : 0}
        ref={itemRef}
        data-index={index}
        onClick={handleClick}
        onAuxClick={handleAuxClick}
        onKeyPress={handleItemKeyPress}
        target={typeof item.target === 'string' ? item.target : '_blank'}
        title={item.text}
        className={clsx(
          'mx-2 my-1 flex cursor-pointer items-center rounded-md px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 rtl:flex-col-reverse',
          {
            'text-danger-600 dark:text-danger-400': item.destructive,
            'cursor-not-allowed opacity-50': item.disabled,
            'hover:bg-gray-100 hover:text-gray-800 focus:bg-gray-100 focus:text-gray-800 focus:outline-none black:hover:bg-gray-900 black:focus:bg-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-200 dark:focus:bg-gray-800 dark:focus:text-gray-200':
              !item.disabled,
          },
        )}
      >
        {item.icon && <Icon src={item.icon} className='mr-3 size-5 flex-none rtl:ml-3 rtl:mr-0' />}

        <div
          className={clsx('truncate', {
            'text-xs': item.meta,
            'text-base': !item.meta,
            'mr-2':
              (item.count ?? item.type === 'toggle') || item.type === 'radio' || item.items?.length,
          })}
        >
          {item.meta ? (
            <>
              <div className='truncate text-base'>{item.text}</div>
              <div className='mt-0.5'>{item.meta}</div>
            </>
          ) : (
            item.text
          )}
        </div>

        {item.count ? (
          <span className='ml-auto size-5 flex-none'>
            <Counter count={item.count} />
          </span>
        ) : null}

        {(item.type === 'toggle' || item.type === 'radio') && (
          <div className='ml-auto'>
            <Toggle
              checked={item.checked}
              onChange={handleChange}
              radio={item.type === 'radio'}
              disabled={item.disabled}
            />
          </div>
        )}

        {!!item.items?.length && (
          <Icon
            src={require('@phosphor-icons/core/regular/caret-right.svg')}
            containerClassName='ml-auto rtl:ml-0 rtl:mr-auto'
            className='size-5 flex-none'
          />
        )}
      </a>

      {item.onSelectFile && (
        <label className='sr-only'>
          <span>{item.text}</span>
          <input
            ref={fileElement}
            type='file'
            accept={item.accept}
            onChange={handleSelectFileChange}
            className='hidden'
            disabled={item.disabled}
          />
        </label>
      )}
    </li>
  );
};

export { type Menu, type MenuItem, DropdownMenuItem as default };
