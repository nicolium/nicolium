import { Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import { Navigate } from '@tanstack/react-router';
import React, { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import LinkFooter from '@/components/navigation/link-footer';
import PlaceholderStatus from '@/components/placeholders/placeholder-status';
import Column from '@/components/ui/column';
import Layout from '@/components/ui/layout';
import Tabs, { type Item } from '@/components/ui/tabs';
import { useCurrentAccount } from '@/contexts/current-account-context';
import {
  EventHeader,
  SignUpPanel,
  TrendsPanel,
  WhoToFollowPanel,
} from '@/features/ui/util/async-components';
import { useFeatures } from '@/hooks/use-features';
import { useFrontendConfig } from '@/hooks/use-frontend-config';
import { useStatus } from '@/queries/statuses/use-status';
import { layouts } from '@/router';

const EventLayout = () => {
  const { statusId } = layouts.event.useParams();

  const me = useCurrentAccount();
  const features = useFeatures();
  const { allowDisplayingRemoteNoLogin } = useFrontendConfig();

  const navigate = useNavigate();
  const location = useLocation();

  const { data: status } = useStatus(statusId);

  const event = status?.event;

  const meta = useMemo(() => {
    if (!status) return null;

    const firstAttachment = status.media_attachments && status.media_attachments[0];

    return (
      <>
        {status.spoiler_text && <meta property='og:title' content={status.spoiler_text} />}
        {(firstAttachment?.type === 'image' || firstAttachment?.type === 'gifv') && (
          <>
            <meta property='og:image' content={firstAttachment.preview_url} />
            <meta property='og:image:alt' content={firstAttachment.description || ''} />
            {firstAttachment.mime_type && (
              <meta property='og:type' content={firstAttachment.mime_type} />
            )}
            {firstAttachment.meta.original && (
              <meta
                property='og:image:width'
                content={firstAttachment.meta.original.width.toString()}
              />
            )}
            {firstAttachment.meta.original && (
              <meta
                property='og:image:height'
                content={firstAttachment.meta.original.height.toString()}
              />
            )}
          </>
        )}
        <meta property='og:url' content={status.url} />
        <meta name='author' content={status.account.display_name || status.account.acct} />
        <meta property='article:author' content={status.account.url} />
        <meta property='article:published_time' content={status.created_at} />
        <meta property='fediverse.creator' name='fediverse.creator' content={status.account.acct} />
        {status.edited_at && <meta property='article:modified_time' content={status.edited_at} />}

        {status.account.local === false && <meta content='noindex, noarchive' name='robots' />}
      </>
    );
  }, [status]);

  if (!me && status && !status.account.local && !allowDisplayingRemoteNoLogin) {
    return <Navigate to='/external_redirect' state={{ redirectTarget: status.url }} replace />;
  }

  if (status && !event) {
    navigate({
      to: '/@{$username}/posts/$statusId',
      params: { username: status.account.acct, statusId: status.id },
    });
    return <PlaceholderStatus />;
  }

  const pathname = location.pathname;
  const activeItem = pathname.endsWith('/discussion') ? 'discussion' : 'info';

  const tabs: Array<Item> = status
    ? [
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
      ]
    : [];

  const showTabs = !['/participations', 'participation_requests'].some((path) =>
    pathname.endsWith(path),
  );

  return (
    <>
      {meta}
      <Layout.Main>
        <Column label={event?.name} withHeader={false}>
          <article className='space-y-4' data-status-id={statusId}>
            <EventHeader status={status} />

            {status && showTabs && (
              <Tabs key={`event-tabs-${status.id}`} items={tabs} activeItem={activeItem} />
            )}

            <Outlet />
          </article>
        </Column>
      </Layout.Main>

      <Layout.Aside>
        {!me && <SignUpPanel />}
        {features.trends && <TrendsPanel limit={5} />}
        {features.suggestions && <WhoToFollowPanel limit={3} />}
        <LinkFooter key='link-footer' />
      </Layout.Aside>
    </>
  );
};

export { EventLayout as default };
