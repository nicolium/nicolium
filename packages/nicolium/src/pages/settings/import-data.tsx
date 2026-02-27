import { serialize } from 'object-to-formdata';
import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import List, { ListItem } from '@/components/list';
import Button from '@/components/ui/button';
import Column from '@/components/ui/column';
import FileInput from '@/components/ui/file-input';
import Form from '@/components/ui/form';
import FormActions from '@/components/ui/form-actions';
import FormGroup from '@/components/ui/form-group';
import Text from '@/components/ui/text';
import Toggle from '@/components/ui/toggle';
import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import toast from '@/toast';

const messages = defineMessages({
  heading: { id: 'column.import_data', defaultMessage: 'Import data' },
  submit: { id: 'import_data.actions.import', defaultMessage: 'Import' },
  blocksSuccess: {
    id: 'import_data.success.blocks',
    defaultMessage: 'Blocks imported successfully',
  },
  followersSuccess: {
    id: 'import_data.success.followers',
    defaultMessage: 'Followers imported successfully',
  },
  mutesSuccess: { id: 'import_data.success.mutes', defaultMessage: 'Mutes imported successfully' },
  archiveSuccess: {
    id: 'import_data.success.archive',
    defaultMessage: 'Archive imported successfully',
  },
});

interface IDataImporter {
  inputLabel: React.ReactNode;
  inputHint: React.ReactNode;
  submitText: React.ReactNode;
  action: (list: File, overwrite?: boolean) => Promise<void>;
  accept?: string;
  allowOverwrite?: boolean;
}

const DataImporter: React.FC<IDataImporter> = ({
  inputLabel,
  inputHint,
  submitText,
  action,
  accept = '.csv,text/csv',
  allowOverwrite,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null | undefined>(null);
  const [overwrite, setOverwrite] = useState(false);

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (event) => {
    setIsLoading(true);
    action(file!, overwrite)
      .then(() => {
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });

    event.preventDefault();
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.item(0);
    setFile(file);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Text size='xl' weight='bold' tag='label'>
        {inputLabel}
      </Text>
      <FormGroup hintText={<Text theme='muted'>{inputHint}</Text>}>
        <FileInput accept={accept} onChange={handleFileChange} required />
      </FormGroup>

      {allowOverwrite && (
        <List>
          <ListItem
            label={
              <FormattedMessage
                id='import_data.overwrite'
                defaultMessage='Overwrite instead of appending'
              />
            }
          >
            <Toggle
              checked={overwrite}
              onChange={({ target }) => {
                setOverwrite(target.checked);
              }}
            />
          </ListItem>
        </List>
      )}

      <FormActions>
        <Button type='submit' theme='primary' disabled={isLoading || !file}>
          {submitText}
        </Button>
      </FormActions>
    </Form>
  );
};

const ImportDataPage = () => {
  const client = useClient();
  const intl = useIntl();
  const features = useFeatures();

  const importFollows = (list: File | string, overwrite?: boolean) =>
    client.settings.importFollows(list, overwrite ? 'overwrite' : 'merge').then(() => {
      toast.success(messages.followersSuccess);
    });

  const importBlocks = (list: File | string, overwrite?: boolean) =>
    client.settings.importBlocks(list, overwrite ? 'overwrite' : 'merge').then(() => {
      toast.success(messages.blocksSuccess);
    });

  const importMutes = (list: File | string) =>
    client.settings.importMutes(list).then(() => {
      toast.success(messages.mutesSuccess);
    });

  const importArchive = (file: File) => {
    const form = serialize({ file, keep_unlisted: true }, { indices: true });

    return client
      .request('/api/pleroma/archive_import', {
        method: 'POST',
        body: form,
        contentType: '',
      })
      .then(() => {
        toast.success(messages.archiveSuccess);
      });
  };

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      {features.importFollows && (
        <DataImporter
          action={importFollows}
          inputLabel={<FormattedMessage id='import_data.follows_label' defaultMessage='Follows' />}
          inputHint={
            <FormattedMessage
              id='import_data.hints.follows'
              defaultMessage='CSV file containing a list of followed accounts'
            />
          }
          submitText={
            <FormattedMessage
              id='import_data.actions.import_follows'
              defaultMessage='Import follows'
            />
          }
          allowOverwrite={features.importOverwrite}
        />
      )}
      {features.importBlocks && (
        <DataImporter
          action={importBlocks}
          inputLabel={<FormattedMessage id='import_data.blocks_label' defaultMessage='Blocks' />}
          inputHint={
            <FormattedMessage
              id='import_data.hints.blocks'
              defaultMessage='CSV file containing a list of blocked accounts'
            />
          }
          submitText={
            <FormattedMessage
              id='import_data.actions.import_blocks'
              defaultMessage='Import blocks'
            />
          }
          allowOverwrite={features.importOverwrite}
        />
      )}
      {features.importMutes && (
        <DataImporter
          action={importMutes}
          inputLabel={<FormattedMessage id='import_data.mutes_label' defaultMessage='Mutes' />}
          inputHint={
            <FormattedMessage
              id='import_data.hints.mutes'
              defaultMessage='CSV file containing a list of muted accounts'
            />
          }
          submitText={
            <FormattedMessage id='import_data.actions.import_mutes' defaultMessage='Import mutes' />
          }
          allowOverwrite={features.importOverwrite}
        />
      )}
      {features.importArchive && (
        <DataImporter
          action={importArchive}
          inputLabel={<FormattedMessage id='import_data.archive_label' defaultMessage='Archive' />}
          inputHint={
            <FormattedMessage
              id='import_data.hints.archive'
              defaultMessage='File containing an archive of statuses'
            />
          }
          submitText={
            <FormattedMessage
              id='import_data.actions.import_archive'
              defaultMessage='Import archive'
            />
          }
          accept='.tar,.tar.gz,.zip'
        />
      )}
    </Column>
  );
};

export { ImportDataPage as default };
