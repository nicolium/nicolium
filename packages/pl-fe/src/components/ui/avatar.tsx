import clsx from 'clsx';
import { FastAverageColor } from 'fast-average-color';
import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import StillImage, { IStillImage } from 'pl-fe/components/still-image';
import { useSettings } from 'pl-fe/hooks/use-settings';

import AltIndicator from '../alt-indicator';

import Icon from './icon';
import Popover from './popover';
import Stack from './stack';
import Text from './text';

const COLOR_CACHE = new Map<string, string>();

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
  const { disableUserProvidedMedia } = useSettings();

  const { alt, src, size = AVATAR_SIZE, className, isCat } = props;

  const [color, setColor] = useState<string | undefined>(undefined);
  const [isAvatarMissing, setIsAvatarMissing] = useState(false);

  const handleLoadFailure = () => setIsAvatarMissing(true);

  useEffect(() => {
    if (!isCat) return;

    if (COLOR_CACHE.has(src)) {
      setColor(COLOR_CACHE.get(src));
      return;
    }

    fac.getColorAsync(src).then(color => {
      if (!color.error) {
        COLOR_CACHE.set(src, color.hex);
        setColor(color.hex);
      }
    }).catch(() => setColor(undefined));
  }, [src, isCat]);

  const style: React.CSSProperties = React.useMemo(() => ({
    width: size,
    height: size,
    fontSize: size,
    color,
  }), [size, color]);

  if (disableUserProvidedMedia) {
    if (isAvatarMissing || !alt) return null;
    return (
      <Popover
        interaction='hover'
        referenceElementClassName='cursor-pointer'
        content={
          <Stack space={1} className='max-h-[32rem] max-w-96 overflow-auto p-4'>
            <Text weight='semibold'>
              <FormattedMessage id='account.avatar.description' defaultMessage='Avatar description' />
            </Text>
            <Text className='whitespace-pre-wrap'>
              {alt}
            </Text>
          </Stack>
        }
        isFlush
      >
        <AltIndicator message={<FormattedMessage id='account.avatar.alt' defaultMessage='Avatar' />} />
      </Popover>
    );
  }

  if (isAvatarMissing) {
    return (
      <div
        style={style}
        className={clsx('relative rounded-lg bg-gray-200 leading-[0] dark:bg-gray-900', isCat && 'avatar__cat', className)}
      >
        <div className='absolute inset-0 z-[1] flex items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-900'>
          <Icon
            src={require('@tabler/icons/outline/photo-off.svg')}
            className='size-4 text-gray-500 dark:text-gray-700'
          />
        </div>
      </div>
    );
  }

  return (
    <StillImage
      className={clsx('rounded-lg leading-[0]', isCat && 'avatar__cat bg-gray-200 dark:bg-gray-900', className)}
      innerClassName='rounded-lg text-sm'
      style={style}
      src={src}
      alt={alt || intl.formatMessage(messages.avatar)}
      onError={handleLoadFailure}
    />
  );
};

export { Avatar as default };
