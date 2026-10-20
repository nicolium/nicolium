import { Card, TextInput } from '@mkljczk/react-native-paper';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { View } from 'react-native';
import { toast } from 'sonner-native';

import { useFeatures, useInstance } from '@/contexts/current-account-context';
import { useAccount } from '@/queries/accounts/use-account';
import { useBlockAccountMutation } from '@/queries/accounts/use-relationship';
import { useReportAccountMutation } from '@/queries/accounts/use-report';
import { getDomain } from '@/utils/accounts';

import { Status } from '../statuses/status';
import { DialogOrSheet, type DialogOrSheetAction } from '../ui/dialog-or-sheet';
import { List } from '../ui/list';

import { Account } from './account';

import type { Account as AccountEntity } from 'pl-api';

const messages = defineMessages({
  cancel: { id: 'common.cancel', defaultMessage: 'Cancel' },
  previous: { id: 'report.previous', defaultMessage: 'Previous' },
  next: { id: 'report.next', defaultMessage: 'Next' },
  submit: { id: 'report.submit', defaultMessage: 'Submit' },
  reason: { id: 'report.reason.title', defaultMessage: 'Reason for reporting' },
  placeholder: { id: 'report.placeholder', defaultMessage: 'Additional comments' },
  furtherActions: { id: 'report.other_actions.further_actions', defaultMessage: 'Further actions' },
  block: { id: 'report.block', defaultMessage: 'Block {target}' },
  forward: { id: 'report.forward', defaultMessage: 'Forward to {target}' },
  submitSuccess: { id: 'report.submit.success', defaultMessage: 'Report submitted' },
  submitFail: { id: 'report.submit.fail', defaultMessage: 'Failed to submit report' },
});

interface IReportDialogFirstStep {
  ruleIds: Array<string>;
  setRuleIds: (value: Array<string>) => void;
  comment: string;
  setComment: (value: string) => void;
}

const ReportDialogFirstStep: React.FC<IReportDialogFirstStep> = ({
  ruleIds,
  setRuleIds,
  comment,
  setComment,
}) => {
  const intl = useIntl();

  const { rules } = useInstance();
  const shouldRequireRule = rules.length > 0;

  return (
    <>
      {shouldRequireRule && (
        <List
          sections={[
            {
              subheader: intl.formatMessage(messages.reason),
              items: rules.map((rule) => ({
                label: rule.text,
                sublabel: rule.hint,
                type: 'toggle',
                active: ruleIds.includes(rule.id),
                onPress: () => {
                  let newRuleIds;
                  if (ruleIds.includes(rule.id))
                    newRuleIds = ruleIds.filter((id) => id !== rule.id);
                  else newRuleIds = [...ruleIds, rule.id];
                  setRuleIds(newRuleIds);
                },
              })),
            },
          ]}
          style={{ marginTop: -8, marginHorizontal: -16 }}
        />
      )}
      <TextInput
        variant='outlined'
        multiline
        label={intl.formatMessage(messages.placeholder)}
        placeholder={intl.formatMessage(messages.placeholder)}
        value={comment}
        onChangeText={setComment}
      />
    </>
  );
};

interface IReportDialogSecondStep {
  account: AccountEntity;
  canForward: boolean;
  block: boolean;
  setBlock: React.Dispatch<React.SetStateAction<boolean>>;
  forward: boolean;
  setForward: React.Dispatch<React.SetStateAction<boolean>>;
}

const ReportDialogSecondStep: React.FC<IReportDialogSecondStep> = ({
  account,
  canForward,
  block,
  setBlock,
  forward,
  setForward,
}) => {
  const intl = useIntl();

  return (
    <List
      sections={[
        {
          subheader: intl.formatMessage(messages.furtherActions),
          items: [
            {
              label: intl.formatMessage(messages.block, {
                target: '@' + account?.acct,
              }),
              type: 'toggle',
              active: block,
              onPress: () => setBlock((value) => !value),
              enabled: account?.relationship?.blocking !== true,
            },
            {
              label: intl.formatMessage(messages.forward, {
                target: account && getDomain(account),
              }),
              type: 'toggle',
              active: forward,
              onPress: () => setForward((value) => !value),
              enabled: canForward,
            },
          ],
        },
      ]}
      style={{ marginTop: -8, marginHorizontal: -16 }}
    />
  );
};

interface IReportDialog {
  accountId: string;
  statusId?: string;
  visible: boolean;
  onDismiss: () => void;
}

const ReportDialog: React.FC<IReportDialog> = ({ accountId, statusId, visible, onDismiss }) => {
  const intl = useIntl();
  const features = useFeatures();

  const { data: account } = useAccount(accountId, true);
  const { mutate: blockAccount } = useBlockAccountMutation(accountId);
  const { mutate: reportAccount, isPending } = useReportAccountMutation(accountId);

  const [step, setStep] = React.useState<0 | 1>(0);
  const [ruleIds, setRuleIds] = React.useState<Array<string>>([]);
  const [comment, setComment] = React.useState('');
  const [block, setBlock] = React.useState(false);
  const [forward, setForward] = React.useState(false);
  const [closing, setClosing] = React.useState(false);

  const handleClose = () => setClosing(true);

  const handleSubmit = () => {
    reportAccount(
      {
        rule_ids: ruleIds.length ? ruleIds : undefined,
        status_ids: statusId ? [statusId] : undefined,
        comment,
        forward: canForward && forward,
      },
      {
        onSuccess: () => {
          toast.success(intl.formatMessage(messages.submitSuccess));
          handleClose();
        },
        onError: () => toast.error(intl.formatMessage(messages.submitFail)),
      },
    );

    if (block) blockAccount(undefined);
  };

  const canForward = !account?.local && features.federating && features.reportForwarding;

  const hasSecondStep = account?.relationship?.blocking !== true || canForward;

  const actions: Array<DialogOrSheetAction> = [
    step === 0
      ? {
          icon: 'xmark',
          label: intl.formatMessage(messages.cancel),
          onPress: handleClose,
        }
      : {
          icon: 'arrow.left',
          label: intl.formatMessage(messages.previous),
          onPress: () => setStep(0),
        },
    hasSecondStep && step === 0
      ? {
          icon: 'arrow.right',
          label: intl.formatMessage(messages.next),
          onPress: () => setStep(1),
        }
      : {
          icon: 'checkmark',
          label: intl.formatMessage(messages.submit),
          onPress: handleSubmit,
          confirm: true,
          loading: isPending,
        },
  ];

  return (
    <DialogOrSheet
      visible={visible && !closing}
      handleDismiss={onDismiss}
      title={
        <FormattedMessage
          id='report.target'
          defaultMessage='Reporting {target}'
          values={{ target: `@${account?.username}` }}
        />
      }
      actions={actions}
    >
      <View style={{ gap: 16 }}>
        <Card mode='outlined'>
          {statusId ? (
            <Status id={statusId} compact withActions={false} textOnly />
          ) : (
            <Account id={accountId} style={{ paddingHorizontal: 16, paddingVertical: 8 }} />
          )}
        </Card>

        {step === 0 ? (
          <ReportDialogFirstStep
            ruleIds={ruleIds}
            setRuleIds={setRuleIds}
            comment={comment}
            setComment={setComment}
          />
        ) : (
          account && (
            <ReportDialogSecondStep
              account={account}
              canForward={canForward}
              block={block}
              setBlock={setBlock}
              forward={forward}
              setForward={setForward}
            />
          )
        )}
      </View>
    </DialogOrSheet>
  );
};

export { ReportDialog };
