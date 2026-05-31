import clsx from 'clsx';
import React from 'react';

interface IPlaceholderAvatar {
  size: number;
  withText?: boolean;
  className?: string;
}

/** Fake avatar to display while data is loading. */
const PlaceholderAvatar: React.FC<IPlaceholderAvatar> = ({ size, withText = false, className }) => {
  const style = React.useMemo(() => {
    if (!size) {
      return {};
    }

    return {
      width: `${size}px`,
      height: `${size}px`,
    };
  }, [size]);

  return (
    <div className={clsx('placeholder-avatar', className)}>
      <div className='placeholder-avatar__image' style={style} />

      {withText && <div style={{ width: size, height: 15 }} className='placeholder-avatar__text' />}
    </div>
  );
};

export { PlaceholderAvatar as default };
