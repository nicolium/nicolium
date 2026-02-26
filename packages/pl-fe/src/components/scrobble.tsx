import clsx from 'clsx';
import React, { useMemo, useRef } from 'react';
import { FormattedMessage } from 'react-intl';

import HStack from '@/components/ui/hstack';
import Icon from '@/components/ui/icon';
import Text from '@/components/ui/text';

import type { MinifiedScrobble } from '@/queries/accounts/account-scrobble';

interface IScrobble {
  scrobble: MinifiedScrobble;
}

const Scrobble: React.FC<IScrobble> = ({ scrobble }) => {
  const textRef = useRef<HTMLParagraphElement>(null);

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
    <HStack alignItems='center' space={0.5}>
      <Icon
        src={require('@phosphor-icons/core/regular/music-notes-simple.svg')}
        className='size-4 text-gray-800 dark:text-gray-200'
      />

      <div className='relative box-border w-full overflow-hidden whitespace-nowrap'>
        <Text
          size='sm'
          className={clsx('relative inline-block', {
            'animate-text-overflow': animate,
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
    </HStack>
  );
};

export { Scrobble as default };
