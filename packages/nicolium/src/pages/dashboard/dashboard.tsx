import React, { useState } from 'react';
import { defineMessages, FormattedMessage, FormattedNumber, useIntl } from 'react-intl';

import List, { ListItem } from '@/components/list';
import { CardTitle } from '@/components/ui/card';
import Column from '@/components/ui/column';
import Icon from '@/components/ui/icon';
import { Counter } from '@/features/admin/components/counter';
import { DashCounter, DashCounters } from '@/features/admin/components/dashcounter';
import { Dimension } from '@/features/admin/components/dimension';
import RegistrationModePicker from '@/features/admin/components/registration-mode-picker';
import { Retention } from '@/features/admin/components/retention';
import { useFeatures } from '@/hooks/use-features';
import { useOwnAccount } from '@/hooks/use-own-account';
import { usePendingUsersCount } from '@/queries/admin/use-accounts';
import { usePendingReportsCount } from '@/queries/admin/use-reports';
import { useInstance } from '@/stores/instance';
import sourceCode from '@/utils/code';

const messages = defineMessages({
  heading: { id: 'column.admin.dashboard', defaultMessage: 'Dashboard' },
});

const Dashboard: React.FC = () => {
  const intl = useIntl();
  const instance = useInstance();
  const features = useFeatures();
  const { data: account } = useOwnAccount();

  const { data: awaitingApprovalCount = 0 } = usePendingUsersCount();
  const { data: pendingReportsCount = 0 } = usePendingReportsCount();

  const v = features.version;

  const {
    user_count: userCount,
    status_count: statusCount,
    domain_count: domainCount,
  } = instance.stats;

  const mau = instance.usage.users.active_month ?? instance.pleroma.stats.mau;
  const retention = userCount && mau ? Math.round((mau / userCount) * 100) : undefined;

  const [today] = useState<string>(new Date().toISOString().slice(0, 10));
  const [monthAgo] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  );
  const [sixMonthsAgo] = useState<string>(
    new Date(Date.now() - 30 * 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  );

  if (!account) return null;

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <div className='⁂-dashboard'>
        <DashCounters>
          {features.mastodonAdminMetrics ? (
            <Counter
              measure='new_users'
              startAt={monthAgo}
              endAt={today}
              to='/nicolium/admin/users'
              label={<FormattedMessage id='admin.counters.new_users' defaultMessage='new users' />}
            />
          ) : (
            <DashCounter
              to='/nicolium/admin/users'
              count={userCount}
              label={
                <FormattedMessage
                  id='admin.dashcounters.user_count_label'
                  defaultMessage='total users'
                />
              }
            />
          )}
          {features.mastodonAdminMetrics ? (
            <Counter
              measure='active_users'
              startAt={monthAgo}
              endAt={today}
              label={
                <FormattedMessage id='admin.counters.active_users' defaultMessage='active users' />
              }
            />
          ) : (
            <DashCounter
              count={mau}
              label={
                <FormattedMessage
                  id='admin.dashcounters.mau_label'
                  defaultMessage='monthly active users'
                />
              }
            />
          )}
          {!features.mastodonAdminMetrics && (
            <DashCounter
              count={retention}
              label={
                <FormattedMessage
                  id='admin.dashcounters.retention_label'
                  defaultMessage='user retention'
                />
              }
              percent
            />
          )}
          {features.mastodonAdminMetrics && (
            <>
              <Counter
                measure='interactions'
                startAt={monthAgo}
                endAt={today}
                label={
                  <FormattedMessage
                    id='admin.counters.interactions'
                    defaultMessage='interactions'
                  />
                }
              />
              <Counter
                measure='opened_reports'
                startAt={monthAgo}
                endAt={today}
                to='/nicolium/admin/reports'
                label={
                  <FormattedMessage
                    id='admin.counters.opened_reports'
                    defaultMessage='reports opened'
                  />
                }
              />
              <Counter
                measure='resolved_reports'
                startAt={monthAgo}
                endAt={today}
                to='/nicolium/admin/reports'
                search={{ resolved: true }}
                label={
                  <FormattedMessage
                    id='admin.counters.resolved_reports'
                    defaultMessage='reports resolved'
                  />
                }
              />
            </>
          )}
          <DashCounter
            to='/timeline/local'
            count={statusCount}
            label={
              <FormattedMessage id='admin.dashcounters.status_count_label' defaultMessage='posts' />
            }
          />
          <DashCounter
            count={domainCount}
            label={
              <FormattedMessage id='admin.dashcounters.domain_count_label' defaultMessage='peers' />
            }
          />
          <List>
            <ListItem
              size='sm'
              to='/nicolium/admin/reports'
              search={{ resolved: false }}
              label={
                <FormattedMessage
                  id='admin.links.pending_reports'
                  defaultMessage='{count, plural, one {{formattedCount} pending report} other {{formattedCount} pending reports}}'
                  values={{
                    count: pendingReportsCount,
                    formattedCount: (
                      <strong>
                        <FormattedNumber value={pendingReportsCount} />
                      </strong>
                    ),
                  }}
                />
              }
            />
            <ListItem
              size='sm'
              to='/nicolium/admin/approval'
              label={
                <FormattedMessage
                  id='admin.links.pending_users'
                  defaultMessage='{count, plural, one {{formattedCount} pending user} other {{formattedCount} pending users}}'
                  values={{
                    count: awaitingApprovalCount,
                    formattedCount: (
                      <strong>
                        <FormattedNumber value={awaitingApprovalCount} />
                      </strong>
                    ),
                  }}
                />
              }
            />
            {/* <ListItem size='sm' to='/nicolium/admin' label={<FormattedMessage id='admin.links.pending_tags' defaultMessage='{count} pending tags' values={{ count: <strong>0</strong> }} />} />
            <ListItem size='sm' to='/nicolium/admin' label={<FormattedMessage id='admin.links.pending_appeals' defaultMessage='{count} pending appeals' values={{ count: <strong>0</strong> }} />} /> */}
          </List>
          {features.mastodonAdminMetrics && (
            <>
              <Dimension
                dimension='sources'
                startAt={monthAgo}
                endAt={today}
                params={{ limit: 8 }}
                label={
                  <FormattedMessage
                    id='admin.dimensions.sources'
                    defaultMessage='Sign-up sources'
                  />
                }
              />
              <Dimension
                dimension='languages'
                startAt={monthAgo}
                endAt={today}
                params={{ limit: 8 }}
                label={
                  <FormattedMessage
                    id='admin.dimensions.top_languages'
                    defaultMessage='Top active languages'
                  />
                }
              />
              <Dimension
                dimension='servers'
                startAt={monthAgo}
                endAt={today}
                params={{ limit: 8 }}
                label={
                  <FormattedMessage
                    id='admin.dimensions.top_servers'
                    defaultMessage='Top active servers'
                  />
                }
              />
              <Retention startAt={sixMonthsAgo} endAt={today} frequency='month' />
              <Dimension
                dimension='software_versions'
                startAt={monthAgo}
                endAt={today}
                params={{ limit: 4 }}
                label={
                  <FormattedMessage id='admin.dimensions.software' defaultMessage='Software' />
                }
              />
              <Dimension
                dimension='space_usage'
                startAt={monthAgo}
                endAt={today}
                params={{ limit: 3 }}
                label={
                  <FormattedMessage
                    id='admin.dimensions.media_storage'
                    defaultMessage='Media storage'
                  />
                }
              />
            </>
          )}
        </DashCounters>

        <List>
          {features.pleromaAdminAccounts && account.is_admin && (
            <ListItem
              to='/nicolium/config'
              label={
                <FormattedMessage
                  id='column.frontend_config'
                  defaultMessage='Front-end configuration'
                />
              }
            />
          )}

          {features.pleromaAdminModerationLog && (
            <ListItem
              to='/nicolium/admin/log'
              label={
                <FormattedMessage
                  id='column.admin.moderation_log'
                  defaultMessage='Moderation log'
                />
              }
            />
          )}

          {features.pleromaAdminAnnouncements && (
            <ListItem
              to='/nicolium/admin/announcements'
              label={
                <FormattedMessage id='column.admin.announcements' defaultMessage='Announcements' />
              }
            />
          )}

          {features.adminRules && (
            <ListItem
              to='/nicolium/admin/rules'
              label={<FormattedMessage id='column.admin.rules' defaultMessage='Instance rules' />}
            />
          )}

          {features.domains && (
            <ListItem
              to='/nicolium/admin/domains'
              label={<FormattedMessage id='column.admin.domains' defaultMessage='Domains' />}
            />
          )}
        </List>

        {features.pleromaAdminAccounts && account.is_admin && (
          <>
            <CardTitle
              title={
                <FormattedMessage
                  id='admin.dashboard.registration_mode_label'
                  defaultMessage='Registrations'
                />
              }
            />

            <RegistrationModePicker />
          </>
        )}

        <CardTitle
          title={
            <FormattedMessage id='admin.dashwidgets.software_header' defaultMessage='Software' />
          }
        />

        <List>
          <ListItem
            label={<FormattedMessage id='admin.software.frontend' defaultMessage='Frontend' />}
          >
            <a
              href={sourceCode.ref ? `${sourceCode.url}/tree/${sourceCode.ref}` : sourceCode.url}
              className='⁂-dashboard__source-code'
              target='_blank'
            >
              <span>
                {sourceCode.displayName} {sourceCode.version}
              </span>

              <Icon src={require('@phosphor-icons/core/regular/arrow-square-out.svg')} />
            </a>
          </ListItem>

          {!features.mastodonAdminMetrics && (
            <ListItem
              label={<FormattedMessage id='admin.software.backend' defaultMessage='Backend' />}
            >
              <span>
                {v.software} ({instance.version})
              </span>
            </ListItem>
          )}
        </List>
      </div>
    </Column>
  );
};

export { Dashboard as default };
