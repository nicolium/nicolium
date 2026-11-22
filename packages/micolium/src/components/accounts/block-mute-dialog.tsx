import { Text, TextInput } from '@mkljczk/react-native-paper';
import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl, type IntlShape } from 'react-intl';

import { useFeatures } from '@/contexts/current-account-context';
import { useAccount } from '@/queries/accounts/use-account';
import {
  useBlockAccountMutation,
  useMuteAccountMutation,
  useUpdateAccountNoteMutation,
} from '@/queries/accounts/use-relationship';
import { toast } from '@/utils/toast';

import { DialogOrSheet } from '../ui/dialog-or-sheet';
import { type IListSections, List } from '../ui/list';

import type { BlockAccountParams, MuteAccountParams } from 'pl-api';

const messages = defineMessages({
  cancel: { id: 'common.cancel', defaultMessage: 'Cancel' },
  muteConfirm: { id: 'confirmations.mute.confirm', defaultMessage: 'Mute' },
  blockConfirm: { id: 'confirmations.block.confirm', defaultMessage: 'Block' },
  notePlaceholder: { id: 'account_note.placeholder', defaultMessage: 'Add a note' },
  noteSaveFailed: { id: 'account_note.fail', defaultMessage: 'Failed to save note' },
  noteLabelAdd: { id: 'mute_modal.note.label.add', defaultMessage: 'Add account note' },
  noteLabelEdit: { id: 'mute_modal.note.label.edit', defaultMessage: 'Edit account note' },
  muteNoteHint: {
    id: 'mute_modal.note.hint',
    defaultMessage:
      'You can leave an optional note to remember why you muted this account. This note is only visible to you.',
  },
  blockNoteHint: {
    id: 'block_modal.note.hint',
    defaultMessage:
      'You can leave an optional note to remember why you blocked this account. This note is only visible to you.',
  },
  duration: { id: 'mute_modal.duration', defaultMessage: 'Duration' },
  days: {
    id: 'intervals.full.days',
    defaultMessage: '{number, plural, one {# day} other {# days}}',
  },
  hours: {
    id: 'intervals.full.hours',
    defaultMessage: '{number, plural, one {# hour} other {# hours}}',
  },
  minutes: {
    id: 'intervals.full.minutes',
    defaultMessage: '{number, plural, one {# minute} other {# minutes}}',
  },
  hideNotifications: {
    id: 'mute_modal.hide_notifications',
    defaultMessage: 'Hide notifications from this user?',
  },
  muteAutoExpire: { id: 'mute_modal.auto_expire', defaultMessage: 'Automatically expire mute?' },
  blockAutoExpire: {
    id: 'block_modal.auto_expire',
    defaultMessage: 'Automatically expire block?',
  },
});

const DURATIONS = [
  5 * 60,
  30 * 60,
  60 * 60,
  6 * 60 * 60,
  12 * 60 * 60,
  24 * 60 * 60,
  3 * 24 * 60 * 60,
  7 * 24 * 60 * 60,
  30 * 24 * 60 * 60,
];

const formatDuration = (intl: IntlShape, seconds: number) => {
  if (seconds % (24 * 60 * 60) === 0) {
    return intl.formatMessage(messages.days, { number: seconds / (24 * 60 * 60) });
  }
  if (seconds % (60 * 60) === 0) {
    return intl.formatMessage(messages.hours, { number: seconds / (60 * 60) });
  }
  return intl.formatMessage(messages.minutes, { number: Math.round(seconds / 60) });
};

interface IBlockMuteDialog {
  action: 'block' | 'mute';
  accountId: string;
  visible: boolean;
  onDismiss: () => void;
  onBlockAndReport?: () => void;
}

const BlockMuteDialog: React.FC<IBlockMuteDialog> = ({ action, accountId, visible, onDismiss }) => {
  const intl = useIntl();
  const { notes, blocksDuration, mutesDuration } = useFeatures();

  const { data: account } = useAccount(accountId, true);
  const [notifications, setNotifications] = useState(true);
  const [duration, setDuration] = useState(0);
  const [note, setNote] = useState<string | undefined>(undefined);
  const [closing, setClosing] = useState(false);

  const { mutate: muteAccount, isPending: isPendingMute } = useMuteAccountMutation(accountId);
  const { mutate: blockAccount, isPending: isPendingBlock } = useBlockAccountMutation(accountId);
  const { mutate: updateAccountNote } = useUpdateAccountNoteMutation(accountId);

  const canSetDuration = action === 'mute' ? mutesDuration : blocksDuration;
  const currentNote = account?.relationship?.note;
  const isSubmitting = isPendingMute || isPendingBlock;

  if (!account) return null;

  const handleClose = () => setClosing(true);

  const section: IListSections[number] = { items: [] };

  if (action === 'mute') {
    section.items.push({
      type: 'toggle',
      label: intl.formatMessage(messages.hideNotifications),
      active: notifications,
      onPress: () => setNotifications((value) => !value),
    });
  }

  if (canSetDuration) {
    section.items.push({
      type: 'toggle',
      label: intl.formatMessage(
        action === 'mute' ? messages.muteAutoExpire : messages.blockAutoExpire,
      ),
      active: duration !== 0,
      onPress: () => setDuration((value) => (value ? 0 : DURATIONS[5])),
    });

    if (duration !== 0) {
      section.items.push({
        type: 'select',
        label: intl.formatMessage(messages.duration),
        active: duration,
        onChange: setDuration,
        options: DURATIONS.map((value) => ({ value, label: formatDuration(intl, value) })),
      });
    }
  }

  const handleSubmit = (callback?: () => void) => {
    if (action === 'mute') {
      const params: MuteAccountParams = { duration: duration || undefined, notifications };
      muteAccount(params, { onSuccess: callback });
    } else {
      const params: BlockAccountParams = { duration: duration || undefined };
      blockAccount(params, { onSuccess: callback });
    }

    if (notes && note !== undefined && note !== currentNote) {
      updateAccountNote(note, {
        onError: () => {
          toast.error(intl.formatMessage(messages.noteSaveFailed));
        },
      });
    }

    handleClose();
  };

  return (
    <DialogOrSheet
      visible={visible && !closing}
      handleDismiss={onDismiss}
      title={
        action === 'mute' ? (
          <FormattedMessage
            id='confirmations.mute.heading'
            defaultMessage='Mute @{name}'
            values={{ name: account.username }}
          />
        ) : (
          <FormattedMessage
            id='confirmations.block.heading'
            defaultMessage='Block @{name}'
            values={{ name: account.username }}
          />
        )
      }
      actions={[
        {
          icon: 'xmark',
          label: intl.formatMessage(messages.cancel),
          onPress: handleClose,
        },
        {
          icon: 'checkmark',
          label: intl.formatMessage(
            action === 'mute' ? messages.muteConfirm : messages.blockConfirm,
          ),
          onPress: () => handleSubmit(),
          loading: isSubmitting,
          disabled: isSubmitting,
          confirm: true,
        },
      ]}
    >
      <Text variant='bodyLarge'>
        {action === 'mute' ? (
          <FormattedMessage
            id='confirmations.mute.message'
            defaultMessage='Are you sure you want to mute {name}?'
            values={{ name: <Text variant='bodyLargeEmphasized'>@{account.acct}</Text> }}
          />
        ) : (
          <FormattedMessage
            id='confirmations.block.message'
            defaultMessage='Are you sure you want to block {name}?'
            values={{ name: <Text variant='bodyLargeEmphasized'>@{account.acct}</Text> }}
          />
        )}
      </Text>

      <List
        sections={section.items.length ? [section] : []}
        style={{ marginHorizontal: -16 }}
        colorVariant='low'
      />

      {notes && (
        <TextInput
          // why it's white/black background ://
          label={intl.formatMessage(currentNote ? messages.noteLabelEdit : messages.noteLabelAdd)}
          value={note ?? currentNote ?? ''}
          onChangeText={setNote}
          placeholder={intl.formatMessage(messages.notePlaceholder)}
          supportingText={intl.formatMessage(
            action === 'mute' ? messages.muteNoteHint : messages.blockNoteHint,
          )}
          variant='outlined'
          multiline
          style={{ backgroundColor: 'transparent' }}
        />
      )}
    </DialogOrSheet>
  );
};

export { BlockMuteDialog, DURATIONS, formatDuration };
