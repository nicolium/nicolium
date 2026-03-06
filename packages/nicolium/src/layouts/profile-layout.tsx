import { Navigate, Outlet, useLocation } from '@tanstack/react-router';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Column from '@/components/ui/column';
import Layout from '@/components/ui/layout';
import Tabs, { type Item } from '@/components/ui/tabs';
import Header from '@/features/account/components/header';
import LinkFooter from '@/features/ui/components/link-footer';
import { layouts } from '@/features/ui/router';
import {
  WhoToFollowPanel,
  ProfileInfoPanel,
  ProfileMediaPanel,
  ProfileFieldsPanel,
  SignUpPanel,
  PinnedAccountsPanel,
  AccountNotePanel,
} from '@/features/ui/util/async-components';
import { useAcct } from '@/hooks/use-acct';
import { useAppSelector } from '@/hooks/use-app-selector';
import { useFeatures } from '@/hooks/use-features';
import { useAccountLookup } from '@/queries/accounts/use-account-lookup';
import { LOCAL_STORAGE_REDIRECT_KEY } from '@/utils/redirect';

/** Layout to display a user's profile. */
const ProfileLayout: React.FC = () => {
  const { username } = layouts.profile.useParams();
  const location = useLocation();

  const { data: account, isUnauthorized } = useAccountLookup(username, true);

  const me = useAppSelector((state) => state.me);
  const features = useFeatures();
  const acct = useAcct(account);

  if (isUnauthorized) {
    localStorage.setItem(LOCAL_STORAGE_REDIRECT_KEY, location.href);
    return <Navigate to='/login' />;
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
  const pathname = location.pathname.replace(`@${username}/`, '');
  if (pathname.endsWith('/with_replies')) {
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
        <Column size='lg' label={account ? `@${acct}` : ''} withHeader={false}>
          <div className='space-y-4'>
            <Header key={`profile-header-${account?.id}`} account={account} />
            <ProfileInfoPanel username={username} account={account} />

            {account && showTabs && (
              <Tabs key={`profile-tabs-${account.id}`} items={tabItems} activeItem={activeItem} />
            )}

            <Outlet />
          </div>
        </Column>
      </Layout.Main>

      <Layout.Aside>
        {!me && <SignUpPanel />}

        {features.notes && account && account?.id !== me && <AccountNotePanel account={account} />}
        <ProfileMediaPanel account={account} />
        {account && account.fields.length > 0 && <ProfileFieldsPanel account={account} />}
        {features.accountEndorsements && account && account.local ? (
          <PinnedAccountsPanel account={account} limit={5} />
        ) : (
          me && features.suggestions && <WhoToFollowPanel limit={3} />
        )}
        <LinkFooter key='link-footer' />
      </Layout.Aside>
    </>
  );
};

export { ProfileLayout as default };
