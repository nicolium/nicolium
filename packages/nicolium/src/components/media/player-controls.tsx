import iconDownloadSimple from '@phosphor-icons/core/regular/download-simple.svg';
import iconPause from '@phosphor-icons/core/regular/pause.svg';
import iconPlay from '@phosphor-icons/core/regular/play.svg';
import iconSpeakerHigh from '@phosphor-icons/core/regular/speaker-high.svg';
import iconSpeakerX from '@phosphor-icons/core/regular/speaker-x.svg';
import clsx from 'clsx';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Icon from '@/components/ui/icon';
import { formatTime } from '@/utils/media';

const messages = defineMessages({
  play: { id: 'video.play', defaultMessage: 'Play' },
  pause: { id: 'video.pause', defaultMessage: 'Pause' },
  mute: { id: 'video.mute', defaultMessage: 'Mute sound' },
  unmute: { id: 'video.unmute', defaultMessage: 'Unmute sound' },
  download: { id: 'video.download', defaultMessage: 'Download file' },
});

interface ISeekBar {
  buffer: number;
  progress: number;
  dragging: boolean;
  accentColor?: string;
  onMouseDown: React.MouseEventHandler;
  onKeyDown: React.KeyboardEventHandler;
}

const SeekBar = React.forwardRef<HTMLDivElement, ISeekBar>(
  ({ buffer, progress, dragging, accentColor, onMouseDown, onKeyDown }, ref) => (
    <div className='video-player__seek' onMouseDown={onMouseDown} ref={ref}>
      <div className='video-player__seek__buffer' style={{ width: `${buffer}%` }} />

      <div
        className='video-player__seek__progress'
        style={{ width: `${progress}%`, backgroundColor: accentColor }}
      />

      <span
        className={clsx('video-player__seek__handle', {
          'video-player__seek__handle--active': dragging,
        })}
        tabIndex={0}
        style={{ left: `${progress}%`, backgroundColor: accentColor }}
        onKeyDown={onKeyDown}
      />
    </div>
  ),
);

SeekBar.displayName = 'SeekBar';

interface IPlayerTime {
  currentTime: number;
  duration: number;
}

const PlayerTime: React.FC<IPlayerTime> = ({ currentTime, duration }) => (
  <span className='video-player__time'>
    <span className='video-player__time__value'>{formatTime(Math.floor(currentTime))}</span>
    {!!duration && (
      <>
        <span className='video-player__time__separator'>/</span>
        <span className='video-player__time__value'>{formatTime(Math.floor(duration))}</span>
      </>
    )}
  </span>
);

interface IPlayerButtons {
  src: string;
  paused: boolean;
  muted: boolean;
  volume: number;
  accentColor?: string;
  autoFocus?: boolean;
  togglePlay: (e?: React.MouseEvent) => void;
  toggleMute: () => void;
  onVolumeMouseDown: React.MouseEventHandler;
  volumeSlider: React.RefObject<HTMLDivElement | null>;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}

const PlayerButtons: React.FC<IPlayerButtons> = ({
  src,
  paused,
  muted,
  volume,
  accentColor,
  autoFocus,
  togglePlay,
  toggleMute,
  onVolumeMouseDown,
  volumeSlider,
  children,
  actions,
}) => {
  const intl = useIntl();

  const playLabel = intl.formatMessage(paused ? messages.play : messages.pause);
  const muteLabel = intl.formatMessage(muted ? messages.unmute : messages.mute);
  const downloadLabel = intl.formatMessage(messages.download);

  return (
    <div className='video-player__controls__row'>
      <div className='video-player__buttons'>
        <button
          type='button'
          title={playLabel}
          aria-label={playLabel}
          className='video-player__button'
          onClick={togglePlay}
          autoFocus={autoFocus}
        >
          <Icon src={paused ? iconPlay : iconPause} />
        </button>

        <button
          type='button'
          title={muteLabel}
          aria-label={muteLabel}
          className='video-player__button'
          onClick={toggleMute}
        >
          <Icon src={muted ? iconSpeakerX : iconSpeakerHigh} />
        </button>

        <div className='video-player__volume' onMouseDown={onVolumeMouseDown} ref={volumeSlider}>
          <div
            className='video-player__volume__current'
            style={{ width: `${volume * 100}%`, backgroundColor: accentColor }}
          />
          <span
            className='video-player__volume__handle'
            tabIndex={0}
            style={{ left: `${volume * 100}%`, backgroundColor: accentColor }}
          />
        </div>

        {children}
      </div>

      <div className='video-player__buttons'>
        <a
          title={downloadLabel}
          aria-label={downloadLabel}
          className='video-player__button'
          href={src}
          download
          target='_blank'
          rel='noopener noreferrer'
        >
          <Icon src={iconDownloadSimple} />
        </a>
        {actions}
      </div>
    </div>
  );
};

export { PlayerButtons, PlayerTime, SeekBar };
