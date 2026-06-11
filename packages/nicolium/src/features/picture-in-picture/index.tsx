import React, { useCallback } from 'react';

import Audio from '@/components/media/audio';
import Video from '@/components/media/video';
import StatusActionBar from '@/components/statuses/status-action-bar';
import { useStatus } from '@/queries/statuses/use-status';
import { usePictureInPicture, usePictureInPictureActions } from '@/stores/picture-in-picture';

import Header from './components/header';

const PictureInPicture: React.FC = () => {
  const { removePictureInPicture } = usePictureInPictureActions();
  const pipState = usePictureInPicture();

  const handleClose = useCallback(() => {
    removePictureInPicture();
  }, [removePictureInPicture]);

  const { data: status } = useStatus(pipState?.statusId);

  if (pipState.type === null || !pipState.src) {
    return null;
  }

  const {
    type,
    src,
    currentTime,
    accountId,
    statusId,
    volume,
    muted,
    poster,
    backgroundColor,
    foregroundColor,
    accentColor,
  } = pipState;

  let player;

  switch (type) {
    case 'video':
      player = (
        <Video
          src={src}
          startTime={currentTime}
          startVolume={volume}
          startMuted={muted}
          startPlaying
          alwaysVisible
        />
      );
      break;
    case 'audio':
      player = (
        <Audio
          src={src}
          currentTime={currentTime}
          volume={volume}
          muted={muted}
          autoPlay
          poster={poster}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          accentColor={accentColor}
        />
      );
      break;
  }

  return (
    <div className='picture-in-picture'>
      <Header accountId={accountId!} statusId={statusId!} onClose={handleClose} />

      {player}

      {status && (
        <div className='picture-in-picture__footer'>
          <StatusActionBar status={status} />
        </div>
      )}
    </div>
  );
};

export { PictureInPicture as default };
