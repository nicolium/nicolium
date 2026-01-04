import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { type RefCallback, useCallback, useEffect, useState } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';
import ReactSwipeableViews from 'react-swipeable-views';

import { fetchStatusWithContext } from 'pl-fe/actions/statuses';
import ExtendedVideoPlayer from 'pl-fe/components/extended-video-player';
import MissingIndicator from 'pl-fe/components/missing-indicator';
import StatusActionBar from 'pl-fe/components/status-action-bar';
import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import IconButton from 'pl-fe/components/ui/icon-button';
import Stack from 'pl-fe/components/ui/stack';
import Audio from 'pl-fe/features/audio';
import PlaceholderStatus from 'pl-fe/features/placeholder/components/placeholder-status';
import Thread from 'pl-fe/features/status/components/thread';
import ZoomableImage from 'pl-fe/features/ui/components/zoomable-image';
import Video from 'pl-fe/features/video';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { userTouching } from 'pl-fe/is-mobile';
import { makeGetStatus } from 'pl-fe/selectors';

import type { MediaAttachment } from 'pl-api';
import type { BaseModalProps } from 'pl-fe/features/ui/components/modal-root';

const messages = defineMessages({
  close: { id: 'lightbox.close', defaultMessage: 'Close' },
  expand: { id: 'lightbox.expand', defaultMessage: 'Expand' },
  minimize: { id: 'lightbox.minimize', defaultMessage: 'Minimize' },
  next: { id: 'lightbox.next', defaultMessage: 'Next' },
  previous: { id: 'lightbox.previous', defaultMessage: 'Previous' },
  zoomIn: { id: 'lightbox.zoom_in', defaultMessage: 'Zoom to actual size' },
  zoomOut: { id: 'lightbox.zoom_out', defaultMessage: 'Zoom to fit' },
});

// you can't use 100vh, because the viewport height is taller
// than the visible part of the document in some mobile
// browsers when its address bar is visible.
// https://developers.google.com/web/updates/2016/12/url-bar-resizing
const swipeableViewsStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
};

const containerStyle: React.CSSProperties = {
  alignItems: 'center', // center vertically
};

interface MediaModalProps {
  media?: Array<MediaAttachment>;
  statusId?: string;
  index: number;
  time?: number;
  lang?: string;
}

const MediaModal: React.FC<MediaModalProps & BaseModalProps> = (props) => {
  const {
    statusId,
    onClose,
    time = 0,
  } = props;

  const dispatch = useAppDispatch();
  const intl = useIntl();

  const getStatus = useCallback(makeGetStatus(), []);
  const status = useAppSelector((state) => statusId ? getStatus(state, { id: statusId }) : undefined);
  const media = status?.media_attachments || props.media || [];

  const [isLoaded, setIsLoaded] = useState<boolean>(!!status);
  const [index, setIndex] = useState<number>(props.index || 0);
  const [zoomedIn, setZoomedIn] = useState(false);
  const [navigationHidden, setNavigationHidden] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(!status);

  const [viewportDimensions, setViewportDimensions] = useState<{
      width: number;
      height: number;
    }>({ width: 0, height: 0 });

  const handleRef: RefCallback<HTMLDivElement> = useCallback((ele) => {
    if (ele?.clientWidth && ele.clientHeight) {
      setViewportDimensions({
        width: ele.clientWidth,
        height: ele.clientHeight,
      });
    }
  }, []);

  const hasMultipleImages = media.length > 1;

  const handleSwipe = (index: number) => setIndex(index % media.length);
  const handleNextClick = () => setIndex((index + 1) % media.length);
  const handlePrevClick = () => setIndex((media.length + index - 1) % media.length);

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

  const handleDownload = () => {
    const mediaItem = hasMultipleImages ? media[index as number] : media[0];
    window.open(mediaItem?.url);
  };

  const toggleNavigation = () => {
    setNavigationHidden(value => !value && userTouching.matches);
  };

  const currentMedia = media[index];

  const zoomable =
      currentMedia.type === 'image' && currentMedia.meta.original &&
      (currentMedia.meta.original.width > viewportDimensions.width || currentMedia.meta.original.height > viewportDimensions.height);

  const handleZoomClick = useCallback(() => {
    setZoomedIn((prev) => !prev);
  }, []);

  const content = media.map((attachment, i) => {
    let width: number | undefined, height: number | undefined;
    if (attachment.type === 'image' || attachment.type === 'gifv' || attachment.type === 'video') {
      width = (attachment.meta?.original?.width);
      height = (attachment.meta?.original?.height);
    }

    const link = (status && (
      <Link to='/@{$username}/posts/$statusId' params={{ username: status.account.acct, statusId: status.id }}>
        <FormattedMessage id='lightbox.view_context' defaultMessage='View context' />
      </Link>
    ));

    if (attachment.type === 'image') {
      return (
        <ZoomableImage
          blurhash={attachment.blurhash || undefined}
          src={attachment.url}
          width={width!}
          height={height!}
          alt={attachment.description}
          key={attachment.url}
          lang={props.lang}
          onClick={toggleNavigation}
          onDoubleClick={handleZoomClick}
          onClose={onClose}
          onZoomChange={setZoomedIn}
          zoomedIn={zoomedIn && i === index}
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
          autoFocus={i === index}
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
          poster={attachment.preview_url !== attachment.url ? attachment.preview_url : (status?.account.avatar_static) as string | undefined}
          backgroundColor={attachment.meta.colors?.background as string | undefined}
          foregroundColor={attachment.meta.colors?.foreground as string | undefined}
          accentColor={attachment.meta.colors?.accent as string | undefined}
          duration={attachment.meta.original?.duration || 0}
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
  });

  // Load data.
  useEffect(() => {
    if (status?.id) {
      dispatch(fetchStatusWithContext(status.id, intl)).then(() => {
        setIsLoaded(true);
      }).catch(() => {
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
      return (
        <MissingIndicator />
      );
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
    <div className='⁂-media-modal media-modal pointer-events-auto fixed inset-0 z-[9999] h-full bg-gray-900/90'>
      <div
        className='absolute inset-0'
        role='presentation'
      >
        <Stack
          onClick={handleClickOutside}
          className={
            clsx('⁂-media-modal__content fixed inset-0 h-full grow transition-all', {
              'xl:pr-96': !isFullScreen,
              'xl:pr-0': isFullScreen,
            })
          }
          justifyContent='between'
          ref={handleRef}
        >
          <HStack
            alignItems='center'
            justifyContent='between'
            className={clsx('flex-[0_0_60px] p-4 transition-opacity', navigationHiddenClassName)}
          >
            <IconButton
              title={intl.formatMessage(messages.close)}
              src={require('@phosphor-icons/core/regular/x.svg')}
              onClick={() => onClose('MEDIA')}
              theme='dark'
              className='!p-1.5 hover:scale-105 hover:bg-gray-900'
              iconClassName='h-5 w-5'
            />

            <HStack alignItems='center' space={2}>
              {zoomable && (
                <IconButton
                  title={intl.formatMessage(zoomedIn ? messages.zoomOut : messages.zoomIn)}
                  src={zoomedIn ? require('@phosphor-icons/core/regular/magnifying-glass-minus.svg') : require('@phosphor-icons/core/regular/magnifying-glass-plus.svg')}
                  theme='dark'
                  className='!p-1.5 hover:scale-105 hover:bg-gray-900'
                  iconClassName='h-5 w-5'
                  onClick={handleZoomClick}
                />
              )}

              <IconButton
                src={require('@phosphor-icons/core/regular/download-simple.svg')}
                theme='dark'
                className='!p-1.5 hover:scale-105 hover:bg-gray-900'
                iconClassName='h-5 w-5'
                onClick={handleDownload}
              />

              {status && (
                <IconButton
                  src={isFullScreen ? require('@phosphor-icons/core/regular/arrows-in-simple.svg') : require('@phosphor-icons/core/regular/arrows-out-simple.svg')}
                  title={intl.formatMessage(isFullScreen ? messages.minimize : messages.expand)}
                  theme='dark'
                  className='hidden !p-1.5 hover:scale-105 hover:bg-gray-900 xl:block'
                  iconClassName='h-5 w-5'
                  onClick={() => setIsFullScreen(!isFullScreen)}
                />
              )}
            </HStack>
          </HStack>

          {/* Height based on height of top/bottom bars */}
          <div
            className='relative h-[calc(100vh-120px)] w-full grow'
          >
            {hasMultipleImages && (
              <div className={clsx('absolute inset-y-0 left-5 z-10 flex items-center transition-opacity', navigationHiddenClassName)}>
                <button
                  tabIndex={0}
                  className='flex size-10 items-center justify-center rounded-full bg-gray-900 text-white'
                  onClick={handlePrevClick}
                  aria-label={intl.formatMessage(messages.previous)}
                >
                  <Icon src={require('@phosphor-icons/core/regular/arrow-left.svg')} className='size-5' />
                </button>
              </div>
            )}

            <ReactSwipeableViews
              style={swipeableViewsStyle}
              containerStyle={containerStyle}
              onChangeIndex={handleSwipe}
              index={index}
            >
              {content}
            </ReactSwipeableViews>

            {hasMultipleImages && (
              <div className={clsx('absolute inset-y-0 right-5 z-10 flex items-center transition-opacity', navigationHiddenClassName)}>
                <button
                  tabIndex={0}
                  className='flex size-10 items-center justify-center rounded-full bg-gray-900 text-white'
                  onClick={handleNextClick}
                  aria-label={intl.formatMessage(messages.next)}
                >
                  <Icon src={require('@phosphor-icons/core/regular/arrow-right.svg')} className='size-5' />
                </button>
              </div>
            )}
          </div>

          {status && (
            <HStack
              justifyContent='center'
              className={clsx('flex-[0_0_60px] transition-opacity', navigationHiddenClassName)}
            >
              <StatusActionBar
                status={status}
                space='md'
                expandable
              />
            </HStack>
          )}
        </Stack>

        {status && (
          <div
            className={
              clsx('-right-96 hidden bg-white transition-all xl:fixed xl:inset-y-0 xl:right-0 xl:flex xl:w-96 xl:flex-col', {
                'xl:!-right-96': isFullScreen,
              })
            }
          >
            <Thread
              status={status}
              withMedia={false}
              itemClassName='px-4'
              isModal
            />
          </div>
        )}
      </div>
    </div>
  );
};

export { type MediaModalProps, MediaModal as default };
