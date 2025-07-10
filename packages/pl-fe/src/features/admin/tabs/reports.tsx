import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import ScrollableList from 'pl-fe/components/scrollable-list';
import { useReports } from 'pl-fe/queries/admin/use-reports';

import Report from '../components/report';

const messages = defineMessages({
  heading: { id: 'column.admin.reports', defaultMessage: 'Reports' },
  modlog: { id: 'column.admin.reports.menu.moderation_log', defaultMessage: 'Moderation log' },
  emptyMessage: { id: 'admin.reports.empty_message', defaultMessage: 'There are no open reports. If a user gets reported, they will show up here.' },
});

const Reports: React.FC = () => {
  const intl = useIntl();

  const { data: reportIds = [], isPending } = useReports({
    resolved: false,
  });

  return (
    <ScrollableList
      scrollKey='adminReports'
      isLoading={isPending}
      showLoading={isPending}
      emptyMessage={intl.formatMessage(messages.emptyMessage)}
      listClassName='divide-y divide-solid divide-gray-200 dark:divide-gray-800'
    >
      {reportIds.map(report => report && <Report id={report} key={report} />)}
    </ScrollableList>
  );
};

export { Reports as default };
