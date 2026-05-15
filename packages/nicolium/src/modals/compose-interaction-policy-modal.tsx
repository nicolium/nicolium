import iconArrowLeft from '@phosphor-icons/core/regular/arrow-left.svg';
import { Link } from '@tanstack/react-router';
import { create } from 'mutative';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import Modal from '@/components/ui/modal';
import Warning from '@/features/compose/components/warning';
import { useClient } from '@/hooks/use-client';
import {
  InteractionPolicyConfig,
  type Policy,
  type Rule,
  type Scope,
} from '@/pages/settings/interaction-policies';
import { useInteractionPolicies } from '@/queries/settings/use-interaction-policies';
import { useCompose, useComposeActions } from '@/stores/compose';

import type { BaseModalProps } from '@/features/ui/components/modal-root';
import type { CreateStatusParams, InteractionPolicy } from 'pl-api';

const MANAGABLE_VISIBILITIES = new Set(['public', 'unlisted', 'private']);

interface ComposeInteractionPolicyModalProps {
  composeId: string;
}

const ComposeInteractionPolicyModal: React.FC<
  BaseModalProps & ComposeInteractionPolicyModalProps
> = ({ composeId, onClose }) => {
  const client = useClient();
  const { updateCompose } = useComposeActions();
  const [initialQuotePolicy, setInitialQuotePolicy] =
    useState<CreateStatusParams['quote_approval_policy']>(undefined);
  const { interactionPolicies: initial } = useInteractionPolicies();
  const compose = useCompose(composeId);

  const canManageInteractionPolicies = MANAGABLE_VISIBILITIES.has(compose.visibility);

  useEffect(() => {
    if (!canManageInteractionPolicies) {
      onClose('COMPOSE_INTERACTION_POLICY');
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

  const interactionPolicy = compose.interactionPolicy ?? initial[compose.visibility as 'public'];

  const onClickClose = () => {
    onClose('COMPOSE_INTERACTION_POLICY');
  };

  const onChange = (policy: Policy, rule: Rule, value: Scope[]) => {
    updateCompose(composeId, (draft) => {
      draft.interactionPolicy ??= JSON.parse(JSON.stringify(interactionPolicy))!;

      draft.interactionPolicy = create(
        draft.interactionPolicy ?? interactionPolicy,
        (draftPolicy: InteractionPolicy) => {
          draftPolicy[policy][rule] = value;
          draftPolicy[policy][
            rule === 'automatic_approval' ? 'manual_approval' : 'automatic_approval'
          ] = draftPolicy[policy][
            rule === 'automatic_approval' ? 'manual_approval' : 'automatic_approval'
          ].filter((r) => !value.includes(r as Scope));
        },
      );
    });
  };

  const onQuotePolicyChange = (value: CreateStatusParams['quote_approval_policy']) => {
    updateCompose(composeId, (draft) => {
      draft.quoteApprovalPolicy = value;
    });
  };

  return (
    <Modal
      title={
        <FormattedMessage
          id='navigation_bar.interaction_policy'
          defaultMessage='Post interaction rules'
        />
      }
      onClose={onClickClose}
      closeIcon={composeId === 'compose-modal' ? iconArrowLeft : undefined}
      closePosition={composeId === 'compose-modal' ? 'left' : undefined}
    >
      <div className='flex flex-col gap-4'>
        <Warning
          message={
            <FormattedMessage
              id='interaction_policies.preferences.hint'
              defaultMessage='Control, who can interact with this post. You can also configure the default interaction policies in <link>Preferences > Interaction policies</link>.'
              values={{
                link: (children: React.ReactNode) => (
                  <Link
                    className='font-bold text-gray-800 hover:underline dark:text-gray-200'
                    to={'/settings/interaction_policies'}
                  >
                    {children}
                  </Link>
                ),
              }}
            />
          }
        />
        <InteractionPolicyConfig
          interactionPolicy={interactionPolicy}
          onChange={onChange}
          quotePolicy={initialQuotePolicy}
          onQuotePolicyChange={onQuotePolicyChange}
          visibility={compose.visibility as 'public'}
          singlePost
        />
      </div>
    </Modal>
  );
};

export { ComposeInteractionPolicyModal as default, type ComposeInteractionPolicyModalProps };
