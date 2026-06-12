import iconCaretRight from '@phosphor-icons/core/regular/caret-right.svg';
import iconDotsThree from '@phosphor-icons/core/regular/dots-three.svg';
import iconHouse from '@phosphor-icons/core/regular/house.svg';
import { Link } from '@tanstack/react-router';
import { clsx } from 'clsx';
import React from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import Icon from '@/components/ui/icon';
import { useDriveFolderQuery } from '@/queries/drive/use-drive-folder';

const messages = defineMessages({
  home: { id: 'drive.breadcrumbs.home', defaultMessage: 'Home' },
});

interface IBreadcrumbs {
  folderId?: string;
  depth?: number;
  onClick?: (folderId?: string) => void;
}

const Breadcrumbs: React.FC<IBreadcrumbs> = ({ folderId, depth = 0, onClick }) => {
  const { data } = useDriveFolderQuery(folderId);
  const intl = useIntl();

  if (!folderId) {
    const label = depth === 0 && (
      <span>
        <FormattedMessage id='drive.breadcrumbs.home' defaultMessage='Home' />
      </span>
    );

    if (onClick || depth === 0) {
      return (
        <button
          className={clsx('drive-breadcrumbs__item drive-breadcrumbs__home', {
            'drive-breadcrumbs__item--current': depth === 0,
          })}
          onClick={() => onClick?.()}
          disabled={depth === 0}
          aria-label={intl.formatMessage(messages.home)}
          title={intl.formatMessage(messages.home)}
        >
          <Icon src={iconHouse} aria-hidden />
          {label}
        </button>
      );
    } else {
      return (
        <Link
          to='/drive/{-$folderId}'
          params={{ folderId: undefined }}
          className='drive-breadcrumbs__home'
          aria-label={intl.formatMessage(messages.home)}
          title={intl.formatMessage(messages.home)}
        >
          <Icon src={iconHouse} aria-hidden />
          {label}
        </Link>
      );
    }
  }

  if (!data) return null;

  const spacer = (
    <div className='drive-breadcrumbs__spacer' aria-hidden>
      <Icon src={iconCaretRight} />
    </div>
  );

  const button = onClick ? (
    <button
      className={clsx('drive-breadcrumbs__item', {
        'drive-breadcrumbs__item--current': depth === 0,
      })}
      onClick={() => {
        onClick?.(folderId);
      }}
    >
      {data.name}
    </button>
  ) : (
    <Link
      to='/drive/{-$folderId}'
      params={{ folderId }}
      className={clsx('drive-breadcrumbs__item', {
        'drive-breadcrumbs__item--current': depth === 0,
      })}
    >
      {data.name}
    </Link>
  );

  if (depth === 2 && data?.parent_id) {
    return (
      <>
        <Breadcrumbs depth={depth + 1} onClick={onClick} />
        {spacer}
        <div className='drive-breadcrumbs__spacer' aria-hidden>
          <Icon src={iconDotsThree} />
        </div>
        {spacer}
        {button}
      </>
    );
  }

  return (
    <>
      <Breadcrumbs folderId={data.parent_id ?? undefined} depth={depth + 1} onClick={onClick} />
      {spacer}
      {button}
    </>
  );
};

export { Breadcrumbs };
