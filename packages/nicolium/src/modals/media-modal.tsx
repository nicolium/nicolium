import iconArrowLeft from '@phosphor-icons/core/regular/arrow-left.svg';
import iconArrowRight from '@phosphor-icons/core/regular/arrow-right.svg';
import iconArrowsInSimple from '@phosphor-icons/core/regular/arrows-in-simple.svg';
import iconArrowsOutSimple from '@phosphor-icons/core/regular/arrows-out-simple.svg';
import iconDownloadSimple from '@phosphor-icons/core/regular/download-simple.svg';
import iconX from '@phosphor-icons/core/regular/x.svg';
import { animated, useSpring } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import clsx from 'clsx';
import React, { type RefCallback, useCallback, useEffect, useMemo, useState } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import Audio from '@/components/media/audio';
import ExtendedVideoPlayer from '@/components/media/extended-video-player';
import Video from '@/components/media/video';
import ZoomableImage from '@/components/media/zoomable-image';
import PlaceholderStatus from '@/components/placeholders/placeholder-status';
import StatusActionBar from '@/components/statuses/status-action-bar';
import { StatusLink } from '@/components/statuses/status-link';
import Icon from '@/components/ui/icon';
import IconButton from '@/components/ui/icon-button';
import Thread from '@/features/status/components/thread';
import { useStatus } from '@/queries/statuses/use-status';

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
  const { lang, statusId, time = 0 } = props;

  const onClose = useCallback(() => props.onClose('MEDIA'), [props.onClose]);

  const intl = useIntl();

  const { data: status, isPending } = useStatus(statusId, { withContext: true });
  const media = status?.media_attachments ?? props.media ?? [];

  const [index, setIndex] = useState<number>(props.index || 0);
  const [zoomedIn, setZoomedIn] = useState(false);
  const [navigationHidden, setNavigationHidden] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(!status);
  const [viewportDimensions, setViewportDimensions] = useState({
    width: 0,
    height: 0,
  });

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

  const handleRef: RefCallback<HTMLDivElement> = useCallback((ele) => {
    if (ele?.clientWidth && ele.clientHeight) {
      setViewportDimensions({
        width: ele.clientWidth,
        height: ele.clientHeight,
      });
    }
  }, []);

  const hasMultipleImages = media.length > 1;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevClick();
        e.preventDefault();
        e.stopPropagation();
      } else if (e.key === 'ArrowRight') {
        handleNextClick();
        e.preventDefault();
        e.stopPropagation();
      }
    },
    [handleNextClick, handlePrevClick],
  );

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

  const toggleNavigation = useCallback(() => {
    setNavigationHidden((value) => !value);
  }, []);

  const currentMedia = media[index];

  const zoomable =
    currentMedia?.type === 'image' &&
    currentMedia.meta.original &&
    viewportDimensions.width > 0 &&
    viewportDimensions.height > 0 &&
    (currentMedia.meta.original.width > viewportDimensions.width ||
      currentMedia.meta.original.height > viewportDimensions.height);

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
          <StatusLink status={status} account={status.account}>
            <FormattedMessage id='lightbox.view_context' defaultMessage='View context' />
          </StatusLink>
        );

        if (attachment.type === 'image') {
          return (
            <ZoomableImage
              src={attachment.url}
              blurhash={attachment.blurhash ?? undefined}
              width={width!}
              height={height!}
              alt={attachment.description}
              lang={lang}
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
    [handleZoomClick, index, lang, media, onClose, status, time, toggleNavigation, zoomedIn],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown, false);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleClickOutside: React.MouseEventHandler<HTMLElement> = (e) => {
    if ((e.target as HTMLElement).tagName === 'DIV') {
      onClose();
    }
  };

  return (
    <div
      className={clsx('media-modal', { 'media-modal--fullscreen': isFullScreen })}
      role='presentation'
    >
      <div
        {...bind()}
        onClick={handleClickOutside}
        className='media-modal__content'
        ref={handleRef}
      >
        <animated.div
          style={wrapperStyles}
          className='media-modal__closer'
          role='presentation'
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
        >
          {content}
        </animated.div>

        <div
          className={clsx('media-modal__navigation', {
            'media-modal__navigation--hidden': navigationHidden,
          })}
        >
          <div className={clsx('media-modal__buttons')}>
            <IconButton
              title={intl.formatMessage(messages.close)}
              src={iconX}
              onClick={onClose}
              theme='dark'
            />

            <div className='media-modal__buttons__right'>
              {zoomable && (
                <IconButton
                  title={intl.formatMessage(zoomedIn ? messages.zoomOut : messages.zoomIn)}
                  src={zoomedIn ? iconArrowsInSimple : iconArrowsOutSimple}
                  theme='dark'
                  onClick={handleZoomClick}
                />
              )}

              <IconButton
                title={intl.formatMessage(messages.download)}
                src={iconDownloadSimple}
                theme='dark'
                onClick={handleDownload}
              />

              {status && (
                <IconButton
                  src={isFullScreen ? iconArrowsInSimple : iconArrowsOutSimple}
                  title={intl.formatMessage(isFullScreen ? messages.minimize : messages.expand)}
                  theme='dark'
                  className='media-modal__status-button'
                  onClick={() => {
                    setIsFullScreen(!isFullScreen);
                  }}
                />
              )}
            </div>
          </div>
          {hasMultipleImages && (
            <div className='media-modal__arrows'>
              <div className='media-modal__arrow'>
                <button
                  tabIndex={0}
                  onClick={handlePrevClick}
                  aria-label={intl.formatMessage(messages.previous)}
                >
                  <Icon src={iconArrowLeft} />
                </button>
              </div>
              <div className='media-modal__arrow'>
                <button
                  tabIndex={0}
                  onClick={handleNextClick}
                  aria-label={intl.formatMessage(messages.next)}
                >
                  <Icon src={iconArrowRight} />
                </button>
              </div>
            </div>
          )}
          {status ? (
            <div className='media-modal__status-actions'>
              <StatusActionBar status={status} space='md' expandable />
            </div>
          ) : (
            <span />
          )}
        </div>
      </div>

      {(status || (statusId && isPending)) && (
        <div className='media-modal__thread'>
          {status ? (
            <Thread status={status} withMedia={false} itemClassName='px-4' isModal />
          ) : (
            <PlaceholderStatus />
          )}
        </div>
      )}
    </div>
  );
};

export { type MediaModalProps, MediaModal as default };
