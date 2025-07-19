import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Column from 'pl-fe/components/ui/column';
import { useReport } from 'pl-fe/queries/admin/use-reports';

const messages = defineMessages({
  columnHeading: { id: 'column.report', defaultMessage: 'Report #{id}' },
});

type RouteParams = { reportId: string };

interface IReportPage {
  params: RouteParams;
}

const ReportPage: React.FC<IReportPage> = ({ params }) => {
  const intl = useIntl();
  const { data: report } = useReport(params.reportId);

  return (
    <Column label={intl.formatMessage(messages.columnHeading, { id: params.reportId })}>
      {report?.category}
    </Column>
  );
};

export { ReportPage as default };
