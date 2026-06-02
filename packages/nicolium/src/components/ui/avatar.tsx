import iconImageSquare from '@phosphor-icons/core/regular/image-square.svg';
import clsx from 'clsx';
import { FastAverageColor } from 'fast-average-color';
import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import missingAvatar from '@/assets/images/avatar-missing.png';
import StillImage, { type IStillImage } from '@/components/still-image';
import { useSettings } from '@/stores/settings';

import AltPopover from '../media/alt-popover';

import Icon from './icon';

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
      minWidth: value,
      height: value,
      fontSize: value,
      color,
    };
  }, [size, color]);

  if (disableUserProvidedMedia) {
    if (isAvatarMissing || !alt || isDefault) return null;
    return (
      <AltPopover
        alt={alt}
        heading={
          <FormattedMessage id='account.avatar.description' defaultMessage='Avatar description' />
        }
        message={<FormattedMessage id='account.avatar.alt' defaultMessage='Avatar' />}
        className='avatar__alt-indicator'
      />
    );
  }

  if (isAvatarMissing) {
    return (
      <div
        style={style}
        className={clsx('avatar avatar--missing', isCat && 'avatar--cat', className)}
      >
        <div className='avatar__placeholder'>
          <Icon src={iconImageSquare} />
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
      className={clsx('avatar', isCat && 'avatar--cat', className)}
      style={style}
      src={src || missingAvatar}
      alt={altText}
      onError={handleLoadFailure}
    />
  );
};

export { Avatar as default };
