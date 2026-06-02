import clsx from 'clsx';
import React, { useMemo } from 'react';

import { hexToHsl } from '@/utils/theme';

interface IBadge {
  title: React.ReactNode | string;
  slug: string;
  color?: string;
}
/** Badge to display on a user's profile. */
const Badge: React.FC<IBadge> = ({ title, slug, color }) => {
  const fallback = !['patron', 'admin', 'moderator', 'opaque'].includes(slug);

  const isDark = useMemo(() => {
    if (!color) return false;

    const hsl = hexToHsl(color);

    if (hsl && hsl.l > 50) return false;

    return true;
  }, [color]);

  return (
    <span
      data-testid='badge'
      className={clsx(
        'badge',
        color
          ? {
              'badge--dark': isDark,
              'badge--light': !isDark,
            }
          : {
              'badge--patron': slug === 'patron',
              'badge--admin': slug === 'admin',
              'badge--moderator': slug === 'moderator',
              'badge--opaque': slug === 'opaque',
              'badge--default': fallback,
            },
      )}
      style={color ? { background: color } : undefined}
    >
      {title}
    </span>
  );
};

export { Badge as default };
