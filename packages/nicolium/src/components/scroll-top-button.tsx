import iconArrowLineUp from '@phosphor-icons/core/regular/arrow-line-up.svg';
import clsx from 'clsx';
import throttle from 'lodash/throttle';
import React, { useState, useEffect, useCallback } from 'react';
import { useIntl, type MessageDescriptor } from 'react-intl';

import AvatarStack from '@/components/accounts/avatar-stack';
import Icon from '@/components/ui/icon';
import { useSettings } from '@/stores/settings';

interface IScrollTopButton {
  /** Callback when clicked, and also when scrolled to the top. */
  onClick: () => void;
  /** Number of unread items. */
  count: number;
  /** Message to display in the button (should contain a `{count}` value). */
  message: MessageDescriptor;
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
  threshold = 240,
  autoloadThreshold = 50,
  liveRegionMessage = message,
  accountIds,
}) => {
  const intl = useIntl();
  const { autoloadTimelines, disableUserProvidedMedia } = useSettings();

  // Whether we are scrolled past the `threshold`.
  const [scrolled, setScrolled] = useState<boolean>(false);
  // Whether we are scrolled above the `autoloadThreshold`.
  const [scrolledTop, setScrolledTop] = useState<boolean>(false);

  const visible = count > 0 && (!autoloadTimelines || scrolled);
  const buttonMessage = intl.formatMessage(message, { count });

  /** Number of pixels scrolled down from the top of the page. */
  const getScrollTop = (): number =>
    (document.scrollingElement ?? document.documentElement).scrollTop;

  /** Unload feed items if scrolled to the top. */
  const maybeUnload = useCallback(() => {
    if (autoloadTimelines && scrolledTop && count) {
      onClick();
    }
  }, [autoloadTimelines, scrolledTop, count, onClick]);

  /** Scroll to top and trigger `onClick`. */
  const handleClick: React.MouseEventHandler = useCallback(() => {
    window.scrollTo({ top: 0 });
    onClick();
  }, [onClick]);

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
      window.addEventListener('scroll', handleScroll);
      handleScroll();
    }, 250);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    maybeUnload();
  }, [maybeUnload]);

  return (
    <>
      <span className='sr-only' role='status' aria-live='polite' aria-atomic='true'>
        {visible ? intl.formatMessage(liveRegionMessage, { count }) : ''}
      </span>

      <div
        className={clsx('scroll-top-button', { 'scroll-top-button--visible': visible })}
        aria-hidden={!visible}
      >
        <button onClick={handleClick} tabIndex={visible ? 0 : -1} aria-label={buttonMessage}>
          {accountIds?.length && !disableUserProvidedMedia ? (
            <AvatarStack accountIds={accountIds} />
          ) : (
            <Icon src={iconArrowLineUp} aria-hidden />
          )}

          <p>{buttonMessage}</p>
        </button>
      </div>
    </>
  );
};

export { ScrollTopButton as default };
