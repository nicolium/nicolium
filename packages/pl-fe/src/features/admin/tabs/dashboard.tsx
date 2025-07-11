import React, { useState } from 'react';
import { FormattedMessage, FormattedNumber } from 'react-intl';

import List, { ListItem } from 'pl-fe/components/list';
import { CardTitle } from 'pl-fe/components/ui/card';
import Icon from 'pl-fe/components/ui/icon';
import Stack from 'pl-fe/components/ui/stack';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useInstance } from 'pl-fe/hooks/use-instance';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';
import { usePendingUsersCount } from 'pl-fe/queries/admin/use-accounts';
import { usePendingReportsCount } from 'pl-fe/queries/admin/use-reports';
import sourceCode from 'pl-fe/utils/code';

import { Counter } from '../components/counter';
import { DashCounter, DashCounters } from '../components/dashcounter';
import { Dimension } from '../components/dimension';
import RegistrationModePicker from '../components/registration-mode-picker';
import { Retention } from '../components/retention';

const Dashboard: React.FC = () => {
  const instance = useInstance();
  const features = useFeatures();
  const { account } = useOwnAccount();

  const { data: awaitingApprovalCount = 0 } = usePendingUsersCount();
  const { data: pendingReportsCount = 0 } = usePendingReportsCount();

  const v = features.version;

  const {
    user_count: userCount,
    status_count: statusCount,
    domain_count: domainCount,
  } = instance.stats;

  const mau = instance.usage.users.active_month ?? instance.pleroma.stats.mau;
  const retention = (userCount && mau) ? Math.round(mau / userCount * 100) : undefined;

  const [today] = useState<string>(new Date().toISOString().slice(0, 10));
  const [monthAgo] = useState<string>(new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  const [sixMonthsAgo] = useState<string>(new Date(new Date().getTime() - 30 * 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));

  if (!account) return null;

  return (
    <Stack space={6} className='mt-4'>
      <DashCounters>
        {features.mastodonAdminMetrics ? (
          <Counter
            measure='new_users'
            startAt={monthAgo}
            endAt={today}
            to='/pl-fe/admin/users'
            label={<FormattedMessage id='admin.counters.new_users' defaultMessage='new users' />}
          />
        ) : (
          <DashCounter
            to='/pl-fe/admin/users'
            count={userCount}
            label={<FormattedMessage id='admin.dashcounters.user_count_label' defaultMessage='total users' />}
          />
        )}
        {features.mastodonAdminMetrics ? (
          <Counter
            measure='active_users'
            startAt={monthAgo}
            endAt={today}
            label={<FormattedMessage id='admin.counters.active_users' defaultMessage='active users' />}
          />
        ) : (
          <DashCounter
            count={mau}
            label={<FormattedMessage id='admin.dashcounters.mau_label' defaultMessage='monthly active users' />}
          />
        )}
        {!features.mastodonAdminMetrics && (
          <DashCounter
            count={retention}
            label={<FormattedMessage id='admin.dashcounters.retention_label' defaultMessage='user retention' />}
            percent
          />
        )}
        {features.mastodonAdminMetrics && (
          <>
            <Counter
              measure='interactions'
              startAt={monthAgo}
              endAt={today}
              label={<FormattedMessage id='admin.counters.interactions' defaultMessage='interactions' />}
            />
            <Counter
              measure='opened_reports'
              startAt={monthAgo}
              endAt={today}
              to='/pl-fe/admin/reports?resolved=false'
              label={<FormattedMessage id='admin.counters.opened_reports' defaultMessage='reports opened' />}
            />
            <Counter
              measure='resolved_reports'
              startAt={monthAgo}
              endAt={today}
              to='/pl-fe/admin/reports?resolved=true'
              label={<FormattedMessage id='admin.counters.resolved_reports' defaultMessage='reports resolved' />}
            />
          </>
        )}
        <DashCounter
          to='/timeline/local'
          count={statusCount}
          label={<FormattedMessage id='admin.dashcounters.status_count_label' defaultMessage='posts' />}
        />
        <DashCounter
          count={domainCount}
          label={<FormattedMessage id='admin.dashcounters.domain_count_label' defaultMessage='peers' />}
        />
        <List>
          <ListItem size='sm' to='/pl-fe/admin/reports?resolved=false' label={<FormattedMessage id='admin.links.pending_reports' defaultMessage='{count, plural, one {{formattedCount} pending report} other {{formattedCount} pending reports}}' values={{ count: pendingReportsCount, formattedCount: <strong><FormattedNumber value={pendingReportsCount} /></strong> }} />} />
          <ListItem size='sm' to='/pl-fe/admin/users' label={<FormattedMessage id='admin.links.pending_users' defaultMessage='{count, plural, one {{formattedCount} pending user} other {{formattedCount} pending users}}' values={{ count: awaitingApprovalCount, formattedCount: <strong><FormattedNumber value={awaitingApprovalCount} /></strong> }} />} />
          {/* <ListItem size='sm' to='/pl-fe/admin' label={<FormattedMessage id='admin.links.pending_tags' defaultMessage='{count} pending tags' values={{ count: <strong>0</strong> }} />} />
          <ListItem size='sm' to='/pl-fe/admin' label={<FormattedMessage id='admin.links.pending_appeals' defaultMessage='{count} pending appeals' values={{ count: <strong>0</strong> }} />} /> */}
        </List>
        {features.mastodonAdminMetrics && (
          <>
            <Dimension
              dimension='sources'
              startAt={monthAgo}
              endAt={today}
              params={{ limit: 8 }}
              label={<FormattedMessage id='admin.dimensions.sources' defaultMessage='Sign-up sources' />}
            />
            <Dimension
              dimension='languages'
              startAt={monthAgo}
              endAt={today}
              params={{ limit: 8 }}
              label={<FormattedMessage id='admin.dimensions.top_languages' defaultMessage='Top active languages' />}
            />
            <Dimension
              dimension='servers'
              startAt={monthAgo}
              endAt={today}
              params={{ limit: 8 }}
              label={<FormattedMessage id='admin.dimensions.top_servers' defaultMessage='Top active servers' />}
            />
            <Retention startAt={sixMonthsAgo} endAt={today} frequency='month' />
            <Dimension
              dimension='software_versions'
              startAt={monthAgo}
              endAt={today}
              params={{ limit: 4 }}
              label={<FormattedMessage id='admin.dimensions.software' defaultMessage='Software' />}
            />
            <Dimension
              dimension='space_usage'
              startAt={monthAgo}
              endAt={today}
              params={{ limit: 3 }}
              label={<FormattedMessage id='admin.dimensions.media_storage' defaultMessage='Media storage' />}
            />
          </>
        )}
      </DashCounters>

      <List>
        {features.pleromaAdminAccounts && account.is_admin && (
          <ListItem
            to='/pl-fe/config'
            label={<FormattedMessage id='navigation_bar.plfe_config' defaultMessage='Front-end configuration' />}
          />
        )}

        {features.pleromaAdminModerationLog && (
          <ListItem
            to='/pl-fe/admin/log'
            label={<FormattedMessage id='column.admin.moderation_log' defaultMessage='Moderation log' />}
          />
        )}

        {features.pleromaAdminAnnouncements && (
          <ListItem
            to='/pl-fe/admin/announcements'
            label={<FormattedMessage id='column.admin.announcements' defaultMessage='Announcements' />}
          />
        )}

        {features.adminRules && (
          <ListItem
            to='/pl-fe/admin/rules'
            label={<FormattedMessage id='column.admin.rules' defaultMessage='Instance rules' />}
          />
        )}

        {features.domains && (
          <ListItem
            to='/pl-fe/admin/domains'
            label={<FormattedMessage id='column.admin.domains' defaultMessage='Domains' />}
          />
        )}
      </List>

      {features.pleromaAdminAccounts && account.is_admin && (
        <>
          <CardTitle
            title={<FormattedMessage id='admin.dashboard.registration_mode_label' defaultMessage='Registrations' />}
          />

          <RegistrationModePicker />
        </>
      )}

      <CardTitle
        title={<FormattedMessage id='admin.dashwidgets.software_header' defaultMessage='Software' />}
      />

      <List>
        <ListItem label={<FormattedMessage id='admin.software.frontend' defaultMessage='Frontend' />}>
          <a
            href={sourceCode.ref ? `${sourceCode.url}/tree/${sourceCode.ref}` : sourceCode.url}
            className='flex items-center space-x-1 truncate'
            target='_blank'
          >
            <span>{sourceCode.displayName} {sourceCode.version}</span>

            <Icon
              className='size-4'
              src={require('@tabler/icons/outline/external-link.svg')}
            />
          </a>
        </ListItem>

        {!features.mastodonAdminMetrics && (
          <ListItem label={<FormattedMessage id='admin.software.backend' defaultMessage='Backend' />}>
            <span>{v.software + (v.build ? `+${v.build}` : '')} {v.version}</span>
          </ListItem>
        )}
      </List>
    </Stack>
  );
};

export { Dashboard as default };
