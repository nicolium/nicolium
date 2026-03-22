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
    <div
      className={clsx('flex flex-col gap-2 text-center no-reduce-motion:animate-pulse', className)}
    >
      <div className='mx-auto block rounded-lg bg-primary-50 dark:bg-primary-800' style={style} />

      {withText && (
        <div
          style={{ width: size, height: 15 }}
          className='mx-auto rounded-full bg-primary-50 dark:bg-primary-800'
        />
      )}
    </div>
  );
};

export { PlaceholderAvatar as default };
