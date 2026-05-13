import { autoUpdate, flip, size, useFloating } from '@floating-ui/react';
import clsx from 'clsx';
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';

import AutosuggestEmoji from '@/components/autosuggest-emoji';
import Icon from '@/components/icon';
import Input from '@/components/ui/input';
import Portal from '@/components/ui/portal';
import AutosuggestAccount from '@/features/compose/components/autosuggest-account';
import { textAtCursorMatchesToken } from '@/utils/suggestions';

import AutosuggestLocation from './autosuggest-location';

import type { Menu, MenuItem } from '@/components/dropdown-menu';
import type { InputThemes } from '@/components/ui/input';
import type { Emoji } from '@/features/emoji';
import type { Location } from 'pl-api';

type AutoSuggestion = string | Emoji | Location;
type AutosuggestInputElement = HTMLInputElement | HTMLTextAreaElement;
type AutosuggestInputComponent = React.ElementType;

interface IAutosuggestInput extends Pick<
  React.HTMLAttributes<AutosuggestInputElement>,
  'lang' | 'onChange' | 'onKeyUp' | 'onKeyDown'
> {
  value: string;
  suggestions: Array<AutoSuggestion>;
  disabled?: boolean;
  placeholder?: string;
  onSuggestionSelected: (
    tokenStart: number,
    lastToken: string | null,
    suggestion: AutoSuggestion,
  ) => void;
  onSuggestionsClearRequested: () => void;
  onSuggestionsFetchRequested: (token: string) => void;
  autoFocus?: boolean;
  autoSelect?: boolean;
  className?: string;
  id?: string;
  searchTokens?: string[];
  maxLength?: number;
  menu?: Menu;
  hidePortal?: boolean;
  theme?: InputThemes;
  as?: AutosuggestInputComponent;
  inputProps?: Record<string, unknown>;
}

const AutosuggestInput = React.forwardRef<AutosuggestInputElement, IAutosuggestInput>(
  (
    {
      autoFocus = false,
      autoSelect = true,
      searchTokens = ['@', ':', '#'],
      as: InputComponent = Input,
      inputProps,
      ...props
    },
    forwardedRef,
  ) => {
    const getFirstIndex = () => (autoSelect ? 0 : -1);

    const [suggestionsHidden, setSuggestionsHidden] = useState(true);
    const [focused, setFocused] = useState(false);
    const [selectedSuggestion, setSelectedSuggestion] = useState(getFirstIndex());
    const [lastToken, setLastToken] = useState<string | null>(null);
    const [tokenStart, setTokenStart] = useState<number | null>(0);

    const inputRef = useRef<AutosuggestInputElement>(null);
    const suggestionsRef = useRef<HTMLUListElement>(null);
    const { x, y, strategy, refs } = useFloating({
      placement: 'bottom-start',
      middleware: [
        flip(),
        size({
          apply: ({ elements, rects }) => {
            elements.floating.style.width = `${rects.reference.width}px`;
          },
        }),
      ],
      whileElementsMounted: autoUpdate,
    });

    useImperativeHandle(forwardedRef, () => inputRef.current as AutosuggestInputElement);

    const setInputRef = (node: AutosuggestInputElement | null) => {
      inputRef.current = node;
      refs.setReference(node);
    };

    const onChange: React.ChangeEventHandler<AutosuggestInputElement> = (e) => {
      const [tokenStart, token] = textAtCursorMatchesToken(
        e.target.value,
        e.target.selectionStart ?? 0,
        searchTokens,
      );

      if (token !== null && lastToken !== token) {
        setLastToken(token);
        setSelectedSuggestion(0);
        setTokenStart(tokenStart);
        props.onSuggestionsFetchRequested(token);
      } else if (token === null) {
        setLastToken(null);
        props.onSuggestionsClearRequested();
      }

      if (props.onChange) {
        props.onChange(e);
      }
    };

    const onKeyDown: React.KeyboardEventHandler<AutosuggestInputElement> = (e) => {
      const { suggestions, menu, disabled } = props;
      const firstIndex = getFirstIndex();
      const lastIndex = suggestions.length + (menu ?? []).length - 1;

      if (disabled) {
        e.preventDefault();
        return;
      }

      if (e.which === 229) {
        // Ignore key events during text composition
        // e.key may be a name of the physical key even in this case (e.x. Safari / Chrome on Mac)
        return;
      }

      switch (e.key) {
        case 'Escape':
          if (suggestions.length === 0 || suggestionsHidden) {
            document.querySelector('.ui')?.parentElement?.focus();
          } else {
            e.preventDefault();
            setSuggestionsHidden(true);
          }

          break;
        case 'ArrowDown':
          if (!suggestionsHidden && (suggestions.length > 0 || menu)) {
            e.preventDefault();
            setSelectedSuggestion((selectedSuggestion) =>
              Math.min(selectedSuggestion + 1, lastIndex),
            );
          }

          break;
        case 'ArrowUp':
          if (!suggestionsHidden && (suggestions.length > 0 || menu)) {
            e.preventDefault();
            setSelectedSuggestion((selectedSuggestion) => Math.max(selectedSuggestion - 1, 0));
          }

          break;
        case 'Enter':
        case 'Tab':
          // Select suggestion
          if (!suggestionsHidden && selectedSuggestion > -1 && (suggestions.length > 0 || menu)) {
            e.preventDefault();
            e.stopPropagation();
            setSelectedSuggestion(firstIndex);

            if (selectedSuggestion < suggestions.length) {
              props.onSuggestionSelected(tokenStart!, lastToken, suggestions[selectedSuggestion]);
              props.onSuggestionsClearRequested();
            } else if (menu) {
              const item = menu[selectedSuggestion - suggestions.length];
              handleMenuItemAction(item, e);
            }
          }

          break;
      }

      if (e.defaultPrevented || !props.onKeyDown) {
        return;
      }

      if (props.onKeyDown) {
        props.onKeyDown(e);
      }
    };

    const onBlur = () => {
      setSuggestionsHidden(true);
      setFocused(false);
    };

    const onFocus = () => {
      setFocused(true);
    };

    const onSuggestionClick: React.EventHandler<React.MouseEvent | React.TouchEvent> = (e) => {
      const index = Number(e.currentTarget?.getAttribute('data-index'));
      const suggestion = props.suggestions[index];
      props.onSuggestionSelected(tokenStart!, lastToken, suggestion);
      props.onSuggestionsClearRequested();
      inputRef.current?.focus();
      e.preventDefault();
    };

    useEffect(() => {
      if (suggestionsHidden && focused) setSuggestionsHidden(false);
    }, [props.suggestions]);

    const renderSuggestion = (suggestion: AutoSuggestion, i: number) => {
      let inner, key;

      if (typeof suggestion === 'object' && 'origin_id' in suggestion) {
        inner = <AutosuggestLocation location={suggestion} />;
        key = suggestion.origin_id;
      } else if (typeof suggestion === 'object') {
        inner = <AutosuggestEmoji emoji={suggestion} />;
        key = suggestion.id;
      } else {
        inner = <AutosuggestAccount id={suggestion} />;
        key = suggestion;
      }

      return (
        <div
          role='button'
          tabIndex={0}
          key={key}
          data-index={i}
          className={clsx({
            '⁂-autosuggest-suggestions__item': true,
            '⁂-autosuggest-suggestions__item--selected': i === selectedSuggestion,
          })}
          onMouseDown={onSuggestionClick}
          onTouchEnd={onSuggestionClick}
        >
          {inner}
        </div>
      );
    };

    const handleMenuItemAction = (
      item: MenuItem | null,
      e: React.MouseEvent | React.KeyboardEvent,
    ) => {
      onBlur();
      if (item?.action) {
        item.action(e);
      }
    };

    const handleMenuItemClick =
      (item: MenuItem | null): React.MouseEventHandler =>
      (e) => {
        e.preventDefault();
        handleMenuItemAction(item, e);
      };

    const renderMenu = () => {
      const { menu } = props;

      if (!menu) {
        return null;
      }

      return menu.map((item, i) => (
        <a
          className={'⁂-autosuggest-suggestions__menu-item'}
          href='#'
          role='button'
          tabIndex={0}
          onMouseDown={handleMenuItemClick(item)}
          key={i}
        >
          {item?.icon && <Icon src={item.icon} />}

          <span>{item?.text}</span>
        </a>
      ));
    };

    const visible = !suggestionsHidden && (props.suggestions.length || (props.menu && props.value));
    const inputTypeProps = InputComponent === Input ? { type: 'text' } : {};

    return [
      <div key='input' className='⁂-autosuggest-input'>
        <InputComponent
          {...inputProps}
          {...inputTypeProps}
          className={props.className}
          ref={setInputRef}
          disabled={props.disabled}
          placeholder={props.placeholder}
          autoFocus={autoFocus}
          value={props.value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onKeyUp={props.onKeyUp}
          onFocus={onFocus}
          onBlur={onBlur}
          aria-autocomplete='list'
          id={props.id}
          maxLength={props.maxLength}
          data-testid='autosuggest-input'
          theme={props.theme}
          lang={props.lang}
          aria-label={props.placeholder}
        />
      </div>,
      <Portal key='portal'>
        <div
          ref={refs.setFloating}
          style={{ position: strategy, left: x ?? 0, top: y ?? 0 }}
          className={clsx({
            '⁂-autosuggest-suggestions': true,
            '⁂-autosuggest-suggestions--visible': visible,
          })}
        >
          <ul className='⁂-autosuggest-suggestions__items' ref={suggestionsRef}>
            {props.suggestions.map(renderSuggestion)}
          </ul>

          {renderMenu()}
        </div>
      </Portal>,
    ];
  },
);

AutosuggestInput.displayName = 'AutosuggestInput';

export { type AutoSuggestion, AutosuggestInput as default };
