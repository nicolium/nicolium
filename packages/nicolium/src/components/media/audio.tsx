import clsx from 'clsx';
import { debounce } from 'lodash-es';
import { throttle } from 'lodash-es';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { useMediaPlayer } from '@/hooks/use-media-player';
import { useSettings } from '@/stores/settings';

import { breakpoints } from '../ui/layout';

import { PlayerButtons, PlayerTime, SeekBar } from './player-controls';
import Visualizer from './visualizer';

const TICK_SIZE = 10;
const PADDING = 180;

interface IAudio {
  src: string;
  alt?: string;
  poster?: string;
  duration?: number;
  width?: number;
  height?: number;
  fullscreen?: boolean;
  cacheWidth?: (width: number) => void;
  backgroundColor?: string;
  foregroundColor?: string;
  accentColor?: string;
  currentTime?: number;
  autoPlay?: boolean;
  volume?: number;
  muted?: boolean;
  deployPictureInPicture?: (type: string, opts: Record<string, any>) => void;
}

const Audio: React.FC<IAudio> = (props) => {
  const {
    src,
    alt = '',
    poster,
    accentColor,
    backgroundColor,
    foregroundColor,
    cacheWidth,
    fullscreen,
    autoPlay,
    deployPictureInPicture = false,
  } = props;

  const { useSystemMediaControls } = useSettings();

  const [width, setWidth] = useState<number | undefined>(props.width);
  const [height, setHeight] = useState<number | undefined>(props.height);
  const [duration, setDuration] = useState(0);
  const [paused, setPaused] = useState(true);

  const visualizer = useRef<Visualizer>(new Visualizer(TICK_SIZE));
  const audioContext = useRef<AudioContext | null>(null);

  const player = useRef<HTMLDivElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  const togglePlay = () => {
    if (!audioContext.current) {
      _initAudioContext();
    }

    if (paused) {
      audio.current?.play();
    } else {
      audio.current?.pause();
    }

    setPaused(!paused);
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
    toggleMute,
    handleProgress,
    handleVolumeChange,
    handleVolumeMouseDown,
    handleSeekMouseDown,
    handleKeyDown,
  } = useMediaPlayer(audio, player, togglePlay, { seekThrottle: 15, alwaysResumeAfterSeek: true });

  const _pack = () => ({
    src: props.src,
    volume: audio.current?.volume,
    muted: audio.current?.muted,
    currentTime: audio.current?.currentTime,
    poster: props.poster,
    backgroundColor: props.backgroundColor,
    foregroundColor: props.foregroundColor,
    accentColor: props.accentColor,
  });

  const _setDimensions = () => {
    if (player.current) {
      const width = player.current.offsetWidth;
      const height = fullscreen ? player.current.offsetHeight : width / (16 / 9);

      if (cacheWidth) {
        cacheWidth(width);
      }

      setWidth(width);
      setHeight(height);
    }
  };

  const handleResize = debounce(
    () => {
      if (player.current) {
        _setDimensions();
      }
    },
    250,
    {
      trailing: true,
    },
  );

  const handlePlay = () => {
    setPaused(false);

    if (audioContext.current?.state === 'suspended') {
      audioContext.current?.resume();
    }

    _renderCanvas();
  };

  const handlePause = () => {
    setPaused(true);
    audioContext.current?.suspend();
  };

  const handleTimeUpdate = () => {
    if (audio.current) {
      setCurrentTime(audio.current.currentTime);
      setDuration(audio.current.duration);
    }
  };

  const handleScroll = useCallback(
    throttle(
      () => {
        if (!canvas.current || !audio.current) {
          return;
        }

        const { top, height } = canvas.current.getBoundingClientRect();
        const inView =
          top <= (window.innerHeight || document.documentElement.clientHeight) && top + height >= 0;

        if (!audio.current.paused && !inView) {
          audio.current.pause();

          if (
            deployPictureInPicture &&
            window.matchMedia(`(min-width: ${breakpoints.sm})`).matches
          ) {
            deployPictureInPicture('audio', _pack());
          }

          setPaused(true);
        }
      },
      150,
      { trailing: true },
    ),
    [canvas.current, audio.current],
  );

  const handleLoadedData = () => {
    if (audio.current) {
      setDuration(audio.current.duration);

      if (props.currentTime) {
        audio.current.currentTime = props.currentTime;
      }

      if (props.volume !== undefined) {
        audio.current.volume = props.volume;
      }

      if (props.muted !== undefined) {
        audio.current.muted = props.muted;
      }

      if (autoPlay) {
        togglePlay();
      }
    }
  };

  const _initAudioContext = () => {
    if (audio.current) {
      // @ts-expect-error
      // eslint-disable-next-line compat/compat
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContext();
      const source = context.createMediaElementSource(audio.current);

      visualizer.current.setAudioContext(context, source);
      source.connect(context.destination);

      audioContext.current = context;
    }
  };

  const _renderCanvas = () => {
    // eslint-disable-next-line compat/compat
    requestAnimationFrame(() => {
      if (!audio.current) return;

      handleTimeUpdate();
      _clear();
      _draw();

      if (!paused) {
        _renderCanvas();
      }
    });
  };

  const _clear = () => {
    visualizer.current?.clear(width ?? 0, height ?? 0);
  };

  const _draw = () => {
    visualizer.current?.draw(
      _getCX(),
      _getCY(),
      _getAccentColor() ?? '#ffffff',
      _getRadius(),
      _getScaleCoefficient(),
    );
  };

  const _getRadius = (): number =>
    ((height ?? props.height ?? 0) - PADDING * _getScaleCoefficient() * 2) / 2;

  const _getScaleCoefficient = (): number => (height ?? props.height ?? 0) / 982;

  const _getCX = (): number => Math.floor((width ?? 0) / 2);

  const _getCY = (): number => Math.floor(_getRadius() + PADDING * _getScaleCoefficient());

  const _getAccentColor = () => accentColor ?? undefined;

  const _getBackgroundColor = (): string => backgroundColor ?? '#000000';

  const _getForegroundColor = (): string => foregroundColor ?? '#ffffff';

  const handleAudioKeyDown: React.KeyboardEventHandler = (e) => {
    // On the audio element or the seek bar, we can safely use the space bar
    // for playback control because there are no buttons to press

    if (e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      togglePlay();
    }
  };

  const getDuration = () => duration ?? props.duration ?? 0;

  const progress = Math.min((currentTime / getDuration()) * 100, 100);

  useLayoutEffect(() => {
    if (player.current) {
      _setDimensions();
    }
  }, []);

  useEffect(() => {
    if (canvas.current && visualizer.current) {
      visualizer.current.setCanvas(canvas.current);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);

      if (
        !paused &&
        audio.current &&
        deployPictureInPicture &&
        window.matchMedia(`(min-width: ${breakpoints.sm})`).matches
      ) {
        deployPictureInPicture('audio', _pack());
      }
    };
  }, []);

  useEffect(() => {
    if (!useSystemMediaControls) {
      _clear();
      _draw();
    }
  }, [src, width, height, accentColor, useSystemMediaControls]);

  return (
    <div
      className={clsx('video-player video-player--audio', {
        'video-player--fullscreen': fullscreen,
        'video-player--system-controls': useSystemMediaControls,
      })}
      ref={player}
      style={{
        backgroundColor: _getBackgroundColor(),
        color: _getForegroundColor(),
        width: '100%',
        height: fullscreen && !useSystemMediaControls ? '100%' : undefined,
        aspectRatio: fullscreen || useSystemMediaControls ? undefined : '16 / 9',
      }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <audio
        src={src}
        ref={audio}
        preload='auto'
        onPlay={handlePlay}
        onPause={handlePause}
        onProgress={handleProgress}
        onVolumeChange={handleVolumeChange}
        onLoadedData={handleLoadedData}
        crossOrigin='anonymous'
        controls={useSystemMediaControls}
        className='video-player__audio-controls'
      />

      {!useSystemMediaControls && (
        <>
          <canvas
            role='button'
            tabIndex={0}
            className='video-player__canvas'
            width={width}
            height={height}
            ref={canvas}
            onClick={togglePlay}
            onKeyDown={handleAudioKeyDown}
            title={alt}
            aria-label={alt}
          />

          {poster && (
            <img
              src={poster}
              alt=''
              className='video-player__poster'
              width={(_getRadius() - TICK_SIZE) * 2}
              height={(_getRadius() - TICK_SIZE) * 2}
              style={{
                left: _getCX(),
                top: _getCY(),
              }}
            />
          )}

          <SeekBar
            ref={seek}
            buffer={buffer}
            progress={progress}
            dragging={dragging}
            accentColor={accentColor}
            onMouseDown={handleSeekMouseDown}
            onKeyDown={handleAudioKeyDown}
          />

          <div className='video-player__controls video-player__controls--visible'>
            <PlayerButtons
              src={src}
              paused={paused}
              muted={muted}
              volume={volume}
              accentColor={accentColor}
              togglePlay={togglePlay}
              toggleMute={toggleMute}
              onVolumeMouseDown={handleVolumeMouseDown}
              volumeSlider={slider}
            >
              <PlayerTime currentTime={currentTime} duration={duration} />
            </PlayerButtons>
          </div>
        </>
      )}
    </div>
  );
};

export { Audio as default };
