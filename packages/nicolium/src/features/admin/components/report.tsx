import { Link } from '@tanstack/react-router';
import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';

import HoverAccountWrapper from '@/components/accounts/hover-account-wrapper';
import Avatar from '@/components/ui/avatar';
import HStack from '@/components/ui/hstack';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';
import Emojify from '@/features/emoji/emojify';
import { useAppSelector } from '@/hooks/use-app-selector';
import { useAccount } from '@/queries/accounts/use-account';
import { useReport } from '@/queries/admin/use-reports';
import { makeGetReport } from '@/selectors';

interface IReport {
  id: string;
}

const Report: React.FC<IReport> = ({ id }) => {
  const { data: minifiedReport } = useReport(id);

  const getReport = useCallback(makeGetReport(), []);

  const report = useAppSelector((state) => getReport(state, minifiedReport));

  const { data: targetAccount } = useAccount(report?.target_account_id);

  if (!report) return null;

  const account = report.account;

  const statuses = report.statuses;
  const statusCount = statuses.length;
  const reporterAcct = account?.acct;

  return (
    <Link
      to='/pl-fe/admin/reports/$reportId'
      params={{ reportId: id }}
      className='block rounded-lg bg-gray-100 p-4 dark:bg-primary-800'
    >
      <Stack space={2} className='h-full justify-between'>
        {targetAccount && (
          <HoverAccountWrapper accountId={targetAccount.id} element='span'>
            <HStack alignItems='center' space={2}>
              <Avatar
                src={targetAccount.avatar}
                alt={targetAccount.avatar_description}
                size={40}
                isCat={targetAccount.is_cat}
                username={targetAccount.username}
              />
              <Stack>
                <Text size='sm' weight='semibold' truncate>
                  <Emojify text={targetAccount.display_name} emojis={targetAccount.emojis} />
                </Text>
                <Text size='sm' theme='muted' direction='ltr' truncate>
                  @{targetAccount.fqn}
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
              <Link to='/pl-fe/admin/accounts/$accountId' params={{ accountId: account.id }}>
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
