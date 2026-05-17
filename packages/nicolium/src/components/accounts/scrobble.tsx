import iconMusicNotesSimple from '@phosphor-icons/core/regular/music-notes-simple.svg';
import iconNotePencil from '@phosphor-icons/core/regular/note-pencil.svg';
import clsx from 'clsx';
import React, { useMemo, useRef } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Icon from '@/components/ui/icon';
import Text from '@/components/ui/text';
import { useComposeActions } from '@/stores/compose';

import IconButton from '../ui/icon-button';

import type { MinifiedScrobble } from '@/queries/accounts/account-scrobble';

const messages = defineMessages({
  compose: {
    id: 'account.scrobbling.compose',
    defaultMessage: 'Create a #NowPlaying post',
  },
});

interface IScrobble {
  scrobble: MinifiedScrobble;
  withComposeButton?: boolean;
}

const Scrobble: React.FC<IScrobble> = ({ scrobble, withComposeButton }) => {
  const intl = useIntl();
  const { openComposeWithText } = useComposeActions();

  const textRef = useRef<HTMLParagraphElement>(null);

  const handleCompose = () => {
    openComposeWithText(
      'compose-modal',
      `#NowPlaying ${scrobble.artist ? `${scrobble.artist} - ` : ''}${scrobble.title}

${scrobble.external_link ? scrobble.external_link : ''}`.trim(),
    );
  };

  const isRecent = Date.now() - new Date(scrobble.created_at).getTime() <= 60 * 60 * 1000;

  const song = scrobble.artist ? (
    <FormattedMessage
      id='account.scrobbling.title'
      defaultMessage='{title} by {artist}'
      values={{
        title: scrobble.title,
        artist: scrobble.artist,
      }}
    />
  ) : (
    scrobble.title
  );

  const animate = useMemo(
    () =>
      textRef.current &&
      textRef.current.parentElement &&
      textRef.current.clientWidth > textRef.current.parentElement.clientWidth,
    [],
  );

  if (!isRecent) return null;

  return (
    <div className='flex items-center gap-0.5'>
      <Icon src={iconMusicNotesSimple} className='size-4 text-gray-800 dark:text-gray-200' />

      <div className='relative box-border w-full overflow-hidden whitespace-nowrap'>
        <Text
          size='sm'
          className={clsx('relative inline-block', {
            'no-reduce-motion:animate-text-overflow': animate,
          })}
          ref={textRef}
        >
          <FormattedMessage
            id='account.scrobbling'
            defaultMessage='Playing {song}'
            values={{
              song: scrobble.external_link ? (
                <a
                  href={scrobble.external_link}
                  className='underline'
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  rel='nofollow noopener'
                  target='_blank'
                >
                  {song}
                </a>
              ) : (
                song
              ),
            }}
          />
        </Text>
      </div>

      {withComposeButton && (
        <IconButton
          src={iconNotePencil}
          onClick={handleCompose}
          title={intl.formatMessage(messages.compose)}
          className='-m-1'
          iconClassName='h-4 w-4'
        />
      )}
    </div>
  );
};

export { Scrobble as default };
