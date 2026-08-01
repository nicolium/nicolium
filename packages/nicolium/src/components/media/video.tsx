import iconArrowsInSimple from '@phosphor-icons/core/regular/arrows-in-simple.svg';
import iconArrowsOutSimple from '@phosphor-icons/core/regular/arrows-out-simple.svg';
import clsx from 'clsx';
import { debounce } from 'lodash-es';
import { throttle } from 'lodash-es';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Blurhash from '@/components/media/blurhash';
import Icon from '@/components/ui/icon';
import { useMediaPlayer } from '@/hooks/use-media-player';
import { useSettings } from '@/stores/settings';
import {
  isPanoramic,
  isPortrait,
  minimumAspectRatio,
  maximumAspectRatio,
} from '@/utils/media-aspect-ratio';

import { breakpoints } from '../ui/layout';

import { PlayerButtons, PlayerTime, SeekBar } from './player-controls';

const DEFAULT_HEIGHT = 300;

const messages = defineMessages({
  fullscreen: { id: 'video.fullscreen', defaultMessage: 'Full screen' },
  exitFullscreen: { id: 'video.exit_fullscreen', defaultMessage: 'Exit full screen' },
});

interface IVideo {
  preview?: string;
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  startTime?: number;
  detailed?: boolean;
  autoFocus?: boolean;
  inline?: boolean;
  cacheWidth?: (width: number) => void;
  visible?: boolean;
  blurhash?: string | null;
  link?: React.ReactNode;
  aspectRatio?: number;
  displayMedia?: string;
  startVolume?: number;
  startMuted?: boolean;
  startPlaying?: boolean;
  alwaysVisible?: boolean;
  deployPictureInPicture?: (type: string, opts: Record<string, any>) => void;
}

const Video: React.FC<IVideo> = ({
  width,
  visible = false,
  detailed = false,
  autoFocus = false,
  cacheWidth,
  startTime,
  src,
  height,
  alt,
  inline,
  aspectRatio = 16 / 9,
  link,
  blurhash,
  startVolume,
  startMuted,
  startPlaying,
  alwaysVisible = false,
  deployPictureInPicture,
}) => {
  const intl = useIntl();
  const { useSystemMediaControls, disableVideoLooping } = useSettings();

  const player = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  const [duration, setDuration] = useState(0);
  const [paused, setPaused] = useState(true);
  const [containerWidth, setContainerWidth] = useState(width);
  const [hovered, setHovered] = useState(false);

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();

    setPaused(!paused);

    if (paused) {
      video.current?.play();
    } else {
      video.current?.pause();
    }
  };

  const {
    seek,
    slider,
    currentTime,
    setCurrentTime,
    buffer,
    volume,
    muted,
    dragging,
    fullscreen,
    toggleMute,
    toggleFullscreen,
    handleProgress,
    handleVolumeChange,
    handleVolumeMouseDown,
    handleSeekMouseDown,
    handleKeyDown,
  } = useMediaPlayer(video, player, togglePlay, {
    seekThrottle: 60,
    roundSeekTime: true,
    allowFullscreen: true,
  });

  const setDimensions = () => {
    if (player.current) {
      const { offsetWidth } = player.current;

      if (cacheWidth) {
        cacheWidth(offsetWidth);
      }

      setContainerWidth(offsetWidth);
    }
  };

  useLayoutEffect(() => {
    setDimensions();
  }, []);

  const handleClickRoot: React.MouseEventHandler = (e) => {
    e.stopPropagation();
  };

  const handlePlay = () => {
    setPaused(false);
  };

  const handlePause = () => {
    setPaused(true);
  };

  const handleTimeUpdate = () => {
    if (video.current) {
      setCurrentTime(Math.floor(video.current.currentTime));
      setDuration(Math.floor(video.current.duration));
    }
  };

  const handleVideoKeyDown: React.KeyboardEventHandler = (e) => {
    // On the video element or the seek bar, we can safely use the space bar
    // for playback control because there are no buttons to press

    if (e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      togglePlay();
    }
  };

  const handleResize = useCallback(
    debounce(
      () => {
        setDimensions();
      },
      250,
      {
        trailing: true,
      },
    ),
    [player.current, cacheWidth],
  );

  const handleScroll = useCallback(
    throttle(
      () => {
        if (!video.current || alwaysVisible) return;

        const { top, height } = video.current.getBoundingClientRect();
        const inView =
          top <= (window.innerHeight || document.documentElement.clientHeight) && top + height >= 0;

        if (!video.current.paused && !inView) {
          setPaused(true);
          video.current.pause();

          if (
            deployPictureInPicture &&
            window.matchMedia(`(min-width: ${breakpoints.sm})`).matches
          ) {
            deployPictureInPicture('video', _pack());
          }
        }
      },
      150,
      { trailing: true },
    ),
    [video.current, alwaysVisible, deployPictureInPicture],
  );

  const handleMouseEnter = () => {
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  const handleLoadedData = () => {
    if (!video.current) return;

    if (startTime) {
      video.current.currentTime = startTime;
    }

    if (startVolume !== undefined) {
      video.current.volume = startVolume;
    }

    if (startMuted !== undefined) {
      video.current.muted = startMuted;
    }

    if (startTime || startPlaying) {
      video.current.play();
    }
  };

  const _pack = () => ({
    src,
    volume: video.current?.volume,
    muted: video.current?.muted,
    currentTime: video.current?.currentTime,
  });

  const progress = (currentTime / duration) * 100;
  const playerStyle: React.CSSProperties = {};

  if (inline && containerWidth) {
    width = containerWidth;
    const minSize = containerWidth / (16 / 9);

    if (isPanoramic(aspectRatio)) {
      height = Math.max(Math.floor(containerWidth / maximumAspectRatio), minSize);
    } else if (isPortrait(aspectRatio)) {
      height = Math.max(Math.floor(containerWidth / minimumAspectRatio), minSize);
    } else {
      height = Math.floor(containerWidth / aspectRatio);
    }

    playerStyle.height = height || DEFAULT_HEIGHT;
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);

      if (
        video.current &&
        !video.current.paused &&
        deployPictureInPicture &&
        !alwaysVisible &&
        window.matchMedia(`(min-width: ${breakpoints.sm})`).matches
      ) {
        deployPictureInPicture('video', _pack());
      }
    };
  }, []);

  useEffect(() => {
    if (!visible && !alwaysVisible) {
      video.current?.pause();
    }
  }, [visible, alwaysVisible]);

  return (
    <div
      role='menuitem'
      className={clsx('video-player', {
        'video-player--fullscreen': fullscreen,
        'video-player--detailed': detailed,
      })}
      style={playerStyle}
      ref={player}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClickRoot}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {!fullscreen && <Blurhash hash={blurhash} className='media-gallery__preview' />}

      <video
        className={clsx('video-player__video', {
          'video-player__video--contain': inline && !fullscreen,
          'video-player__video--fullscreen': fullscreen,
        })}
        ref={video}
        src={src}
        loop={!disableVideoLooping}
        role='button'
        tabIndex={0}
        aria-label={alt}
        title={alt}
        width={width}
        height={height ?? DEFAULT_HEIGHT}
        onClick={togglePlay}
        onKeyDown={handleVideoKeyDown}
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        onLoadedData={handleLoadedData}
        onProgress={handleProgress}
        onVolumeChange={handleVolumeChange}
        controls={useSystemMediaControls}
      />

      {!useSystemMediaControls && (
        <div
          className={clsx('video-player__controls', {
            'video-player__controls--visible': paused || hovered,
          })}
        >
          <SeekBar
            ref={seek}
            buffer={buffer}
            progress={progress}
            dragging={dragging}
            onMouseDown={handleSeekMouseDown}
            onKeyDown={handleVideoKeyDown}
            currentTime={currentTime}
            duration={duration}
          />

          <PlayerButtons
            src={src}
            paused={paused}
            muted={muted}
            volume={volume}
            autoFocus={autoFocus}
            togglePlay={togglePlay}
            toggleMute={toggleMute}
            onVolumeMouseDown={handleVolumeMouseDown}
            volumeSlider={slider}
            actions={
              <button
                type='button'
                title={intl.formatMessage(
                  fullscreen ? messages.exitFullscreen : messages.fullscreen,
                )}
                aria-label={intl.formatMessage(
                  fullscreen ? messages.exitFullscreen : messages.fullscreen,
                )}
                className='video-player__button'
                onClick={toggleFullscreen}
              >
                <Icon src={fullscreen ? iconArrowsInSimple : iconArrowsOutSimple} />
              </button>
            }
          >
            {(detailed || fullscreen) && (
              <PlayerTime currentTime={currentTime} duration={duration} />
            )}

            {link && <span className='video-player__link'>{link}</span>}
          </PlayerButtons>
        </div>
      )}
    </div>
  );
};

export { Video as default };
