import iconArrowLineUp from '@phosphor-icons/core/regular/arrow-line-up.svg';
import clsx from 'clsx';
import { throttle } from 'lodash-es';
import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { useIntl, type MessageDescriptor } from 'react-intl';

import AvatarStack from '@/components/accounts/avatar-stack';
import Icon from '@/components/ui/icon';
import { useColumnHeaderSlot } from '@/contexts/column-header-context';
import { useColumnScrollParent } from '@/contexts/multi-column-context';
import { useSettings } from '@/stores/settings';

const INLINE_MARGIN = 16;

interface IScrollTopButton {
  /** Callback when clicked, and also when scrolled to the top. */
  onClick: () => void;
  /** Number of unread items. */
  count: number;
  /** Message to display in the button (should contain a `{count}` value). */
  message: MessageDescriptor;
  /** Message to display when the button is rendered in the column header. If not provided, `message` will be used. */
  inlineMessage?: MessageDescriptor;
  /** Message to announce in the live region (should contain a `{count}` value). If not provided, `message` will be used. */
  liveRegionMessage?: MessageDescriptor;
  /** Distance from the top of the screen (scrolling down) before the button appears. */
  threshold?: number;
  /** Distance from the top of the screen (scrolling up) before the action is triggered. */
  autoloadThreshold?: number;
  /** Avatars of the accounts will display next to the message (limited to 3) */
  accountIds?: Array<string>;
}

/** Floating new post counter above timelines, clicked to scroll to top. */
const ScrollTopButton: React.FC<IScrollTopButton> = ({
  onClick,
  count,
  message,
  inlineMessage = message,
  threshold = 240,
  autoloadThreshold = 50,
  liveRegionMessage = message,
  accountIds,
}) => {
  const intl = useIntl();
  const { autoloadTimelines, disableUserProvidedMedia, fitScrollTopButtonInHeader } = useSettings();
  const columnScrollParent = useColumnScrollParent();
  const scrollParent = columnScrollParent || window;
  const headerSlot = useColumnHeaderSlot();

  // Whether we are scrolled past the `threshold`.
  const [scrolled, setScrolled] = useState<boolean>(false);
  // Whether we are scrolled above the `autoloadThreshold`.
  const [scrolledTop, setScrolledTop] = useState<boolean>(false);
  // Whether the button fits in the space left in the column header.
  const [fitsInHeader, setFitsInHeader] = useState<boolean>(false);
  const [button, setButton] = useState<HTMLButtonElement | null>(null);

  const inline = fitsInHeader && !!headerSlot;
  const visible = count > 0 && (!autoloadTimelines || scrolled);
  const buttonMessage = intl.formatMessage(inline ? inlineMessage : message, { count });
  const buttonLabel = intl.formatMessage(message, { count });

  /** Number of pixels scrolled down from the top of the page. */
  const getScrollTop = (): number =>
    columnScrollParent?.scrollTop ??
    (document.scrollingElement ?? document.documentElement).scrollTop;

  /** Unload feed items if scrolled to the top. */
  const maybeUnload = useCallback(() => {
    if (autoloadTimelines && scrolledTop && count) {
      onClick();
    }
  }, [autoloadTimelines, scrolledTop, count, onClick]);

  /** Scroll to top and trigger `onClick`. */
  const handleClick: React.MouseEventHandler = useCallback(() => {
    scrollParent.scrollTo({ top: 0 });
    onClick();
  }, [scrollParent, onClick]);

  useEffect(() => {
    const handleScroll = throttle(
      () => {
        const scrollTop = getScrollTop();

        setScrolled(scrollTop > threshold);
        setScrolledTop(scrollTop <= autoloadThreshold);
      },
      40,
      { trailing: true },
    );

    // Delay adding the scroll listener so navigating back doesn't
    // unload feed items before the feed is rendered.
    setTimeout(() => {
      (scrollParent ?? window).addEventListener('scroll', handleScroll);
      handleScroll();
    }, 250);

    return () => {
      (scrollParent ?? window).removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    maybeUnload();
  }, [maybeUnload]);

  useLayoutEffect(() => {
    if (!headerSlot || !button || !fitScrollTopButtonInHeader) return;

    const update = () =>
      setFitsInHeader(headerSlot.clientWidth >= button.offsetWidth + INLINE_MARGIN);

    const observer = new ResizeObserver(update);
    observer.observe(headerSlot);
    observer.observe(button);
    update();

    return () => observer.disconnect();
  }, [headerSlot, button, fitScrollTopButtonInHeader]);

  const element = (
    <div
      className={clsx('scroll-top-button', {
        'scroll-top-button--visible': visible,
        'scroll-top-button--inline': inline,
      })}
      aria-hidden={!visible}
    >
      <button
        ref={setButton}
        onClick={handleClick}
        tabIndex={visible ? 0 : -1}
        aria-label={buttonLabel}
      >
        {accountIds?.length && !disableUserProvidedMedia ? (
          <AvatarStack accountIds={accountIds} />
        ) : (
          <Icon src={iconArrowLineUp} aria-hidden />
        )}

        <p>{buttonMessage}</p>
      </button>
    </div>
  );

  return (
    <>
      <span className='sr-only' role='status' aria-live='polite' aria-atomic='true'>
        {visible ? intl.formatMessage(liveRegionMessage, { count }) : ''}
      </span>

      {headerSlot && fitsInHeader ? createPortal(element, headerSlot) : element}
    </>
  );
};

export { ScrollTopButton as default };
