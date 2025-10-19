import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { useAccount } from 'pl-fe/api/hooks/accounts/use-account';
import HoverAccountWrapper from 'pl-fe/components/hover-account-wrapper';
import Avatar from 'pl-fe/components/ui/avatar';
import HStack from 'pl-fe/components/ui/hstack';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import Emojify from 'pl-fe/features/emoji/emojify';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useReport } from 'pl-fe/queries/admin/use-reports';
import { makeGetReport } from 'pl-fe/selectors';

interface IReport {
  id: string;
}

const Report: React.FC<IReport> = ({ id }) => {
  const { data: minifiedReport } = useReport(id);

  const getReport = useCallback(makeGetReport(), []);

  const report = useAppSelector((state) => getReport(state, minifiedReport));

  const { account: targetAccount } = useAccount(report?.target_account_id);

  if (!report) return null;

  const account = report.account;

  const statuses = report.statuses;
  const statusCount = statuses.length;
  const reporterAcct = account?.acct;

  return (
    <Link to={`/pl-fe/admin/reports/${id}`} className='block rounded-lg bg-gray-100 p-4 dark:bg-primary-800'>
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
              <FormattedMessage
                id='admin.reports.account'
                defaultMessage='Reported by:'
              />
            </Text>
            <HoverAccountWrapper accountId={account.id} element='span'>
              <Link to={`/pl-fe/admin/accounts/${account.id}`}>
                @{reporterAcct}
              </Link>
            </HoverAccountWrapper>
          </HStack>
        )}

        {!!report.comment && report.comment.length > 0 && (
          <HStack space={1} alignItems='center' wrap>
            <Text size='sm' theme='muted'>
              <FormattedMessage
                id='admin.reports.comment'
                defaultMessage='Comment:'
              />
            </Text>
            {report.comment}
          </HStack>
        )}

        {statusCount > 0 && (
          <HStack space={1} alignItems='center' wrap>
            <Text size='sm' theme='muted'>
              <FormattedMessage
                id='admin.reports.statuses'
                defaultMessage='Reported posts:'
              />
            </Text>
            {statusCount}
          </HStack>
        )}
      </Stack>
    </Link>
  );
};

export { Report as default };
