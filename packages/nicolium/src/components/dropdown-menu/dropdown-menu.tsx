import {
  arrow,
  autoUpdate,
  flip,
  offset,
  type Placement,
  shift,
  size,
  useFloating,
} from '@floating-ui/react';
import iconArrowLeft from '@phosphor-icons/core/regular/arrow-left.svg';
import iconDotsThree from '@phosphor-icons/core/regular/dots-three.svg';
import clsx from 'clsx';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import ReactSwipeableViews from '@/components/react-swipeable-views';
import IconButton from '@/components/ui/icon-button';
import Portal from '@/components/ui/portal';
import { useModalsActions } from '@/stores/modals';
import { useUiStoreActions } from '@/stores/ui';
import { userTouching } from '@/utils/is-mobile';

import DropdownMenuItem, { type Menu } from './dropdown-menu-item';

const messages = defineMessages({
  back: { id: 'card.back.label', defaultMessage: 'Back' },
});

interface IDropdownMenuContent {
  handleClose: () => any;
  items?: Menu;
  component?: React.FC<{ handleClose: () => any }>;
  touchscreen?: boolean;
  width?: React.CSSProperties['width'];
  className?: string;
}

interface IDropdownMenu {
  children?: React.ReactElement<any>;
  disabled?: boolean;
  items?: Menu;
  component?: React.FC<{ handleClose: () => any }>;
  onClose?: () => void;
  onOpen?: () => void;
  onShiftClick?: React.EventHandler<React.MouseEvent | React.KeyboardEvent>;
  placement?: Placement;
  src?: string;
  title?: string;
  width?: React.CSSProperties['width'];
  className?: string;
  /** Forces the dropdown to be displayed as a dropdown menu, not in a modal. */
  forceDropdown?: boolean;
}

const DropdownMenuContent: React.FC<IDropdownMenuContent> = ({
  handleClose,
  items,
  component: Component,
  touchscreen,
  width,
  className,
}) => {
  if (touchscreen) width = undefined;

  const intl = useIntl();

  const [tab, setTab] = useState<number>();
  const ref = useRef<HTMLDivElement>(null);

  const autoFocus = items && !items.some((item) => item?.active);

  const handleKeyDown = useMemo(
    () => (e: KeyboardEvent) => {
      if (!ref.current) return;

      const elements = Array.from(
        ref.current.querySelectorAll<HTMLElement>(
          'a, button:not([disabled]), input:not([disabled]), select:not([disabled])',
        ),
      ).filter((element) => !element.hasAttribute('aria-hidden'));
      const index = elements.indexOf(document.activeElement as HTMLElement);

      let element = null;

      switch (e.key) {
        case 'ArrowLeft':
          setTab((tab) => {
            if (tab !== undefined) {
              (ref.current?.querySelector(`[data-index="${tab}"]`) as HTMLElement)?.focus();
              return undefined;
            }
            return tab;
          });
          break;
        case 'ArrowRight':
          // eslint-disable-next-line no-case-declarations
          const itemIndex = +(elements[index]?.getAttribute('data-index') ?? '');

          if (items?.[itemIndex]?.items) setTab(itemIndex);
          break;
        case 'ArrowDown':
          element = elements[index + 1] || elements[0];
          break;
        case 'ArrowUp':
          element = elements[index - 1] || elements[elements.length - 1];
          break;
        case 'Tab':
          if (e.shiftKey) {
            element = elements[index - 1] || elements[elements.length - 1];
          } else {
            element = elements[index + 1] || elements[0];
          }
          break;
        case 'Home':
          element = elements[0];
          break;
        case 'End':
          element = elements[elements.length - 1];
          break;
        case 'Escape':
          handleClose();
          break;
      }

      if (element) {
        (element as HTMLElement).focus();
        e.preventDefault();
        e.stopPropagation();
      }
    },
    [],
  );

  const handleDocumentClick = useMemo(
    () => (event: Event) => {
      if (ref.current && !ref.current.contains(event.target as Node) && event.type !== 'touchend') {
        handleClose();
        event.stopPropagation();
      }
    },
    [],
  );

  useEffect(() => {
    if (!touchscreen) {
      document.addEventListener('click', handleDocumentClick, false);
      document.addEventListener('touchend', handleDocumentClick, { passive: true });
    }
    document.addEventListener('keydown', handleKeyDown, false);

    if (Component && !items?.length) {
      const elements = Array.from(
        ref.current?.querySelectorAll<HTMLElement>(
          'a, button:not([disabled]), input:not([disabled]), select:not([disabled])',
        ) ?? [],
      ).filter((element) => !element.hasAttribute('aria-hidden'));
      const firstElement = elements[0];
      if (firstElement) {
        firstElement.focus();
      }
    }

    return () => {
      document.removeEventListener('click', handleDocumentClick);
      document.removeEventListener('touchend', handleDocumentClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleExitSubmenu: React.EventHandler<any> = (event) => {
    event.stopPropagation();
    setTab(undefined);
  };

  const renderItems = (items: Menu | undefined) => (
    <ul className='dropdown-menu__items'>
      {items?.map((item, idx) => (
        <DropdownMenuItem
          key={idx}
          item={item}
          index={idx}
          onClick={handleClose}
          autoFocus={autoFocus}
          onSetTab={setTab}
        />
      ))}
    </ul>
  );

  return (
    <div className={clsx('dropdown-menu__content', className)} ref={ref}>
      {items?.some((item) => item?.items?.length) ? (
        <ReactSwipeableViews animateHeight index={tab === undefined ? 0 : 1} style={{ width }}>
          <div className='dropdown-menu__page' style={{ width }}>
            {Component && <Component handleClose={handleClose} />}
            {(items?.length || touchscreen) && renderItems(items)}
          </div>
          <div className='dropdown-menu__expanded-page' style={{ width }}>
            {tab !== undefined && (
              <>
                <div className='dropdown-menu__header'>
                  <IconButton
                    theme='transparent'
                    src={iconArrowLeft}
                    onClick={handleExitSubmenu}
                    autoFocus
                    title={intl.formatMessage(messages.back)}
                  />
                  {items[tab]?.text}
                </div>
                {renderItems(items[tab]?.items)}
              </>
            )}
          </div>
        </ReactSwipeableViews>
      ) : (
        <>
          {Component && <Component handleClose={handleClose} />}
          {(items?.length ?? touchscreen) && renderItems(items)}
        </>
      )}
    </div>
  );
};

const DropdownMenu: React.FC<IDropdownMenu> = ({
  children,
  disabled,
  items,
  component,
  onClose,
  onOpen,
  onShiftClick,
  placement: initialPlacement = 'top',
  src = iconDotsThree,
  title = 'Menu',
  width,
  className,
  forceDropdown,
}) => {
  const { openDropdownMenu, closeDropdownMenu } = useUiStoreActions();
  const { openModal, closeModal } = useModalsActions();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isDisplayed, setIsDisplayed] = useState<boolean>(false);

  const arrowRef = useRef<HTMLDivElement>(null);

  const { x, y, strategy, refs, middlewareData, placement } = useFloating<HTMLButtonElement>({
    placement: initialPlacement,
    middleware: [
      offset(12),
      flip(),
      shift({
        padding: 8,
      }),
      arrow({
        element: arrowRef,
      }),
      size({
        apply: ({ availableHeight, elements }) => {
          elements.floating.style.maxHeight = `${Math.max(50, availableHeight - 8)}px`;
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const handleClick: React.EventHandler<
    React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>
  > = (event) => {
    event.stopPropagation();
    event.preventDefault();

    if (onShiftClick && event.shiftKey) {
      onShiftClick(event);
      return;
    }

    if (isOpen) {
      handleClose();
    } else {
      handleOpen();
    }
  };

  const handleOpen = () => {
    if (userTouching.matches && !forceDropdown) {
      const handleClose = () => {
        closeModal('DROPDOWN_MENU');
      };
      openModal(
        'DROPDOWN_MENU',
        {
          content: (
            <DropdownMenuContent
              handleClose={handleClose}
              items={items}
              component={component}
              touchscreen
              className={className}
            />
          ),
        },
        refs.reference.current as HTMLButtonElement,
      );
    } else {
      openDropdownMenu();
      setIsOpen(true);
    }

    if (onOpen) {
      onOpen();
    }
  };

  const handleClose = () => {
    (refs.reference.current as HTMLButtonElement)?.focus();

    closeDropdownMenu();
    setIsOpen(false);

    if (onClose) {
      onClose();
    }
  };

  const handleKeyPress: React.EventHandler<React.KeyboardEvent<HTMLButtonElement>> = (event) => {
    switch (event.key) {
      case ' ':
      case 'Enter':
        event.stopPropagation();
        event.preventDefault();
        handleClick(event);
        break;
    }
  };

  const arrowProps: React.CSSProperties = useMemo(() => {
    if (middlewareData.arrow) {
      const { x, y } = middlewareData.arrow;

      const staticPlacement = {
        top: 'bottom',
        right: 'left',
        bottom: 'top',
        left: 'right',
      }[placement.split('-')[0]];

      return {
        left: x !== null ? `${x}px` : '',
        top: y !== null ? `${y}px` : '',
        // Ensure the static side gets unset when
        // flipping to other placements' axes.
        right: '',
        bottom: '',
        [staticPlacement as string]: `${-(arrowRef.current?.offsetWidth ?? 0) / 2}px`,
        transform: 'rotate(45deg)',
      };
    }

    return {};
  }, [middlewareData.arrow, placement]);

  useEffect(
    () => () => {
      closeDropdownMenu();
    },
    [],
  );

  useEffect(() => {
    (refs.reference.current as HTMLButtonElement)?.setAttribute('aria-expanded', String(isOpen));
    setTimeout(
      () => {
        setIsDisplayed(isOpen);
      },
      isOpen ? 0 : 150,
    );
  }, [isOpen]);

  const clonedChildren = useMemo(() => {
    if ((items?.length === 0 && !component) || !children) {
      return null;
    }

    return React.cloneElement(children, {
      disabled,
      onClick: handleClick,
      onKeyPress: handleKeyPress,
      ref: refs.setReference,
      'aria-haspopup': true,
      'aria-expanded': isOpen,
    });
  }, [children, !!items?.length, component]);

  if (items?.length === 0 && !component) {
    return null;
  }

  const getClassName = () => {
    const className = clsx(`dropdown-menu__wrapper dropdown-menu--${placement}`, {
      'dropdown-menu--opening': !(isDisplayed && isOpen),
      'dropdown-menu--open': isDisplayed && isOpen,
    });

    return className;
  };

  return (
    <>
      {clonedChildren ?? (
        <IconButton
          disabled={disabled}
          className={clsx({
            'dropdown-menu__button': true,
            'dropdown-menu__button--open': isOpen,
          })}
          title={title}
          src={src}
          onClick={handleClick}
          onKeyPress={handleKeyPress}
          ref={refs.setReference}
        />
      )}

      {isOpen || isDisplayed ? (
        <Portal>
          <div
            data-testid='dropdown-menu'
            ref={refs.setFloating}
            className='dropdown-menu'
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
            }}
          >
            <div className={getClassName()}>
              <DropdownMenuContent
                handleClose={handleClose}
                items={items}
                component={component}
                width={width}
                className={className}
              />

              {/* Arrow */}
              <div ref={arrowRef} style={arrowProps} className='dropdown-menu__arrow' />
            </div>
          </div>
        </Portal>
      ) : null}
    </>
  );
};

export { type Menu, DropdownMenu as default };
