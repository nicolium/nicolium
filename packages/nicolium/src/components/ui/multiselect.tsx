/**
The MIT License (MIT)

Copyright (c) 2019 Srigar Sukumar <ssrigar@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 */
// Adapted from [multiselect-react-dropdown](https://github.com/srigar/multiselect-react-dropdown)

import clsx from 'clsx';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Icon from './icon';

const messages = defineMessages({
  placeholder: { id: 'select.placeholder', defaultMessage: 'Select' },
  noOptions: { id: 'select.no_options', defaultMessage: 'No options available' },
  removeItem: { id: 'select.remove_item', defaultMessage: 'Remove item' },
});

interface Option {
  key: string;
  value: string;
}

interface IMultiselect {
  className?: string;
  items: Record<string, string>;
  value?: string[];
  onChange?: (values: string[]) => void;
  disabled?: boolean;
}

const matchValues = (value: string, search: string): boolean =>
  value.toLowerCase().includes(search.toLowerCase());

const Multiselect: React.FC<IMultiselect> = ({
  className,
  items,
  value,
  onChange,
  disabled = false,
}) => {
  const intl = useIntl();

  const allOptions = useMemo<Option[]>(
    () => Object.entries(items).map(([key, value]) => ({ key, value })),
    [items],
  );

  const selectedValues = useMemo<Option[]>(
    () =>
      (value ?? [])
        .map((key) => allOptions.find((o) => o.key === key))
        .filter((o): o is Option => o !== undefined),
    [value, allOptions],
  );

  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const searchBoxRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleOptions = useMemo(() => {
    const selectedKeys = new Set(selectedValues.map((v) => v.key));
    return allOptions
      .filter((o) => !selectedKeys.has(o.key))
      .filter((o) => matchValues(o.value, inputValue));
  }, [allOptions, selectedValues, inputValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setInputValue('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const wrapper = searchWrapperRef.current;
    const focusInput = () => searchBoxRef.current?.focus();
    wrapper?.addEventListener('click', focusInput);
    return () => wrapper?.removeEventListener('click', focusInput);
  }, []);

  const emitChange = useCallback(
    (next: Option[]) => onChange?.(next.map((o) => o.key)),
    [onChange],
  );

  const onSelectItem = useCallback(
    (option: Option) => {
      setInputValue('');
      const alreadySelected = selectedValues.some((v) => v.key === option.key);
      if (alreadySelected) {
        emitChange(selectedValues.filter((v) => v.key !== option.key));
      } else {
        emitChange([...selectedValues, option]);
      }
    },
    [selectedValues, emitChange],
  );

  const onRemoveSelectedItem = useCallback(
    (option: Option) => {
      emitChange(selectedValues.filter((v) => v.key !== option.key));
    },
    [selectedValues, emitChange],
  );

  const onInputChange: React.ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    setInputValue(e.target.value);
  }, []);

  const onFocus = useCallback(() => {
    setIsOpen(true);
  }, []);

  const optionTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const onBlur = useCallback(() => {
    optionTimeoutRef.current = setTimeout(() => {
      const activeElement = document.activeElement;
      const stillInsideContainer =
        !!activeElement && !!containerRef.current?.contains(activeElement);

      if (stillInsideContainer) {
        return;
      }

      setInputValue('');
      setIsOpen(false);
    }, 0);
  }, []);

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      if (e.key === 'Backspace' && !inputValue && selectedValues.length) {
        onRemoveSelectedItem(selectedValues[selectedValues.length - 1]);
        return;
      }
      if (!visibleOptions.length) return;

      const options = Array.from(
        containerRef.current?.querySelectorAll('ul li') || [],
      ) as HTMLLIElement[];
      const index = options.indexOf(document.activeElement as HTMLLIElement);

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (index === 0) searchBoxRef.current?.focus();
          else options[Math.max(index - 1, 0)]?.focus();
          break;
        case 'ArrowDown':
          e.preventDefault();
          options[Math.min(index + 1, options.length - 1)]?.focus();
          break;
        case 'PageUp':
        case 'Home':
          e.preventDefault();
          options[0]?.focus();
          break;
        case 'PageDown':
        case 'End':
          e.preventDefault();
          options[options.length - 1]?.focus();
          break;
        case 'Enter':
          if (isOpen) {
            e.preventDefault();
            if (index !== -1) onSelectItem(visibleOptions[index]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          searchBoxRef.current?.focus();
          break;
        default:
          if (document.activeElement !== searchBoxRef.current) {
            if (
              e.key === 'Backspace' ||
              e.key === 'ArrowLeft' ||
              e.key === 'ArrowRight' ||
              (e.key.length === 1 && !e.ctrlKey && !e.metaKey)
            ) {
              searchBoxRef.current?.focus();
            }
          } else if (!isOpen) {
            setIsOpen(true);
          }
      }
    },
    [inputValue, selectedValues, visibleOptions, isOpen, onSelectItem, onRemoveSelectedItem],
  );

  return (
    <div ref={containerRef} onBlur={onBlur} onKeyDown={onKeyDown}>
      <div
        className={clsx(
          'multiselect-container',
          { 'multiselect-container--disabled': disabled },
          className,
        )}
      >
        <div className='searchWrapper' ref={searchWrapperRef}>
          {selectedValues.map((option) => (
            <span className='chip' key={option.key}>
              {option.value}
              <button
                type='button'
                onClick={() => onRemoveSelectedItem(option)}
                title={intl.formatMessage(messages.removeItem)}
                aria-label={intl.formatMessage(messages.removeItem)}
              >
                <Icon
                  className='ml-1 size-4 hover:cursor-pointer'
                  src={require('@phosphor-icons/core/regular/x-circle.svg')}
                />
              </button>
            </span>
          ))}
          <input
            type='text'
            ref={searchBoxRef}
            className='searchBox'
            name='search-name-input'
            onChange={onInputChange}
            value={inputValue}
            onFocus={onFocus}
            placeholder={intl.formatMessage(messages.placeholder)}
            autoComplete='off'
            disabled={disabled}
          />
        </div>
        <div
          className={clsx('optionListContainer', isOpen ? 'displayBlock' : 'displayNone')}
          onMouseDown={(e) => e.preventDefault()}
        >
          <ul className='optionContainer'>
            {visibleOptions.length === 0 && (
              <span className='notFound'>{intl.formatMessage(messages.noOptions)}</span>
            )}
            {visibleOptions.map((option, i) => (
              <li
                key={option.key}
                className='option'
                onClick={() => onSelectItem(option)}
                data-index={i}
                tabIndex={0}
              >
                {option.value}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export { Multiselect };
