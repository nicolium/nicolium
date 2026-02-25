import { Link } from '@tanstack/react-router';
import React, { useCallback, useState } from 'react';
import { defineMessages, FormattedDate, FormattedMessage, useIntl } from 'react-intl';
import ReactSwipeableViews from 'react-swipeable-views';

import Account from '@/components/account';
import List, { ListItem } from '@/components/list';
import Card from '@/components/ui/card';
import Column from '@/components/ui/column';
import HStack from '@/components/ui/hstack';
import Icon from '@/components/ui/icon';
import IconButton from '@/components/ui/icon-button';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';
import StatusContainer from '@/containers/status-container';
import ColumnLoading from '@/features/ui/components/column-loading';
import { adminReportRoute } from '@/features/ui/router';
import { useAppSelector } from '@/hooks/use-app-selector';
import { useFeatures } from '@/hooks/use-features';
import { useAccount } from '@/queries/accounts/use-account';
import {
  useReopenReport,
  useReport,
  useResolveReport,
  useSelfAssignReport,
  useUnassignReport,
} from '@/queries/admin/use-reports';
import { makeGetReport } from '@/selectors';
import { useModalsActions } from '@/stores/modals';
import toast from '@/toast';

const messages = defineMessages({
  columnHeading: { id: 'column.report', defaultMessage: 'Report #{id}' },
  reportAssign: { id: 'report.assign_to_self', defaultMessage: 'Assign to self' },
  reportUnassign: { id: 'report.unassign', defaultMessage: 'Unassign' },
  reportAssigned: {
    id: 'report.assign_to_self.success',
    defaultMessage: 'Assigned report to yourself.',
  },
  reportUnassigned: { id: 'report.unassign.success', defaultMessage: 'Unassigned report.' },
  reportResolved: { id: 'report.resolve.success', defaultMessage: 'Report marked as resolved.' },
  reportReopened: { id: 'report.reopen.success', defaultMessage: 'Report reopened.' },
  reportCommentHeading: { id: 'report.resolve.comment.heading', defaultMessage: 'Add a comment' },
  reportCommentPlaceholder: {
    id: 'report.resolve.comment.placeholder',
    defaultMessage:
      'You can include an optional comment while resolving this report. If the report was created by a local account, the comment will be sent to the user.',
  },
  reportCommentConfirm: { id: 'report.resolve.comment.confirm', defaultMessage: 'Resolve report' },
});

interface IReportStatuses {
  statusIds: Array<string>;
}

const ReportStatuses: React.FC<IReportStatuses> = ({ statusIds }) => {
  const [index, setIndex] = useState(0);

  const handleChangeIndex = (index: number) => {
    setIndex(index % statusIds.length);
  };

  return (
    <div className='relative -mx-1'>
      {index !== 0 && (
        <div className='absolute left-0 top-1/2 z-10 -mt-4'>
          <button
            onClick={() => {
              handleChangeIndex(index - 1);
            }}
            className='flex size-8 items-center justify-center rounded-full bg-white/50 backdrop-blur dark:bg-gray-900/50'
          >
            <Icon
              src={require('@phosphor-icons/core/regular/caret-left.svg')}
              className='size-6 text-black dark:text-white'
            />
          </button>
        </div>
      )}
      <ReactSwipeableViews animateHeight index={index} onChangeIndex={handleChangeIndex}>
        {statusIds.map((statusId) => (
          <div className='w-full'>
            <StatusContainer key={statusId} id={statusId} />
          </div>
        ))}
      </ReactSwipeableViews>
      {index !== statusIds.length - 1 && (
        <div className='absolute right-0 top-1/2 z-10 -mt-4'>
          <button
            onClick={() => {
              handleChangeIndex(index + 1);
            }}
            className='flex size-8 items-center justify-center rounded-full bg-white/50 backdrop-blur dark:bg-gray-900/50'
          >
            <Icon
              src={require('@phosphor-icons/core/regular/caret-right.svg')}
              className='size-6 text-black dark:text-white'
            />
          </button>
        </div>
      )}
    </div>
  );
};

const ReportPage: React.FC = () => {
  const { reportId } = adminReportRoute.useParams();

  const features = useFeatures();
  const intl = useIntl();
  const { data: minifiedReport } = useReport(reportId);
  const { openModal } = useModalsActions();

  const getReport = useCallback(makeGetReport(), []);

  const report = useAppSelector((state) => getReport(state, minifiedReport));

  const { data: authorAccount } = useAccount(report?.account_id);
  const { data: targetAccount } = useAccount(report?.target_account_id);

  const { mutate: selfAssignReport } = useSelfAssignReport(reportId);
  const { mutate: unassignReport } = useUnassignReport(reportId);
  const { mutate: resolveReport } = useResolveReport(reportId);
  const { mutate: reopenReport } = useReopenReport(reportId);

  const handleSelfAssignReport = () => {
    selfAssignReport(undefined, {
      onSuccess: () => {
        toast.success(intl.formatMessage(messages.reportAssigned));
      },
    });
  };

  const handleUnassignReport = () => {
    unassignReport(undefined, {
      onSuccess: () => {
        toast.success(intl.formatMessage(messages.reportUnassigned));
      },
    });
  };

  const handleResolveReport = () => {
    const onConfirm = (actionTakenComment?: string) => {
      resolveReport(actionTakenComment, {
        onSuccess: () => {
          toast.success(intl.formatMessage(messages.reportResolved));
        },
      });
    };

    if (features.mastodonAdminResolveReportWithComment) {
      openModal('TEXT_FIELD', {
        heading: intl.formatMessage(messages.reportCommentHeading),
        placeholder: intl.formatMessage(messages.reportCommentPlaceholder),
        confirm: intl.formatMessage(messages.reportCommentConfirm),
        onConfirm,
      });
    } else {
      onConfirm();
    }
  };

  const handleReopenReport = () => {
    reopenReport(undefined, {
      onSuccess: () => {
        toast.success(intl.formatMessage(messages.reportReopened));
      },
    });
  };

  if (!report) return <ColumnLoading />;

  return (
    <Column label={intl.formatMessage(messages.columnHeading, { id: reportId })}>
      <div className='mb-4 grid grid-cols-1 gap-2 md:grid-cols-2'>
        {targetAccount && (
          <Link to='/@{$username}' params={{ username: targetAccount.acct }} className='h-fit'>
            <Card variant='rounded'>
              <Stack space={2}>
                <Text size='md' weight='medium'>
                  <FormattedMessage
                    id='admin.report.target_account'
                    defaultMessage='Reported account'
                  />
                </Text>
                <Account account={targetAccount} disabled hideActions />
              </Stack>
            </Card>
          </Link>
        )}
        <table className='w-full'>
          <tbody>
            <tr className='border-b border-primary-200 last:border-none dark:border-gray-800'>
              <td className='p-2.5'>
                <Text weight='medium' size='sm' tag='span'>
                  <FormattedMessage id='admin.report.created_at' defaultMessage='Reported' />
                </Text>
              </td>

              <td className='p-2.5 text-end'>
                <Text size='sm'>
                  <FormattedDate
                    value={report.created_at}
                    year='2-digit'
                    month='short'
                    day='2-digit'
                    weekday='short'
                  />
                </Text>
              </td>
            </tr>
            {authorAccount && (
              <tr className='border-b border-primary-200 last:border-none dark:border-gray-800'>
                <td className='p-2.5'>
                  <Text weight='medium' size='sm' tag='span'>
                    <FormattedMessage id='admin.report.reported_by' defaultMessage='Reported by' />
                  </Text>
                </td>

                <td className='p-2.5 text-end'>
                  <Text size='sm' className='hover:underline'>
                    <Link
                      to='/pl-fe/admin/accounts/$accountId'
                      params={{ accountId: report.account_id }}
                    >
                      @{authorAccount.acct}
                    </Link>
                  </Text>
                </td>
              </tr>
            )}
            <tr className='border-b border-primary-200 last:border-none dark:border-gray-800'>
              <td className='p-2.5'>
                <Text weight='medium' size='sm' tag='span'>
                  <FormattedMessage id='admin.report.action_taken' defaultMessage='Status' />
                </Text>
              </td>

              <td className='p-2.5 text-end'>
                <Text size='sm'>
                  {report.action_taken ? (
                    <FormattedMessage
                      id='admin.report.action_taken.true'
                      defaultMessage='Resolved'
                    />
                  ) : (
                    <FormattedMessage
                      id='admin.report.action_taken.false'
                      defaultMessage='Unresolved'
                    />
                  )}
                </Text>
              </td>
            </tr>
            {features.mastodonAdmin && (
              <tr className='border-b border-primary-200 last:border-none dark:border-gray-800'>
                <td className='p-2.5'>
                  <Text weight='medium' size='sm' tag='span'>
                    <FormattedMessage
                      id='admin.report.assigned_account'
                      defaultMessage='Assigned moderator'
                    />
                  </Text>
                </td>

                <td className='p-2.5 text-end'>
                  {report.assigned_account ? (
                    <HStack space={2} alignItems='center' justifyContent='end'>
                      <Text size='sm' className='hover:underline'>
                        <Link
                          to='/pl-fe/admin/accounts/$accountId'
                          params={{ accountId: report.assigned_account.id }}
                        >
                          @{report.assigned_account.acct}
                        </Link>
                      </Text>
                      <IconButton
                        iconClassName='h-4 w-4'
                        src={require('@phosphor-icons/core/regular/x.svg')}
                        onClick={handleUnassignReport}
                        text={intl.formatMessage(messages.reportUnassign)}
                      />
                    </HStack>
                  ) : (
                    <IconButton
                      className='ml-auto'
                      iconClassName='h-4 w-4'
                      src={require('@phosphor-icons/core/regular/plus.svg')}
                      onClick={handleSelfAssignReport}
                      text={intl.formatMessage(messages.reportAssign)}
                    />
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {report.status_ids?.length > 0 && (
        <Card variant='rounded' className='mb-4'>
          <Stack space={2}>
            <Text size='md' weight='medium'>
              <FormattedMessage id='admin.report.statuses' defaultMessage='Reported content' />
            </Text>
            <ReportStatuses statusIds={report.status_ids} />
          </Stack>
        </Card>
      )}
      <List>
        {report.action_taken ? (
          <ListItem
            label={<FormattedMessage id='admin.report.reopen' defaultMessage='Reopen report' />}
            onClick={handleReopenReport}
          />
        ) : (
          <ListItem
            label={<FormattedMessage id='admin.report.resolve' defaultMessage='Mark as resolved' />}
            hint={
              <FormattedMessage
                id='admin.report.resolve.hint'
                defaultMessage='No action will be taken against the reported account, no strike recorded, and the report will be closed.'
              />
            }
            onClick={handleResolveReport}
          />
        )}
        <ListItem
          label={<FormattedMessage id='admin.report.moderate' defaultMessage='Moderate account' />}
          to='/pl-fe/admin/accounts/$accountId'
          params={{ accountId: report.target_account_id }}
        />
      </List>
    </Column>
  );
};

export { ReportPage as default };
