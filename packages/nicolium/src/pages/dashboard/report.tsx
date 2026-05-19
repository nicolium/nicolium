import iconCaretLeft from '@phosphor-icons/core/regular/caret-left.svg';
import iconCaretRight from '@phosphor-icons/core/regular/caret-right.svg';
import iconPlus from '@phosphor-icons/core/regular/plus.svg';
import iconX from '@phosphor-icons/core/regular/x.svg';
import { Link } from '@tanstack/react-router';
import React, { useState } from 'react';
import { defineMessages, FormattedDate, FormattedMessage, useIntl } from 'react-intl';

import Account from '@/components/accounts/account';
import List, { ListItem } from '@/components/list';
import ReactSwipeableViews from '@/components/react-swipeable-views';
import StatusContainer from '@/components/statuses/status-container';
import Column from '@/components/ui/column';
import Icon from '@/components/ui/icon';
import IconButton from '@/components/ui/icon-button';
import ColumnLoading from '@/features/ui/components/column-loading';
import { useFeatures } from '@/hooks/use-features';
import {
  useForwardReport,
  useReopenReport,
  useReport,
  useResolveReport,
  useSelfAssignReport,
  useUnassignReport,
} from '@/queries/admin/use-reports';
import { adminReportRoute } from '@/router';
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
  reportForwardConfirm: {
    id: 'confirmations.admin.report.forward.confirm',
    defaultMessage: 'Forward',
  },
  reportForwardSuccess: { id: 'admin.report.forward.success', defaultMessage: 'Report forwarded' },
});

interface IReportStatuses {
  statusIds: Array<string>;
}

const ReportStatuses: React.FC<IReportStatuses> = ({ statusIds }) => {
  const [index, setIndex] = useState(0);

  const handleChangeIndex = (index: number) => {
    setIndex(index % statusIds.length);
  };

  if (statusIds.length === 1) {
    return <StatusContainer id={statusIds[0]} />;
  }

  return (
    <div className='⁂-report-page__statuses'>
      {index !== 0 && (
        <div className='⁂-report-page__statuses__arrow ⁂-report-page__statuses__arrow--left'>
          <button
            onClick={() => {
              handleChangeIndex(index - 1);
            }}
          >
            <Icon src={iconCaretLeft} />
          </button>
        </div>
      )}
      <ReactSwipeableViews animateHeight index={index} onChangeIndex={handleChangeIndex}>
        {statusIds.map((statusId) => (
          <div className='⁂-report-page__statuses__status' key={statusId}>
            <StatusContainer id={statusId} />
          </div>
        ))}
      </ReactSwipeableViews>
      {index !== statusIds.length - 1 && (
        <div className='⁂-report-page__statuses__arrow ⁂-report-page__statuses__arrow--right'>
          <button
            onClick={() => {
              handleChangeIndex(index + 1);
            }}
          >
            <Icon src={iconCaretRight} />
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
  const { data: report } = useReport(reportId);
  const { openModal } = useModalsActions();

  const { mutate: selfAssignReport } = useSelfAssignReport(reportId);
  const { mutate: unassignReport } = useUnassignReport(reportId);
  const { mutate: resolveReport } = useResolveReport(reportId);
  const { mutate: reopenReport } = useReopenReport(reportId);
  const { mutate: forwardReport } = useForwardReport(reportId);

  const handleSelfAssignReport = () => {
    selfAssignReport(undefined, {
      onSuccess: () => {
        toast.success(messages.reportAssigned);
      },
    });
  };

  const handleUnassignReport = () => {
    unassignReport(undefined, {
      onSuccess: () => {
        toast.success(messages.reportUnassigned);
      },
    });
  };

  const handleResolveReport = () => {
    const onConfirm = (actionTakenComment?: string) => {
      resolveReport(actionTakenComment, {
        onSuccess: () => {
          toast.success(messages.reportResolved);
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

  const handleForwardReport = () => {
    openModal('CONFIRM', {
      heading: (
        <FormattedMessage
          id='confirmations.admin.report.forward.heading'
          defaultMessage='Forward the report'
        />
      ),
      message: (
        <FormattedMessage
          id='confirmations.admin.report.forward.message'
          defaultMessage='Are you sure you want to forward this report to the parent instance?'
        />
      ),
      confirm: intl.formatMessage(messages.reportForwardConfirm),
      onConfirm: () => {
        forwardReport(undefined, {
          onSuccess: () => {
            toast.success(intl.formatMessage(messages.reportForwardSuccess));
          },
        });
      },
    });
  };

  const handleReopenReport = () => {
    reopenReport(undefined, {
      onSuccess: () => {
        toast.success(messages.reportReopened);
      },
    });
  };

  if (!report) return <ColumnLoading />;

  return (
    <Column label={intl.formatMessage(messages.columnHeading, { id: reportId })}>
      <div className='⁂-report-page__summary'>
        {report.target_account && (
          <Link
            to='/nicolium/admin/accounts/$accountId'
            params={{ accountId: report.target_account_id }}
            className='⁂-report-page__account'
          >
            <div className='⁂-report-page__account__card'>
              <p>
                <FormattedMessage
                  id='admin.report.target_account'
                  defaultMessage='Reported account'
                />
              </p>
              <Account account={report.target_account} disabled hideActions />
            </div>
          </Link>
        )}
        <table>
          <tbody>
            <tr>
              <td>
                <FormattedMessage id='admin.report.created_at' defaultMessage='Reported' />
              </td>

              <td>
                <FormattedDate
                  value={report.created_at}
                  year='2-digit'
                  month='short'
                  day='2-digit'
                  weekday='short'
                />
              </td>
            </tr>
            {report.account && (
              <tr>
                <td>
                  <FormattedMessage id='admin.report.reported_by' defaultMessage='Reported by' />
                </td>

                <td>
                  <Link
                    to='/nicolium/admin/accounts/$accountId'
                    params={{ accountId: report.account_id }}
                  >
                    @{report.account.acct}
                  </Link>
                </td>
              </tr>
            )}
            <tr>
              <td>
                <FormattedMessage id='admin.report.action_taken' defaultMessage='Status' />
              </td>

              <td>
                {report.action_taken ? (
                  <FormattedMessage id='admin.report.action_taken.true' defaultMessage='Resolved' />
                ) : (
                  <FormattedMessage
                    id='admin.report.action_taken.false'
                    defaultMessage='Unresolved'
                  />
                )}
              </td>
            </tr>
            {report.forwarded !== undefined && (
              <tr>
                <td>
                  {report.forwarded ? (
                    <FormattedMessage id='admin.report.forwarded.true' defaultMessage='Forwarded' />
                  ) : (
                    <FormattedMessage
                      id='admin.report.forwarded.false'
                      defaultMessage='Not forwarded'
                    />
                  )}
                </td>
              </tr>
            )}
            {features.mastodonAdmin && (
              <tr>
                <td>
                  <FormattedMessage
                    id='admin.report.assigned_account'
                    defaultMessage='Assigned moderator'
                  />
                </td>

                <td>
                  {report.assigned_account ? (
                    <div className='⁂-report-page__summary__action'>
                      <Link
                        to='/nicolium/admin/accounts/$accountId'
                        params={{ accountId: report.assigned_account.id }}
                      >
                        @{report.assigned_account.acct}
                      </Link>
                      <IconButton
                        src={iconX}
                        onClick={handleUnassignReport}
                        text={intl.formatMessage(messages.reportUnassign)}
                      />
                    </div>
                  ) : (
                    <IconButton
                      className='ml-auto'
                      src={iconPlus}
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
        <div className='⁂-report-page__statuses__container'>
          <p>
            <FormattedMessage id='admin.report.statuses' defaultMessage='Reported content' />
          </p>
          <ReportStatuses statusIds={report.status_ids} />
        </div>
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
        {features.iceshrimpAdmin && (
          <ListItem
            label={<FormattedMessage id='admin.report.forward' defaultMessage='Forward report' />}
            onClick={handleForwardReport}
            disabled={report.forwarded}
          />
        )}
        <ListItem
          label={<FormattedMessage id='admin.report.moderate' defaultMessage='Moderate account' />}
          to='/nicolium/admin/accounts/$accountId'
          params={{ accountId: report.target_account_id }}
        />
      </List>
    </Column>
  );
};

export { ReportPage as default };
