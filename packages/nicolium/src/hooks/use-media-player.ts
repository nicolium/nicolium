import { throttle } from 'lodash-es';
import { useCallback, useEffect, useRef, useState } from 'react';

import { isFullscreen, requestFullscreen, exitFullscreen } from '@/utils/fullscreen';
import { getPointerPosition } from '@/utils/media';

interface UseMediaPlayerOptions {
  seekThrottle: number;
  roundSeekTime?: boolean;
  alwaysResumeAfterSeek?: boolean;
  allowFullscreen?: boolean;
}

const useMediaPlayer = <T extends HTMLMediaElement>(
  media: React.RefObject<T | null>,
  player: React.RefObject<HTMLDivElement | null>,
  togglePlay: () => void,
  { seekThrottle, roundSeekTime, alwaysResumeAfterSeek, allowFullscreen }: UseMediaPlayerOptions,
) => {
  const seek = useRef<HTMLDivElement>(null);
  const slider = useRef<HTMLDivElement>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [buffer, setBuffer] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (media.current) {
      setVolume(media.current.volume);
      setMuted(media.current.muted);
    }

    if (allowFullscreen) {
      const handleFullscreenChange = () => {
        setFullscreen(isFullscreen());
      };

      document.addEventListener('fullscreenchange', handleFullscreenChange, true);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange, true);
      document.addEventListener('mozfullscreenchange', handleFullscreenChange, true);
      document.addEventListener('MSFullscreenChange', handleFullscreenChange, true);

      return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange, true);
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange, true);
        document.removeEventListener('mozfullscreenchange', handleFullscreenChange, true);
        document.removeEventListener('MSFullscreenChange', handleFullscreenChange, true);
      };
    }
  }, [allowFullscreen]);

  const handleProgress = () => {
    if (media.current) {
      const lastTimeRange = media.current.buffered.length - 1;

      if (lastTimeRange > -1) {
        setBuffer((media.current.buffered.end(lastTimeRange) / media.current.duration) * 100);
      }
    }
  };

  const handleVolumeChange = () => {
    if (media.current) {
      setVolume(media.current.volume);
      setMuted(media.current.muted);
    }
  };

  const toggleMute = () => {
    if (media.current) {
      const nextMuted = !media.current.muted;
      const nextVolume = nextMuted ? 0 : 1;

      setVolume(nextVolume);
      setMuted(nextMuted);

      media.current.muted = nextMuted;
      media.current.volume = nextVolume;
    }
  };

  const toggleFullscreen = () => {
    if (isFullscreen()) {
      exitFullscreen();
    } else if (player.current) {
      requestFullscreen(player.current);
    }
  };

  const seekBy = (time: number) => {
    if (media.current) {
      const currentTime = media.current.currentTime + time;

      if (!isNaN(currentTime)) {
        setCurrentTime(currentTime);
        media.current.currentTime = currentTime;
      }
    }
  };

  const handleVolumeSlide = useCallback(
    throttle((e) => {
      if (media.current && slider.current) {
        const { x } = getPointerPosition(slider.current, e);

        if (!isNaN(x)) {
          const volume = Math.max(0, Math.min(1, x));

          setVolume(volume);
          setMuted(volume === 0);
          media.current.volume = volume;
          media.current.muted = volume === 0;
        }
      }
    }, 60),
    [media.current, slider.current],
  );

  const handleSeekSlide = useCallback(
    throttle((e) => {
      if (media.current && seek.current) {
        const { x } = getPointerPosition(seek.current, e);
        const time = media.current.duration * x;
        const currentTime = roundSeekTime ? Math.floor(time) : time;

        if (!isNaN(currentTime)) {
          setCurrentTime(currentTime);
          media.current.currentTime = currentTime;
        }
      }
    }, seekThrottle),
    [media.current, seek.current],
  );

  const startDrag = (
    e: React.MouseEvent,
    onMove: (e: MouseEvent | TouchEvent) => void,
    onEnd?: () => void,
  ) => {
    const handleEnd = () => {
      document.removeEventListener('mousemove', onMove, true);
      document.removeEventListener('mouseup', handleEnd, true);
      document.removeEventListener('touchmove', onMove, true);
      document.removeEventListener('touchend', handleEnd, true);

      onEnd?.();
    };

    document.addEventListener('mousemove', onMove, true);
    document.addEventListener('mouseup', handleEnd, true);
    document.addEventListener('touchmove', onMove, true);
    document.addEventListener('touchend', handleEnd, true);

    onMove(e.nativeEvent);

    e.preventDefault();
    e.stopPropagation();
  };

  const handleVolumeMouseDown: React.MouseEventHandler = (e) => {
    startDrag(e, handleVolumeSlide);
  };

  const handleSeekMouseDown: React.MouseEventHandler = (e) => {
    const wasPlaying = !media.current?.paused;

    setDragging(true);
    media.current?.pause();

    startDrag(e, handleSeekSlide, () => {
      setDragging(false);
      if (wasPlaying || alwaysResumeAfterSeek) media.current?.play();
    });
  };

  const handleKeyDown: React.KeyboardEventHandler = (e) => {
    const frameTime = 1 / 25;

    switch (e.key) {
      case 'k':
        e.preventDefault();
        e.stopPropagation();
        togglePlay();
        break;
      case 'm':
        e.preventDefault();
        e.stopPropagation();
        toggleMute();
        break;
      case 'f':
        if (allowFullscreen) {
          e.preventDefault();
          e.stopPropagation();
          toggleFullscreen();
        }
        break;
      case 'j':
        e.preventDefault();
        e.stopPropagation();
        seekBy(-10);
        break;
      case 'l':
        e.preventDefault();
        e.stopPropagation();
        seekBy(10);
        break;
      case ',':
        e.preventDefault();
        e.stopPropagation();
        seekBy(-frameTime);
        break;
      case '.':
        e.preventDefault();
        e.stopPropagation();
        seekBy(frameTime);
        break;
    }

    // If we are in fullscreen mode, we don't want any hotkeys
    // interacting with the UI that's not visible
    if (allowFullscreen && fullscreen) {
      e.preventDefault();
      e.stopPropagation();

      if (e.key === 'Escape') {
        exitFullscreen();
      }
    }
  };

  return {
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
  };
};

export { useMediaPlayer };
