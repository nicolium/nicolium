import clsx from 'clsx';
import { FastAverageColor } from 'fast-average-color';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import StillImage, { IStillImage } from 'pl-fe/components/still-image';

import Icon from './icon';

const AVATAR_SIZE = 42;

const messages = defineMessages({
  avatar: { id: 'account.avatar.alt', defaultMessage: 'Avatar' },
});

interface IAvatar extends Pick<IStillImage, 'alt' | 'src' | 'onError' | 'className'> {
  /** Width and height of the avatar in pixels. */
  size?: number;
  /** Whether the user is a cat. */
  isCat?: boolean;
}

const fac = new FastAverageColor();

/** Round profile avatar for accounts. */
const Avatar = (props: IAvatar) => {
  const intl = useIntl();

  const { alt, src, size = AVATAR_SIZE, className, isCat } = props;

  const [color, setColor] = useState<string | undefined>(undefined);
  const [isAvatarMissing, setIsAvatarMissing] = useState<boolean>(false);

  const handleLoadFailure = () => setIsAvatarMissing(true);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const color = fac.getColor(e.currentTarget);
    if (!color.error) {
      setColor(color.hex);
    }
  };

  const style: React.CSSProperties = React.useMemo(() => ({
    width: size,
    height: size,
    fontSize: size,
    color,
  }), [size, color]);

  if (isAvatarMissing) {
    return (
      <div
        style={{
          width: size,
          height: size,
          color,
        }}
        className={clsx('flex items-center justify-center rounded-lg bg-gray-200 leading-[0] dark:bg-gray-900', isCat && 'avatar__cat', className)}
      >
        <Icon
          src={require('@tabler/icons/outline/photo-off.svg')}
          className='size-4 text-gray-500 dark:text-gray-700'
        />
      </div>
    );
  }

  return (
    <StillImage
      className={clsx('rounded-lg leading-[0]', isCat && 'avatar__cat', className)}
      innerClassName='rounded-lg'
      style={style}
      src={src}
      alt={alt || intl.formatMessage(messages.avatar)}
      onError={handleLoadFailure}
      onLoad={handleLoad}
    />
  );
};

export { Avatar as default };
