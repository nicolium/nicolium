import { Navigate, Outlet, useLocation } from '@tanstack/react-router';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import AccountHeader from '@/components/accounts/account-header';
import { AsideContent } from '@/components/navigation/aside-content';
import Column from '@/components/ui/column';
import Layout from '@/components/ui/layout';
import Tabs, { type Item } from '@/components/ui/tabs';
import { useCurrentAccount } from '@/contexts/current-account-context';
import { ProfileInfoPanel } from '@/features/ui/util/async-components';
import { useAcct } from '@/hooks/use-acct';
import { useFrontendConfig } from '@/hooks/use-frontend-config';
import { useAccountLookup } from '@/queries/accounts/use-account-lookup';
import { layouts } from '@/router';
import { LOCAL_STORAGE_REDIRECT_KEY } from '@/utils/redirect';

/** Layout to display a user's profile. */
const ProfileLayout: React.FC = () => {
  const { username } = layouts.profile.useParams();
  const { with_replies: withReplies } = layouts.profile.useSearch();
  const location = useLocation();

  const { data: account, isUnauthorized } = useAccountLookup(username, true);

  const me = useCurrentAccount();
  const acct = useAcct(account);
  const { allowDisplayingRemoteNoLogin } = useFrontendConfig();

  if (isUnauthorized) {
    localStorage.setItem(LOCAL_STORAGE_REDIRECT_KEY, location.href);
    return <Navigate to='/login' />;
  }

  if (!me && account && !account.local && !allowDisplayingRemoteNoLogin) {
    return <Navigate to='/external_redirect' state={{ redirectTarget: account.url }} replace />;
  }

  // Fix case of username
  if (account && account.acct !== username) {
    return <Navigate to='/@{$username}' params={{ username: account.acct }} replace />;
  }

  const tabItems: Array<Item> = [
    {
      text: <FormattedMessage id='account.posts' defaultMessage='Posts' />,
      to: '/@{$username}',
      params: { username },
      name: 'profile',
    },
    {
      text: <FormattedMessage id='account.posts_with_replies' defaultMessage='Posts & replies' />,
      to: '/@{$username}',
      params: { username },
      search: { with_replies: true },
      name: 'replies',
    },
    {
      text: <FormattedMessage id='account.media' defaultMessage='Media' />,
      to: '/@{$username}/media',
      params: { username },
      name: 'media',
    },
  ];

  if (account) {
    const ownAccount = account.id === me;
    if (ownAccount || !account.hide_favorites) {
      tabItems.push({
        text: <FormattedMessage id='navigation_bar.favourites' defaultMessage='Likes' />,
        to: '/@{$username}/favorites',
        params: { username: account.acct },
        name: 'likes',
      });
    }
  }

  let activeItem;
  const pathname = location.pathname.replace(`/@${username}`, '');
  if (withReplies) {
    activeItem = 'replies';
  } else if (pathname.endsWith('/media')) {
    activeItem = 'media';
  } else if (pathname.endsWith('/favorites')) {
    activeItem = 'likes';
  } else {
    activeItem = 'profile';
  }

  const showTabs = !['/following', '/followers', '/pins'].some((path) => pathname.endsWith(path));

  return (
    <>
      {account?.local === false && <meta content='noindex, noarchive' name='robots' />}
      <Layout.Main>
        <Column
          bodyClassName='⁂-account-layout'
          size='lg'
          label={account ? `@${acct}` : ''}
          withHeader={false}
        >
          <AccountHeader key={`profile-header-${account?.id}`} account={account} />
          <ProfileInfoPanel
            key={`profile-info-${account?.id}`}
            username={username}
            account={account}
            withStatusesLink={pathname !== ''}
          />

          {account && showTabs && (
            <Tabs key={`profile-tabs-${account.id}`} items={tabItems} activeItem={activeItem} />
          )}

          <Outlet />
        </Column>
      </Layout.Main>

      <Layout.Aside>
        <AsideContent layout='profile' account={account} />
      </Layout.Aside>
    </>
  );
};

export { ProfileLayout as default };
