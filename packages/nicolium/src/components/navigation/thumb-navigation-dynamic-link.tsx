import { Link } from '@tanstack/react-router';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { useLongPress } from '@/hooks/use-long-press';
import { useAccount } from '@/queries/accounts/use-account';

import {
  useDynamicContentLink,
  type DynamicContentLinkItem,
} from '../../hooks/use-dynamic-content-link';
import Avatar from '../ui/avatar';

import ProfileDropdown from './profile-dropdown';
import ThumbNavigationLink from './thumb-navigation-link';

import type { NavigationItemsMenuItem } from '@/hooks/use-navigation-items';

const messages = defineMessages({
  profile: { id: 'tabs_bar.profile', defaultMessage: 'Profile' },
});

const ThumbNavigationProfileLink: React.FC<
  Extract<NavigationItemsMenuItem, { type: 'profile-link' }>
> = ({ accountId, ownAccount }) => {
  const intl = useIntl();
  const { data: account } = useAccount(accountId);
  const profileLinkRef = React.useRef<HTMLAnchorElement>(null);

  let bind: any = useLongPress((e) => {
    if (e.type !== 'touchstart') return;

    e.preventDefault();
    e.stopPropagation();

    if ('vibrate' in navigator) navigator.vibrate(1);
    profileLinkRef.current?.querySelector('button')?.click();
  });

  if (!ownAccount) {
    bind = undefined;
  } else {
    bind.onContextMenu = (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      e.stopPropagation();

      profileLinkRef.current?.querySelector('button')?.click();
    };
  }
  if (!account) return null;

  return (
    <Link
      ref={profileLinkRef}
      to='/@{$username}'
      params={{ username: account.acct }}
      {...bind}
      className='⁂-thumb-navigation__item'
      activeProps={{ className: '⁂-thumb-navigation__item--active' }}
      title={ownAccount ? intl.formatMessage(messages.profile) : `@${account.username}`}
    >
      {ownAccount && <ProfileDropdown account={account} />}
      <Avatar
        src={account.avatar}
        alt={account.avatar_description}
        isCat={account.is_cat}
        size={32}
        username={account.username}
      />
    </Link>
  );
};

const ThumbNavigationDynamicContentLink: React.FC<DynamicContentLinkItem> = (item) => {
  const link = useDynamicContentLink(item);

  return link ? <ThumbNavigationLink exact {...link} /> : null;
};

export { ThumbNavigationProfileLink, ThumbNavigationDynamicContentLink };
