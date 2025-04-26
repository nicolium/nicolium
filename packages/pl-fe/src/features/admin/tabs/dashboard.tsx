import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import List, { ListItem } from 'pl-fe/components/list';
import { CardTitle } from 'pl-fe/components/ui/card';
import Icon from 'pl-fe/components/ui/icon';
import Stack from 'pl-fe/components/ui/stack';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useInstance } from 'pl-fe/hooks/use-instance';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';
import sourceCode from 'pl-fe/utils/code';

import { Counter } from '../components/counter';
import { DashCounter, DashCounters } from '../components/dashcounter';
import RegistrationModePicker from '../components/registration-mode-picker';

const Dashboard: React.FC = () => {
  const instance = useInstance();
  const features = useFeatures();
  const { account } = useOwnAccount();

  const v = features.version;

  const {
    user_count: userCount,
    status_count: statusCount,
    domain_count: domainCount,
  } = instance.stats;

  const mau = instance.usage.users.active_month ?? instance.pleroma.stats.mau;
  const retention = (userCount && mau) ? Math.round(mau / userCount * 100) : undefined;

  const [endDay] = useState<string>(new Date().toISOString().slice(0, 10));
  const [startDay] = useState<string>(new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));

  if (!account) return null;

  return (
    <Stack space={6} className='mt-4'>
      <DashCounters>
        {features.mastodonAdminMetrics ? (
          <Counter
            measure='new_users'
            startAt={startDay}
            endAt={endDay}
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
            startAt={startDay}
            endAt={endDay}
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
              startAt={startDay}
              endAt={endDay}
              label={<FormattedMessage id='admin.counters.interactions' defaultMessage='interactions' />}
            />
            <Counter
              measure='opened_reports'
              startAt={startDay}
              endAt={endDay}
              to='/pl-fe/admin/reports'
              label={<FormattedMessage id='admin.counters.opened_reports' defaultMessage='reports opened' />}
            />
            <Counter
              measure='resolved_reports'
              startAt={startDay}
              endAt={endDay}
              to='/pl-fe/admin/reports'
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

        <ListItem label={<FormattedMessage id='admin.software.backend' defaultMessage='Backend' />}>
          <span>{v.software + (v.build ? `+${v.build}` : '')} {v.version}</span>
        </ListItem>
      </List>
    </Stack>
  );
};

export { Dashboard as default };
