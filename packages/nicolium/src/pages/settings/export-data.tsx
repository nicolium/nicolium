import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { exportFollows, exportBlocks, exportMutes } from '@/actions/export-data';
import Column from '@/components/ui/column';
import Form from '@/components/ui/form';
import { useCurrentAccount } from '@/contexts/current-account-context';
import { useClient } from '@/hooks/use-client';

interface ICSVExporter {
  inputLabel: React.ReactNode;
  inputHint: React.ReactNode;
  submitText: React.ReactNode;
  action: () => Promise<any>;
}

const CSVExporter: React.FC<ICSVExporter> = ({ inputLabel, inputHint, submitText, action }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick: React.MouseEventHandler = () => {
    setIsLoading(true);
    action()
      .then(() => setIsLoading(false))
      .catch(() => setIsLoading(false));
  };

  return (
    <Form>
      <p className='csv-exporter__label'>{inputLabel}</p>
      <p className='csv-exporter__hint'>{inputHint}</p>

      <div className='csv-exporter__actions'>
        <button onClick={handleClick} disabled={isLoading}>
          {submitText}
        </button>
      </div>
    </Form>
  );
};

const messages = defineMessages({
  heading: { id: 'column.export_data', defaultMessage: 'Export data' },
});

const ExportDataPage = () => {
  const client = useClient();
  const currentAccountId = useCurrentAccount();
  const intl = useIntl();

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <CSVExporter
        action={() => exportFollows(client, currentAccountId as string)}
        inputLabel={<FormattedMessage id='export_data.follows.label' defaultMessage='Follows' />}
        inputHint={
          <FormattedMessage
            id='export_data.hints.follows'
            defaultMessage='Get a CSV file containing a list of followed accounts'
          />
        }
        submitText={
          <FormattedMessage
            id='export_data.actions.export_follows'
            defaultMessage='Export follows'
          />
        }
      />
      <CSVExporter
        action={() => exportBlocks(client)}
        inputLabel={<FormattedMessage id='export_data.blocks.label' defaultMessage='Blocks' />}
        inputHint={
          <FormattedMessage
            id='export_data.hints.blocks'
            defaultMessage='Get a CSV file containing a list of blocked accounts'
          />
        }
        submitText={
          <FormattedMessage id='export_data.actions.export_blocks' defaultMessage='Export blocks' />
        }
      />
      <CSVExporter
        action={() => exportMutes(client)}
        inputLabel={<FormattedMessage id='export_data.mutes.label' defaultMessage='Mutes' />}
        inputHint={
          <FormattedMessage
            id='export_data.hints.mutes'
            defaultMessage='Get a CSV file containing a list of muted accounts'
          />
        }
        submitText={
          <FormattedMessage id='export_data.actions.export_mutes' defaultMessage='Export mutes' />
        }
      />
    </Column>
  );
};

export { ExportDataPage as default };
