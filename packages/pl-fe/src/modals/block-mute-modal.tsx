import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { initReport, ReportableEntities } from 'pl-fe/actions/reports';
import { useAccount } from 'pl-fe/api/hooks/accounts/use-account';
import FormGroup from 'pl-fe/components/ui/form-group';
import HStack from 'pl-fe/components/ui/hstack';
import Modal from 'pl-fe/components/ui/modal';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import Textarea from 'pl-fe/components/ui/textarea';
import Toggle from 'pl-fe/components/ui/toggle';
import DurationSelector from 'pl-fe/features/compose/components/polls/duration-selector';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useBlockAccountMutation, useMuteAccountMutation, useUpdateAccountNoteMutation } from 'pl-fe/queries/accounts/use-relationship';
import toast from 'pl-fe/toast';

import type { BlockAccountParams, MuteAccountParams } from 'pl-api';
import type { BaseModalProps } from 'pl-fe/features/ui/components/modal-root';

const messages = defineMessages({
  notePlaceholder: { id: 'account_note.placeholder', defaultMessage: 'Add a note' },
  noteSaveFailed: { id: 'account_note.fail', defaultMessage: 'Failed to save note' },
});

interface BlockMuteModalProps {
  action: 'BLOCK' | 'MUTE';
  accountId: string;
  statusId?: string;
}

const BlockMuteModal: React.FC<BlockMuteModalProps & BaseModalProps> = ({ accountId, statusId, onClose, action }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const { account } = useAccount(accountId || undefined, { withRelationship: true });
  const [notifications, setNotifications] = useState(true);
  const [duration, setDuration] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [note, setNote] = useState<string | undefined>(undefined);
  const { notes, blocksDuration, mutesDuration } = useFeatures();
  const canSetDuration = action === 'MUTE' ? mutesDuration : blocksDuration;

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
        onError: () => toast.error(messages.noteSaveFailed),
      });
    }
  };

  const handleBlockAndReport = () => {
    handleClick(() => dispatch(initReport(ReportableEntities.STATUS, account, { statusId })));
  };

  const handleCancel = () => {
    onClose('BLOCK_MUTE');
  };

  const toggleNotifications = () => {
    setNotifications(notifications => !notifications);
  };

  const handleChangeMuteDuration = (expiresIn: number): void => {
    setDuration(expiresIn);
  };

  const toggleAutoExpire = () => setDuration(duration ? 0 : 2 * 60 * 60 * 24);

  return (
    <Modal
      title={action === 'MUTE' ? (
        <FormattedMessage id='confirmations.mute.heading' defaultMessage='Mute @{name}' values={{ name: account.acct }} />
      ) : (
        <FormattedMessage id='confirmations.block.heading' defaultMessage='Block @{name}' values={{ name: account.acct }} />
      )}
      onClose={handleCancel}
      confirmationAction={() => handleClick()}
      confirmationText={action === 'MUTE' ? (
        <FormattedMessage id='confirmations.mute.confirm' defaultMessage='Mute' />
      ) : (
        <FormattedMessage id='confirmations.block.confirm' defaultMessage='Block' />
      )}
      confirmationDisabled={isSubmitting}
      secondaryAction={action === 'BLOCK' ? handleBlockAndReport : undefined}
      secondaryText={<FormattedMessage id='confirmations.block.block_and_report' defaultMessage='Block and report' />}
      secondaryDisabled={isSubmitting}
      cancelText={<FormattedMessage id='confirmation_modal.cancel' defaultMessage='Cancel' />}
      cancelAction={handleCancel}
    >
      <Stack space={4}>
        <Text>
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
        </Text>

        {action === 'MUTE' && (
          <label>
            <HStack alignItems='center' space={2}>
              <Text tag='span' theme='muted'>
                <FormattedMessage id='mute_modal.hide_notifications' defaultMessage='Hide notifications from this user?' />
              </Text>

              <Toggle
                checked={notifications}
                onChange={toggleNotifications}
              />
            </HStack>
          </label>
        )}

        {notes && (
          <FormGroup
            labelText={(
              currentNote ? (
                <FormattedMessage id='mute_modal.note.label.edit' defaultMessage='Edit account note' />
              ) : (
                <FormattedMessage id='mute_modal.note.label.add' defaultMessage='Add account note' />
              )
            )}
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
              className='mt-1'
              value={note === undefined ? currentNote || '' : note}
              onChange={({ target }) => setNote(target.value)}
              autoComplete='off'
              placeholder={intl.formatMessage(messages.notePlaceholder)}
            />
          </FormGroup>
        )}

        {canSetDuration && (
          <>
            <label>
              <HStack alignItems='center' space={2}>
                <Text tag='span'>
                  {action === 'MUTE' ? (
                    <FormattedMessage id='mute_modal.auto_expire' defaultMessage='Automatically expire mute?' />
                  ) : (
                    <FormattedMessage id='block_modal.auto_expire' defaultMessage='Automatically expire block?' />
                  )}
                </Text>

                <Toggle
                  checked={duration !== 0}
                  onChange={toggleAutoExpire}
                />
              </HStack>
            </label>

            {duration !== 0 && (
              <Stack space={2}>
                <Text weight='medium'><FormattedMessage id='mute_modal.duration' defaultMessage='Duration' />: </Text>

                <DurationSelector onDurationChange={handleChangeMuteDuration} value={duration} />
              </Stack>
            )}
          </>
        )}
      </Stack>
    </Modal>
  );
};

export { BlockMuteModal as default, type BlockMuteModalProps };
