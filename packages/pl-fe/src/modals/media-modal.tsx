import { animated, useSpring } from '@react-spring/web';
import { Link } from '@tanstack/react-router';
import { useDrag } from '@use-gesture/react';
import clsx from 'clsx';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { fetchStatusWithContext } from '@/actions/statuses';
import ExtendedVideoPlayer from '@/components/extended-video-player';
import MissingIndicator from '@/components/missing-indicator';
import StatusActionBar from '@/components/status-action-bar';
import HStack from '@/components/ui/hstack';
import Icon from '@/components/ui/icon';
import IconButton from '@/components/ui/icon-button';
import Audio from '@/features/audio';
import PlaceholderStatus from '@/features/placeholder/components/placeholder-status';
import Thread from '@/features/status/components/thread';
import ZoomableImage from '@/features/ui/components/zoomable-image';
import Video from '@/features/video';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useAppSelector } from '@/hooks/use-app-selector';
import { makeGetStatus } from '@/selectors';
import { userTouching } from '@/utils/is-mobile';

import type { BaseModalProps } from '@/features/ui/components/modal-root';
import type { MediaAttachment } from 'pl-api';

const MIN_SWIPE_DISTANCE = 400;

const messages = defineMessages({
  close: { id: 'lightbox.close', defaultMessage: 'Close' },
  expand: { id: 'lightbox.expand', defaultMessage: 'Expand' },
  minimize: { id: 'lightbox.minimize', defaultMessage: 'Minimize' },
  next: { id: 'lightbox.next', defaultMessage: 'Next' },
  previous: { id: 'lightbox.previous', defaultMessage: 'Previous' },
  zoomIn: { id: 'lightbox.zoom_in', defaultMessage: 'Zoom to actual size' },
  zoomOut: { id: 'lightbox.zoom_out', defaultMessage: 'Zoom to fit' },
  download: { id: 'video.download', defaultMessage: 'Download file' },
});

interface MediaModalProps {
  media?: Array<MediaAttachment>;
  statusId?: string;
  index: number;
  time?: number;
  lang?: string;
}

const MediaModal: React.FC<MediaModalProps & BaseModalProps> = (props) => {
  const { statusId, onClose, time = 0 } = props;

  const dispatch = useAppDispatch();
  const intl = useIntl();

  const getStatus = useCallback(makeGetStatus(), []);
  const status = useAppSelector((state) =>
    statusId ? getStatus(state, { id: statusId }) : undefined,
  );
  const media = status?.media_attachments ?? props.media ?? [];

  const [isLoaded, setIsLoaded] = useState<boolean>(!!status);
  const [index, setIndex] = useState<number>(props.index || 0);
  const [zoomedIn, setZoomedIn] = useState(false);
  const [navigationHidden, setNavigationHidden] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(!status);

  const [wrapperStyles, api] = useSpring(
    () => ({
      x: `-${index * 100}%`,
    }),
    [index],
  );

  const handleChangeIndex = useCallback(
    (newIndex: number, animate = false) => {
      if (newIndex < 0) {
        newIndex = media.length + newIndex;
      } else if (newIndex >= media.length) {
        newIndex = newIndex % media.length;
      }
      setIndex(newIndex);
      setZoomedIn(false);
      if (animate) {
        void api.start({ x: `calc(-${newIndex * 100}% + 0px)` });
      }
    },
    [api, media.length],
  );
  const handlePrevClick = useCallback(() => {
    handleChangeIndex(index - 1, true);
  }, [handleChangeIndex, index]);
  const handleNextClick = useCallback(() => {
    handleChangeIndex(index + 1, true);
  }, [handleChangeIndex, index]);

  // const [viewportDimensions, setViewportDimensions] = useState<{
  //     width: number;
  //     height: number;
  //   }>({ width: 0, height: 0 });

  // const handleRef: RefCallback<HTMLDivElement> = useCallback((ele) => {
  //   if (ele?.clientWidth && ele.clientHeight) {
  //     setViewportDimensions({
  //       width: ele.clientWidth,
  //       height: ele.clientHeight,
  //     });
  //   }
  // }, []);

  const hasMultipleImages = media.length > 1;

  const navigationHiddenClassName = navigationHidden ? 'pointer-events-none opacity-0' : '';

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        handlePrevClick();
        e.preventDefault();
        e.stopPropagation();
        break;
      case 'ArrowRight':
        handleNextClick();
        e.preventDefault();
        e.stopPropagation();
        break;
    }
  };

  const bind = useDrag(
    ({ active, movement: [mx], direction: [xDir], cancel, event }) => {
      // Disable swipe when zoomed in.
      if (zoomedIn) {
        return;
      }

      // Disable swipe when interacting with video/audio controls or other interactive elements
      const target = event?.target as HTMLElement | null;
      if (target) {
        const interactiveParent = target.closest('.video-player__controls, button');
        if (interactiveParent) {
          cancel();
          return;
        }
      }

      // If dragging and swipe distance is enough, change the index.
      if (active && Math.abs(mx) > Math.min(window.innerWidth / 4, MIN_SWIPE_DISTANCE)) {
        handleChangeIndex(index - xDir);
        cancel();
      }
      // Set the x position via calc to ensure proper centering regardless of screen size.
      const x = active ? mx : 0;
      void api.start({ x: `calc(-${index * 100}% + ${x}px)` });
    },
    { pointer: { capture: false } },
  );

  const handleDownload = () => {
    const mediaItem = hasMultipleImages ? media[index] : media[0];
    window.open(mediaItem?.url);
  };

  const toggleNavigation = () => {
    setNavigationHidden((value) => !value && userTouching.matches);
  };

  // const currentMedia = media[index];

  // const zoomable =
  //     currentMedia.type === 'image' && currentMedia.meta.original &&
  //     (currentMedia.meta.original.width > viewportDimensions.width || currentMedia.meta.original.height > viewportDimensions.height);

  const handleZoomClick = useCallback(() => {
    setZoomedIn((prev) => !prev);
  }, []);

  const content = useMemo(
    () =>
      media.map((attachment, idx) => {
        let width: number | undefined, height: number | undefined;
        if (
          attachment.type === 'image' ||
          attachment.type === 'gifv' ||
          attachment.type === 'video'
        ) {
          width = attachment.meta?.original?.width;
          height = attachment.meta?.original?.height;
        }

        const link = status && (
          <Link
            to='/@{$username}/posts/$statusId'
            params={{ username: status.account.acct, statusId: status.id }}
          >
            <FormattedMessage id='lightbox.view_context' defaultMessage='View context' />
          </Link>
        );

        if (attachment.type === 'image') {
          return (
            <ZoomableImage
              src={attachment.url}
              blurhash={attachment.blurhash ?? undefined}
              width={width!}
              height={height!}
              alt={attachment.description}
              lang={props.lang}
              key={attachment.url}
              onClick={toggleNavigation}
              onDoubleClick={handleZoomClick}
              onClose={onClose}
              onZoomChange={setZoomedIn}
              zoomedIn={zoomedIn && idx === index}
            />
          );
        } else if (attachment.type === 'video') {
          return (
            <Video
              preview={attachment.preview_url}
              blurhash={attachment.blurhash}
              src={attachment.url}
              width={width}
              height={height}
              startTime={time}
              detailed
              autoFocus={idx === index}
              link={link}
              alt={attachment.description}
              key={attachment.url}
              visible
            />
          );
        } else if (attachment.type === 'audio') {
          return (
            <Audio
              src={attachment.url}
              alt={attachment.description}
              poster={
                attachment.preview_url !== attachment.url
                  ? attachment.preview_url
                  : status?.account.avatar_static
              }
              backgroundColor={attachment.meta.colors?.background}
              foregroundColor={attachment.meta.colors?.foreground}
              accentColor={attachment.meta.colors?.accent}
              duration={attachment.meta.original?.duration ?? 0}
              key={attachment.url}
            />
          );
        } else if (attachment.type === 'gifv') {
          return (
            <ExtendedVideoPlayer
              src={attachment.url}
              muted
              controls={false}
              width={width}
              height={height}
              key={attachment.preview_url}
              alt={attachment.description}
              onClick={toggleNavigation}
            />
          );
        }

        return null;
      }),
    [media.length, index, zoomedIn, handleZoomClick],
  );

  // Load data.
  useEffect(() => {
    if (status?.id) {
      dispatch(fetchStatusWithContext(status.id, intl))
        .then(() => {
          setIsLoaded(true);
        })
        .catch(() => {
          setIsLoaded(true);
        });
    }
  }, [status?.id]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown, false);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [index]);

  if (statusId) {
    if (!isLoaded) {
      return <MissingIndicator />;
    } else if (!status) {
      return <PlaceholderStatus />;
    }
  }

  const handleClickOutside: React.MouseEventHandler<HTMLElement> = (e) => {
    if ((e.target as HTMLElement).tagName === 'DIV') {
      onClose();
    }
  };

  return (
    <div
      className={clsx('⁂-media-modal', { '⁂-media-modal--fullscreen': isFullScreen })}
      role='presentation'
    >
      <div
        {...bind()}
        onClick={handleClickOutside}
        className='⁂-media-modal__content'
        // ref={handleRef}
      >
        <animated.div
          style={wrapperStyles}
          className='⁂-media-modal__closer'
          role='presentation'
          onClick={() => {
            onClose();
          }}
        >
          {content}
        </animated.div>

        <div className='⁂-media-modal__navigation'>
          <HStack
            alignItems='center'
            justifyContent='between'
            className={clsx(
              'pointer-events-auto z-10 flex-[0_0_60px] p-4 transition-opacity',
              navigationHiddenClassName,
            )}
          >
            <IconButton
              title={intl.formatMessage(messages.close)}
              src={require('@phosphor-icons/core/regular/x.svg')}
              onClick={() => {
                onClose('MEDIA');
              }}
              theme='dark'
              className='!p-1.5 hover:scale-105 hover:bg-gray-900'
              iconClassName='h-5 w-5'
            />

            <HStack alignItems='center' space={2}>
              {/* {zoomable && (
                <IconButton
                  title={intl.formatMessage(zoomedIn ? messages.zoomOut : messages.zoomIn)}
                  src={zoomedIn ? require('@phosphor-icons/core/regular/magnifying-glass-minus.svg') : require('@phosphor-icons/core/regular/magnifying-glass-plus.svg')}
                  theme='dark'
                  className='!p-1.5 hover:scale-105 hover:bg-gray-900'
                  iconClassName='h-5 w-5'
                  onClick={handleZoomClick}
                />
              )} */}

              <IconButton
                title={intl.formatMessage(messages.download)}
                src={require('@phosphor-icons/core/regular/download-simple.svg')}
                theme='dark'
                className='!p-1.5 hover:scale-105 hover:bg-gray-900'
                iconClassName='h-5 w-5'
                onClick={handleDownload}
              />

              {status && (
                <IconButton
                  src={
                    isFullScreen
                      ? require('@phosphor-icons/core/regular/arrows-in-simple.svg')
                      : require('@phosphor-icons/core/regular/arrows-out-simple.svg')
                  }
                  title={intl.formatMessage(isFullScreen ? messages.minimize : messages.expand)}
                  theme='dark'
                  className='hidden !p-1.5 hover:scale-105 hover:bg-gray-900 xl:block'
                  iconClassName='h-5 w-5'
                  onClick={() => {
                    setIsFullScreen(!isFullScreen);
                  }}
                />
              )}
            </HStack>
          </HStack>
          {hasMultipleImages && (
            <HStack className='z-10 mx-5' justifyContent='between'>
              <div
                className={clsx(
                  'pointer-events-auto z-10 flex h-fit items-center transition-opacity',
                  navigationHiddenClassName,
                )}
              >
                <button
                  tabIndex={0}
                  className='flex size-10 items-center justify-center rounded-full bg-gray-900 text-white'
                  onClick={handlePrevClick}
                  aria-label={intl.formatMessage(messages.previous)}
                >
                  <Icon
                    src={require('@phosphor-icons/core/regular/arrow-left.svg')}
                    className='size-5'
                  />
                </button>
              </div>
              <div
                className={clsx(
                  'pointer-events-auto z-10 flex h-fit items-center transition-opacity',
                  navigationHiddenClassName,
                )}
              >
                <button
                  tabIndex={0}
                  className='flex size-10 items-center justify-center rounded-full bg-gray-900 text-white'
                  onClick={handleNextClick}
                  aria-label={intl.formatMessage(messages.next)}
                >
                  <Icon
                    src={require('@phosphor-icons/core/regular/arrow-right.svg')}
                    className='size-5'
                  />
                </button>
              </div>
            </HStack>
          )}
          {status ? (
            <HStack
              justifyContent='center'
              className={clsx(
                'pointer-events-auto flex-[0_0_60px] transition-opacity',
                navigationHiddenClassName,
              )}
            >
              <StatusActionBar status={status} space='md' expandable />
            </HStack>
          ) : (
            <span />
          )}
        </div>
      </div>

      {status && (
        <div
          className={clsx(
            '-right-96 hidden bg-white transition-all xl:fixed xl:inset-y-0 xl:right-0 xl:flex xl:w-96 xl:flex-col',
            {
              'xl:!-right-96': isFullScreen,
            },
          )}
        >
          <Thread status={status} withMedia={false} itemClassName='px-4' isModal />
        </div>
      )}
    </div>
  );
};

export { type MediaModalProps, MediaModal as default };
