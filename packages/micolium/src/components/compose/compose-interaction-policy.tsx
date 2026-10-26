import { IconButton } from '@mkljczk/react-native-paper';
import { create } from 'mutative';
import { SlidersIcon } from 'phosphor-react-native/src/icons/Sliders';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { useClient } from '@/contexts/current-account-context';
import { useInteractionPolicies } from '@/queries/settings/use-interaction-policies';
import { useCompose, useComposeActions, useComposeVisibility } from '@/stores/compose';

import {
  InteractionPolicyConfig,
  type Policy,
  type Rule,
  type Scope,
} from '../interaction-policy-config';
import { DialogOrSheet } from '../ui/dialog-or-sheet';
import { iconHelper } from '../ui/icon';

import type { ICompose } from './compose';
import type { CreateStatusParams, InteractionPolicy } from 'pl-api';

const MANAGABLE_VISIBILITIES = new Set(['public', 'unlisted', 'private']);

const messages = defineMessages({
  cancel: { id: 'common.cancel', defaultMessage: 'Cancel' },
  save: { id: 'common.save', defaultMessage: 'Save' },
  label: {
    id: 'compose_form.interaction_policy.label',
    defaultMessage: 'Manage interaction policy',
  },
});

interface IComposeInteractionPolicyDialog extends ICompose {
  visible: boolean;
  onDismiss: () => void;
}

const ComposeInteractionPolicyDialog: React.FC<IComposeInteractionPolicyDialog> = ({
  composeId,
  visible,
  onDismiss,
}) => {
  const client = useClient();
  const intl = useIntl();
  const { updateCompose } = useComposeActions();
  const [closing, setClosing] = React.useState(false);
  const compose = useCompose(composeId);
  const visibility = useComposeVisibility(composeId);

  const [initialQuotePolicy, setInitialQuotePolicy] =
    React.useState<CreateStatusParams['quote_approval_policy']>(undefined);
  const [draftPolicy, setDraftPolicy] = React.useState<InteractionPolicy | null>(null);
  const [draftQuotePolicy, setDraftQuotePolicy] =
    React.useState<CreateStatusParams['quote_approval_policy']>(undefined);
  const { interactionPolicies: initial } = useInteractionPolicies();

  const canManageInteractionPolicies = MANAGABLE_VISIBILITIES.has(visibility);

  React.useEffect(() => {
    if (!canManageInteractionPolicies) {
      onDismiss();
    }

    client.settings
      .verifyCredentials()
      .then((credentialAccount) => {
        setInitialQuotePolicy(credentialAccount.source?.quote_policy ?? 'public');
      })
      .catch(() => {});
  }, []);

  if (!canManageInteractionPolicies) {
    return null;
  }

  const interactionPolicy =
    draftPolicy ?? compose.interactionPolicy ?? initial[visibility as 'public'];
  const quotePolicy = draftQuotePolicy ?? compose.quoteApprovalPolicy ?? initialQuotePolicy;

  const handleClose = () => setClosing(true);

  const onChange = (policy: Policy, rule: Rule, value: Scope[]) => {
    setDraftPolicy(
      create(interactionPolicy, (draft) => {
        draft[policy][rule] = value;
        draft[policy][rule === 'automatic_approval' ? 'manual_approval' : 'automatic_approval'] =
          draft[policy][
            rule === 'automatic_approval' ? 'manual_approval' : 'automatic_approval'
          ].filter((r) => !value.includes(r as Scope));
      }),
    );
  };

  const handleSave = () => {
    updateCompose(composeId, (draft) => {
      if (draftPolicy) draft.interactionPolicy = draftPolicy;
      if (draftQuotePolicy) draft.quoteApprovalPolicy = draftQuotePolicy;
    });
    handleClose();
  };

  return (
    <DialogOrSheet
      visible={visible && !closing}
      handleDismiss={onDismiss}
      title={
        <FormattedMessage
          id='navigation_bar.interaction_policy'
          defaultMessage='Post interaction rules'
        />
      }
      actions={[
        {
          icon: 'arrow.left',
          label: intl.formatMessage(messages.cancel),
          onPress: handleClose,
        },
        {
          icon: 'checkmark',
          label: intl.formatMessage(messages.save),
          onPress: handleSave,
          confirm: true,
        },
      ]}
      forceSheet
    >
      <InteractionPolicyConfig
        interactionPolicy={interactionPolicy}
        onChange={onChange}
        quotePolicy={quotePolicy}
        onQuotePolicyChange={setDraftQuotePolicy}
        visibility={visibility as 'public'}
        singlePost
        style={{ marginTop: -8, marginHorizontal: -16 }}
      />
    </DialogOrSheet>
  );
};

const ComposeInteractionPolicy: React.FC<ICompose> = ({ composeId }) => {
  const intl = useIntl();

  const [visible, setVisible] = React.useState(false);

  return (
    <>
      <IconButton
        icon={iconHelper(SlidersIcon)}
        style={{ marginHorizontal: 0 }}
        onPress={() => setVisible(true)}
        accessibilityLabel={intl.formatMessage(messages.label)}
      />
      {visible && (
        <ComposeInteractionPolicyDialog
          composeId={composeId}
          visible
          onDismiss={() => setVisible(false)}
        />
      )}
    </>
  );
};

export { ComposeInteractionPolicy };
