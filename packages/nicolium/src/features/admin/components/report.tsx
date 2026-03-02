import { Link } from '@tanstack/react-router';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import HoverAccountWrapper from '@/components/accounts/hover-account-wrapper';
import Avatar from '@/components/ui/avatar';
import HStack from '@/components/ui/hstack';
import Stack from '@/components/ui/stack';
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
      <Stack space={2} className='h-full justify-between'>
        {report.target_account && (
          <HoverAccountWrapper accountId={report.target_account.id} element='span'>
            <HStack alignItems='center' space={2}>
              <Avatar
                src={report.target_account.avatar}
                alt={report.target_account.avatar_description}
                size={40}
                isCat={report.target_account.is_cat}
                username={report.target_account.username}
              />
              <Stack>
                <Text size='sm' weight='semibold' truncate>
                  <Emojify
                    text={report.target_account.display_name}
                    emojis={report.target_account.emojis}
                  />
                </Text>
                <Text size='sm' theme='muted' direction='ltr' truncate>
                  @{report.target_account.fqn}
                </Text>
              </Stack>
            </HStack>
          </HoverAccountWrapper>
        )}

        {!!account && (
          <HStack space={1} alignItems='center' wrap>
            <Text size='sm' theme='muted'>
              <FormattedMessage id='admin.reports.account' defaultMessage='Reported by:' />
            </Text>
            <HoverAccountWrapper accountId={account.id} element='span'>
              <Link to='/nicolium/admin/accounts/$accountId' params={{ accountId: account.id }}>
                @{reporterAcct}
              </Link>
            </HoverAccountWrapper>
          </HStack>
        )}

        {!!report.comment && report.comment.length > 0 && (
          <HStack space={1} alignItems='center' wrap>
            <Text size='sm' theme='muted'>
              <FormattedMessage id='admin.reports.comment' defaultMessage='Comment:' />
            </Text>
            {report.comment}
          </HStack>
        )}

        {statusCount > 0 && (
          <HStack space={1} alignItems='center' wrap>
            <Text size='sm' theme='muted'>
              <FormattedMessage id='admin.reports.statuses' defaultMessage='Reported posts:' />
            </Text>
            {statusCount}
          </HStack>
        )}
      </Stack>
    </Link>
  );
};

export { Report as default };
