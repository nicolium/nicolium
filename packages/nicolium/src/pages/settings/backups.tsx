import React from 'react';
import { FormattedDate, defineMessages, useIntl } from 'react-intl';

import Column from '@/components/ui/column';
import Spinner from '@/components/ui/spinner';
import { useBackups, useCreateBackupMutation } from '@/queries/settings/use-backups';

import type { Backup as BackupEntity } from 'pl-api';

const messages = defineMessages({
  heading: { id: 'column.backups', defaultMessage: 'Backups' },
  create: { id: 'backups.actions.create', defaultMessage: 'Create backup' },
  emptyMessage: { id: 'backups.empty_message', defaultMessage: 'No backups found. {action}' },
  emptyMessageAction: { id: 'backups.empty_message.action', defaultMessage: 'Create one now?' },
  download: { id: 'backups.download', defaultMessage: 'Download' },
  pending: { id: 'backups.pending', defaultMessage: 'Pending' },
});

interface IBackup {
  backup: BackupEntity;
}

const Backup: React.FC<IBackup> = ({ backup }) => {
  const intl = useIntl();

  return (
    <div className='backups-list__item'>
      <div className='backups-list__item__body'>
        <div className='backups-list__item__date'>
          <p>
            <FormattedDate
              value={backup.inserted_at}
              hour12
              year='numeric'
              month='short'
              day='2-digit'
              hour='numeric'
              minute='2-digit'
            />
          </p>
        </div>
        <div className='backups-list__item__actions'>
          {backup.processed ? (
            <a href={backup.url} target='_blank' rel='noopener noreferrer'>
              {intl.formatMessage(messages.download)}
            </a>
          ) : (
            <button disabled>{intl.formatMessage(messages.pending)}</button>
          )}
        </div>
      </div>
    </div>
  );
};

const BackupsPage = () => {
  const intl = useIntl();

  const { data: backups = [], isLoading } = useBackups();
  const { mutate: createBackup } = useCreateBackupMutation();

  const handleCreateBackup: React.MouseEventHandler = (e) => {
    createBackup();
    e.preventDefault();
  };

  const showLoading = isLoading && backups.length === 0;

  const emptyMessage = (
    <div className='settings-empty'>
      {intl.formatMessage(messages.emptyMessage, {
        action: (
          <a href='#' onClick={handleCreateBackup}>
            <span className='settings-empty__action'>
              {intl.formatMessage(messages.emptyMessageAction)}
            </span>
          </a>
        ),
      })}
    </div>
  );

  const body = showLoading ? (
    <Spinner />
  ) : backups.length ? (
    <div className='backups-list'>
      {backups.map((backup) => (
        <Backup key={backup.id} backup={backup} />
      ))}
    </div>
  ) : (
    emptyMessage
  );

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      {body}

      <div className='backups-list__footer form__actions'>
        <button disabled={isLoading} onClick={handleCreateBackup}>
          {intl.formatMessage(messages.create)}
        </button>
      </div>
    </Column>
  );
};

export { BackupsPage as default };
