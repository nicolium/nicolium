import React, { useState } from 'react';
import { defineMessages, useIntl, type MessageDescriptor } from 'react-intl';

import { exportFollows, exportBlocks, exportMutes } from '@/actions/export-data';
import Button from '@/components/ui/button';
import Column from '@/components/ui/column';
import Form from '@/components/ui/form';
import FormActions from '@/components/ui/form-actions';
import Text from '@/components/ui/text';
import { useAppDispatch } from '@/hooks/use-app-dispatch';

import type { AppDispatch, RootState } from '@/store';

interface ICSVExporter {
  messages: {
    input_label: MessageDescriptor;
    input_hint: MessageDescriptor;
    submit: MessageDescriptor;
  };
  action: () => (dispatch: AppDispatch, getState: () => RootState) => Promise<any>;
}

const CSVExporter: React.FC<ICSVExporter> = ({ messages, action }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const [isLoading, setIsLoading] = useState(false);

  const handleClick: React.MouseEventHandler = (event) => {
    setIsLoading(true);
    dispatch(action())
      .then(() => {
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  };

  return (
    <Form>
      <Text size='xl' weight='bold'>
        {intl.formatMessage(messages.input_label)}
      </Text>
      <Text theme='muted'>{intl.formatMessage(messages.input_hint)}</Text>

      <FormActions>
        <Button theme='primary' onClick={handleClick} disabled={isLoading}>
          {intl.formatMessage(messages.submit)}
        </Button>
      </FormActions>
    </Form>
  );
};

const messages = defineMessages({
  heading: { id: 'column.export_data', defaultMessage: 'Export data' },
  submit: { id: 'export_data.actions.export', defaultMessage: 'Export' },
});

const followMessages = defineMessages({
  input_label: { id: 'export_data.follows_label', defaultMessage: 'Follows' },
  input_hint: {
    id: 'export_data.hints.follows',
    defaultMessage: 'Get a CSV file containing a list of followed accounts',
  },
  submit: { id: 'export_data.actions.export_follows', defaultMessage: 'Export follows' },
});

const blockMessages = defineMessages({
  input_label: { id: 'export_data.blocks_label', defaultMessage: 'Blocks' },
  input_hint: {
    id: 'export_data.hints.blocks',
    defaultMessage: 'Get a CSV file containing a list of blocked accounts',
  },
  submit: { id: 'export_data.actions.export_blocks', defaultMessage: 'Export blocks' },
});

const muteMessages = defineMessages({
  input_label: { id: 'export_data.mutes_label', defaultMessage: 'Mutes' },
  input_hint: {
    id: 'export_data.hints.mutes',
    defaultMessage: 'Get a CSV file containing a list of muted accounts',
  },
  submit: { id: 'export_data.actions.export_mutes', defaultMessage: 'Export mutes' },
});

const ExportDataPage = () => {
  const intl = useIntl();

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <CSVExporter action={exportFollows} messages={followMessages} />
      <CSVExporter action={exportBlocks} messages={blockMessages} />
      <CSVExporter action={exportMutes} messages={muteMessages} />
    </Column>
  );
};

export { ExportDataPage as default };
