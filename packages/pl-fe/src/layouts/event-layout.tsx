import { Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage } from 'react-intl';

import Column from '@/components/ui/column';
import Layout from '@/components/ui/layout';
import Tabs, { type Item } from '@/components/ui/tabs';
import PlaceholderStatus from '@/features/placeholder/components/placeholder-status';
import LinkFooter from '@/features/ui/components/link-footer';
import { layouts } from '@/features/ui/router';
import {
  EventHeader,
  SignUpPanel,
  TrendsPanel,
  WhoToFollowPanel,
} from '@/features/ui/util/async-components';
import { useAppSelector } from '@/hooks/use-app-selector';
import { useFeatures } from '@/hooks/use-features';
import { makeGetStatus } from '@/selectors';

const getStatus = makeGetStatus();

const EventLayout = () => {
  const { statusId } = layouts.event.useParams();

  const me = useAppSelector(state => state.me);
  const features = useFeatures();

  const navigate = useNavigate();
  const location = useLocation();

  const status = useAppSelector(state => getStatus(state, { id: statusId }) ?? undefined);

  const event = status?.event;

  if (status && !event) {
    navigate({ to: '/@{$username}/posts/$statusId', params: { username: status.account.acct, statusId: status.id } });
    return (
      <PlaceholderStatus />
    );
  }

  const pathname = location.pathname;
  const activeItem = pathname.endsWith('/discussion') ? 'discussion' : 'info';

  const tabs: Array<Item> = status ? [
    {
      text: <FormattedMessage id='event.information' defaultMessage='Information' />,
      to: '/@{$username}/events/$statusId',
      params: { username: status.account.acct, statusId: status.id },
      name: 'info',
    },
    {
      text: <FormattedMessage id='event.discussion' defaultMessage='Discussion' />,
      to: '/@{$username}/events/$statusId/discussion',
      params: { username: status.account.acct, statusId: status.id },
      name: 'discussion',
    },
  ] : [];

  const showTabs = !['/participations', 'participation_requests'].some(path => pathname.endsWith(path));

  return (
    <>
      {status?.account.local === false && (
        <Helmet>
          <meta content='noindex, noarchive' name='robots' />
        </Helmet>
      )}
      <Layout.Main>
        <Column label={event?.name} withHeader={false}>
          <div className='space-y-4'>
            <EventHeader status={status} />

            {status && showTabs && (
              <Tabs key={`event-tabs-${status.id}`} items={tabs} activeItem={activeItem} />
            )}

            <Outlet />
          </div>
        </Column>
      </Layout.Main>

      <Layout.Aside>
        {!me && (
          <SignUpPanel />
        )}
        {features.trends && (
          <TrendsPanel limit={5} />
        )}
        {features.suggestions && (
          <WhoToFollowPanel limit={3} />
        )}
        <LinkFooter key='link-footer' />
      </Layout.Aside>
    </>
  );
};

export { EventLayout as default };
