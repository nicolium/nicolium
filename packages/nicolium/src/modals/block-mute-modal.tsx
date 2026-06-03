import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import FormGroup from '@/components/ui/form-group';
import Modal from '@/components/ui/modal';
import Textarea from '@/components/ui/textarea';
import Toggle from '@/components/ui/toggle';
import DurationSelector from '@/features/compose/components/polls/duration-selector';
import { useFeatures } from '@/hooks/use-features';
import { useAccount } from '@/queries/accounts/use-account';
import {
  useBlockAccountMutation,
  useMuteAccountMutation,
  useUpdateAccountNoteMutation,
} from '@/queries/accounts/use-relationship';
import { useModalsActions } from '@/stores/modals';
import toast from '@/toast';

import type { BaseModalProps } from '@/features/ui/components/modal-root';
import type { BlockAccountParams, MuteAccountParams } from 'pl-api';

const messages = defineMessages({
  notePlaceholder: { id: 'account_note.placeholder', defaultMessage: 'Add a note' },
  noteSaveFailed: { id: 'account_note.fail', defaultMessage: 'Failed to save note' },
});

interface BlockMuteModalProps {
  action: 'BLOCK' | 'MUTE';
  accountId: string;
  statusId?: string;
}

const BlockMuteModal: React.FC<BlockMuteModalProps & BaseModalProps> = ({
  accountId,
  statusId,
  onClose,
  action,
}) => {
  const intl = useIntl();

  const { data: account } = useAccount(accountId || undefined, true);
  const [notifications, setNotifications] = useState(true);
  const [duration, setDuration] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [note, setNote] = useState<string | undefined>(undefined);
  const { notes, blocksDuration, mutesDuration } = useFeatures();
  const canSetDuration = action === 'MUTE' ? mutesDuration : blocksDuration;
  const { openModal } = useModalsActions();

  const currentNote = account?.relationship?.note;

  const { mutate: muteAccount } = useMuteAccountMutation(accountId);
  const { mutate: blockAccount } = useBlockAccountMutation(accountId);
  const { mutate: updateAccountNote } = useUpdateAccountNoteMutation(accountId);

  if (!account) return null;

  const handleClick = (callback?: () => void) => {
    setIsSubmitting(true);
    const params: MuteAccountParams | BlockAccountParams = { duration: duration || undefined };
    if (action === 'MUTE') {
      (params as MuteAccountParams).notifications = notifications;
    }
    (action === 'MUTE' ? muteAccount : blockAccount)(params, {
      onSuccess: () => {
        setIsSubmitting(false);
        onClose('BLOCK_MUTE');
        if (callback) callback();
      },
    });
    if (notes && note !== undefined && note !== currentNote) {
      updateAccountNote(note, {
        onError: () => {
          toast.error(messages.noteSaveFailed);
        },
      });
    }
  };

  const handleBlockAndReport = () => {
    handleClick(() => {
      openModal('REPORT', { accountId: account.id, statusIds: statusId ? [statusId] : undefined });
    });
  };

  const handleCancel = () => {
    onClose('BLOCK_MUTE');
  };

  const toggleNotifications = () => {
    setNotifications((notifications) => !notifications);
  };

  const handleChangeMuteDuration = (expiresIn: number): void => {
    setDuration(expiresIn);
  };

  const toggleAutoExpire = () => {
    setDuration(duration ? 0 : 2 * 60 * 60 * 24);
  };

  return (
    <Modal
      title={
        action === 'MUTE' ? (
          <FormattedMessage
            id='confirmations.mute.heading'
            defaultMessage='Mute @{name}'
            values={{ name: account.acct }}
          />
        ) : (
          <FormattedMessage
            id='confirmations.block.heading'
            defaultMessage='Block @{name}'
            values={{ name: account.acct }}
          />
        )
      }
      onClose={handleCancel}
      confirmationAction={() => {
        handleClick();
      }}
      confirmationText={
        action === 'MUTE' ? (
          <FormattedMessage id='confirmations.mute.confirm' defaultMessage='Mute' />
        ) : (
          <FormattedMessage id='confirmations.block.confirm' defaultMessage='Block' />
        )
      }
      confirmationDisabled={isSubmitting}
      secondaryAction={action === 'BLOCK' ? handleBlockAndReport : undefined}
      secondaryText={
        <FormattedMessage
          id='confirmations.block.block_and_report'
          defaultMessage='Block and report'
        />
      }
      secondaryDisabled={isSubmitting}
      cancelText={<FormattedMessage id='confirmation_modal.cancel' defaultMessage='Cancel' />}
      cancelAction={handleCancel}
    >
      <div className='block-mute-modal'>
        <p className='block-mute-modal__message'>
          {action === 'MUTE' ? (
            <FormattedMessage
              id='confirmations.mute.message'
              defaultMessage='Are you sure you want to mute {name}?'
              values={{ name: <strong className='break-words'>@{account.acct}</strong> }}
            />
          ) : (
            <FormattedMessage
              id='confirmations.block.message'
              defaultMessage='Are you sure you want to block {name}?'
              values={{ name: <strong className='break-words'>@{account.acct}</strong> }}
            />
          )}
        </p>

        {action === 'MUTE' && (
          <label className='block-mute-modal__toggle'>
            <span>
              <FormattedMessage
                id='mute_modal.hide_notifications'
                defaultMessage='Hide notifications from this user?'
              />
            </span>

            <Toggle checked={notifications} onChange={toggleNotifications} />
          </label>
        )}

        {notes && (
          <FormGroup
            labelText={
              currentNote ? (
                <FormattedMessage
                  id='mute_modal.note.label.edit'
                  defaultMessage='Edit account note'
                />
              ) : (
                <FormattedMessage
                  id='mute_modal.note.label.add'
                  defaultMessage='Add account note'
                />
              )
            }
            hintText={
              action === 'MUTE' ? (
                <FormattedMessage
                  id='mute_modal.note.hint'
                  defaultMessage='You can leave an optional note to remember why you muted this account. This note is only visible to you.'
                />
              ) : (
                <FormattedMessage
                  id='block_modal.note.hint'
                  defaultMessage='You can leave an optional note to remember why you blocked this account. This note is only visible to you.'
                />
              )
            }
          >
            <Textarea
              value={note ?? currentNote ?? ''}
              onChange={({ target }) => {
                setNote(target.value);
              }}
              autoComplete='off'
              placeholder={intl.formatMessage(messages.notePlaceholder)}
            />
          </FormGroup>
        )}

        {canSetDuration && (
          <>
            <label className='block-mute-modal__toggle'>
              <span>
                {action === 'MUTE' ? (
                  <FormattedMessage
                    id='mute_modal.auto_expire'
                    defaultMessage='Automatically expire mute?'
                  />
                ) : (
                  <FormattedMessage
                    id='block_modal.auto_expire'
                    defaultMessage='Automatically expire block?'
                  />
                )}
              </span>

              <Toggle checked={duration !== 0} onChange={toggleAutoExpire} />
            </label>

            {duration !== 0 && (
              <div className='block-mute-modal__duration'>
                <p>
                  <FormattedMessage id='mute_modal.duration' defaultMessage='Duration' />:{' '}
                </p>

                <DurationSelector onDurationChange={handleChangeMuteDuration} value={duration} />
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

export { BlockMuteModal as default, type BlockMuteModalProps };
