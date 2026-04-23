import { Link } from '@tanstack/react-router';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import HoverAccountWrapper from '@/components/accounts/hover-account-wrapper';
import Avatar from '@/components/ui/avatar';
import Text from '@/components/ui/text';
import Emojify from '@/features/emoji/emojify';
import { useReport } from '@/queries/admin/use-reports';

interface IReport {
  id: string;
}

const Report: React.FC<IReport> = ({ id }) => {
  const { data: report } = useReport(id);

  if (!report) return null;

  const account = report.account;

  const statusCount = report.status_ids.length;
  const reporterAcct = account?.acct;

  return (
    <Link
      to='/nicolium/admin/reports/$reportId'
      params={{ reportId: id }}
      className='block rounded-lg bg-gray-100 p-4 dark:bg-primary-800'
    >
      <div className='flex h-full flex-col justify-between gap-2'>
        {report.target_account && (
          <HoverAccountWrapper accountId={report.target_account.id} element='span'>
            <div className='flex items-center gap-2'>
              <Avatar
                src={report.target_account.avatar}
                alt={report.target_account.avatar_description}
                size={40}
                isCat={report.target_account.is_cat}
                username={report.target_account.username}
              />
              <div className='flex flex-col'>
                <Text size='sm' weight='semibold' truncate>
                  <Emojify
                    text={report.target_account.display_name}
                    emojis={report.target_account.emojis}
                  />
                </Text>
                <Text size='sm' theme='muted' direction='ltr' truncate>
                  @{report.target_account.fqn}
                </Text>
              </div>
            </div>
          </HoverAccountWrapper>
        )}

        {!!account && (
          <div className='flex flex-wrap items-center gap-1'>
            <Text size='sm' theme='muted'>
              <FormattedMessage id='admin.reports.account' defaultMessage='Reported by:' />
            </Text>
            <HoverAccountWrapper accountId={account.id} element='span'>
              <Link to='/nicolium/admin/accounts/$accountId' params={{ accountId: account.id }}>
                @{reporterAcct}
              </Link>
            </HoverAccountWrapper>
          </div>
        )}

        {!!report.comment && report.comment.length > 0 && (
          <div className='flex flex-wrap items-center gap-1'>
            <Text size='sm' theme='muted'>
              <FormattedMessage id='admin.reports.comment' defaultMessage='Comment:' />
            </Text>
            {report.comment}
          </div>
        )}

        {statusCount > 0 && (
          <div className='flex flex-wrap items-center gap-1'>
            <Text size='sm' theme='muted'>
              <FormattedMessage id='admin.reports.statuses' defaultMessage='Reported posts:' />
            </Text>
            {statusCount}
          </div>
        )}
      </div>
    </Link>
  );
};

export { Report as default };
