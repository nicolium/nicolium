import clsx from 'clsx';
import { FastAverageColor } from 'fast-average-color';
import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import StillImage, { type IStillImage } from '@/components/still-image';
import { useSettings } from '@/stores/settings';

import AltIndicator from '../media/alt-indicator';

import Icon from './icon';
import Popover from './popover';
import Text from './text';

const COLOR_CACHE = new Map<string, string>();

const AVATAR_SIZE = 42;

const messages = defineMessages({
  avatar: { id: 'account.avatar.alt', defaultMessage: 'Avatar' },
  avatarWithUsername: {
    id: 'account.avatar.with_username',
    defaultMessage: 'Avatar for {username}',
  },
  avatarWithContent: {
    id: 'account.avatar.with_content',
    defaultMessage: 'Avatar for {username}: {alt}',
  },
});

interface IAvatar extends Pick<IStillImage, 'alt' | 'src' | 'staticSrc' | 'onError' | 'className'> {
  /** Width and height of the avatar in pixels. */
  size?: number;
  /** Whether the user is a cat. */
  isCat?: boolean;
  username?: string;
  showAlt?: boolean;
  isDefault?: boolean;
}

const fac = new FastAverageColor();

/** Round profile avatar for accounts. */
const Avatar: React.FC<IAvatar> = (props) => {
  const intl = useIntl();
  const { disableUserProvidedMedia } = useSettings();

  const { alt, src, size = AVATAR_SIZE, className, isCat, isDefault } = props;

  const [color, setColor] = useState<string | undefined>(undefined);
  const [isAvatarMissing, setIsAvatarMissing] = useState(false);

  const handleLoadFailure = () => {
    setIsAvatarMissing(true);
  };

  useEffect(() => {
    if (!isCat) return;

    if (COLOR_CACHE.has(src)) {
      setColor(COLOR_CACHE.get(src));
      return;
    }

    fac
      .getColorAsync(src)
      .then((color) => {
        if (!color.error) {
          COLOR_CACHE.set(src, color.hex);
          setColor(color.hex);
        }
      })
      .catch(() => {
        setColor(undefined);
      });
  }, [src, isCat]);

  const style: React.CSSProperties = React.useMemo(() => {
    const value = `${size / 16}rem`;
    return {
      width: value,
      height: value,
      fontSize: value,
      color,
    };
  }, [size, color]);

  if (disableUserProvidedMedia) {
    if (isAvatarMissing || !alt || isDefault) return null;
    return (
      <Popover
        interaction='hover'
        referenceElementClassName='cursor-pointer'
        content={
          <div className='flex max-h-[32rem] max-w-96 flex-col gap-1 overflow-auto p-4'>
            <Text weight='semibold'>
              <FormattedMessage
                id='account.avatar.description'
                defaultMessage='Avatar description'
              />
            </Text>
            <Text className='whitespace-pre-wrap'>{alt}</Text>
          </div>
        }
        isFlush
      >
        <AltIndicator
          message={<FormattedMessage id='account.avatar.alt' defaultMessage='Avatar' />}
        />
      </Popover>
    );
  }

  if (isAvatarMissing) {
    return (
      <div
        style={style}
        className={clsx(
          'relative rounded-lg bg-gray-200 dark:bg-gray-900',
          isCat && '⁂-avatar__cat',
          className,
        )}
      >
        <div className='absolute inset-0 z-[1] flex items-center justify-center rounded-[inherit] bg-gray-200 dark:bg-gray-900'>
          <Icon
            src={require('@phosphor-icons/core/regular/image-square.svg')}
            className='size-4 text-gray-500 dark:text-gray-700'
          />
        </div>
      </div>
    );
  }

  const altText =
    props.showAlt && alt
      ? intl.formatMessage(messages.avatarWithContent, { username: props.username, alt })
      : props.username
        ? intl.formatMessage(messages.avatarWithUsername, { username: props.username })
        : intl.formatMessage(messages.avatar);

  return (
    <StillImage
      className={clsx('⁂-avatar', isCat && '⁂-avatar--cat', className)}
      style={style}
      src={src || require('@/assets/images/avatar-missing.png')}
      alt={altText}
      onError={handleLoadFailure}
    />
  );
};

export { Avatar as default };
