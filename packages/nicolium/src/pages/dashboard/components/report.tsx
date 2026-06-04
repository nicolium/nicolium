import { Link } from '@tanstack/react-router';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import HoverAccountWrapper from '@/components/accounts/hover-account-wrapper';
import Avatar from '@/components/ui/avatar';
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
      className='admin-report-card'
    >
      <div className='admin-report-card__body'>
        {report.target_account && (
          <HoverAccountWrapper accountId={report.target_account.id} element='span'>
            <div className='admin-report-card__target'>
              <Avatar
                src={report.target_account.avatar}
                alt={report.target_account.avatar_description}
                size={40}
                isCat={report.target_account.is_cat}
                username={report.target_account.username}
              />
              <div className='admin-report-card__account-info'>
                <p className='admin-report-card__account-info__display-name' dir='ltr'>
                  <Emojify
                    text={report.target_account.display_name}
                    emojis={report.target_account.emojis}
                  />
                </p>
                <p className='admin-report-card__account-info__acct' dir='ltr'>
                  @{report.target_account.fqn}
                </p>
              </div>
            </div>
          </HoverAccountWrapper>
        )}

        {!!account && (
          <div className='admin-report-card__meta'>
            <p>
              <FormattedMessage id='admin.reports.account' defaultMessage='Reported by:' />
            </p>
            <HoverAccountWrapper accountId={account.id} element='span'>
              <Link to='/nicolium/admin/accounts/$accountId' params={{ accountId: account.id }}>
                @{reporterAcct}
              </Link>
            </HoverAccountWrapper>
          </div>
        )}

        {!!report.comment && report.comment.length > 0 && (
          <div className='admin-report-card__meta'>
            <p>
              <FormattedMessage id='admin.reports.comment' defaultMessage='Comment:' />
            </p>
            {report.comment}
          </div>
        )}

        {statusCount > 0 && (
          <div className='admin-report-card__meta'>
            <p>
              <FormattedMessage id='admin.reports.statuses' defaultMessage='Reported posts:' />
            </p>
            {statusCount}
          </div>
        )}
      </div>
    </Link>
  );
};

export { Report as default };
