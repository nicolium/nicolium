import { Link } from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { changeComposeInteractionPolicyOption, changeComposeQuotePolicyOption } from '@/actions/compose';
import Modal from '@/components/ui/modal';
import Stack from '@/components/ui/stack';
import Warning from '@/features/compose/components/warning';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useClient } from '@/hooks/use-client';
import { useCompose } from '@/hooks/use-compose';
import { InteractionPolicyConfig, type Policy, type Rule, type Scope } from '@/pages/settings/interaction-policies';
import { useInteractionPolicies } from '@/queries/settings/use-interaction-policies';

import type { BaseModalProps } from '@/features/ui/components/modal-root';
import type { CreateStatusParams } from 'pl-api';

const MANAGABLE_VISIBILITIES = ['public', 'unlisted', 'private'];

interface ComposeInteractionPolicyModalProps {
  composeId: string;
}

const ComposeInteractionPolicyModal: React.FC<BaseModalProps & ComposeInteractionPolicyModalProps> = ({ composeId, onClose }) => {
  const client = useClient();
  const dispatch = useAppDispatch();
  const [initialQuotePolicy, setInitialQuotePolicy] = useState<CreateStatusParams['quote_approval_policy']>(undefined);
  const { interactionPolicies: initial } = useInteractionPolicies();
  const compose = useCompose(composeId);

  const canManageInteractionPolicies = MANAGABLE_VISIBILITIES.includes(compose.visibility);

  useEffect(() => {
    if (!canManageInteractionPolicies) {
      onClose('COMPOSE_INTERACTION_POLICY');
    }

    client.settings.verifyCredentials().then((credentialAccount) => {
      setInitialQuotePolicy(credentialAccount.source?.quote_policy || 'public');
    }).catch(() => {});
  }, []);

  if (!canManageInteractionPolicies) {

    return null;
  }

  const interactionPolicy = (compose.interactionPolicy || initial[compose.visibility as 'public']);

  const onClickClose = () => {
    onClose('COMPOSE_INTERACTION_POLICY');
  };

  const onChange = (policy: Policy, rule: Rule, value: Scope[]) => {
    dispatch(changeComposeInteractionPolicyOption(composeId, policy, rule, value, interactionPolicy));
  };

  const onQuotePolicyChange = (value: CreateStatusParams['quote_approval_policy']) => {
    dispatch(changeComposeQuotePolicyOption(composeId, value));
  };

  return (
    <Modal
      title={<FormattedMessage id='navigation_bar.interaction_policy' defaultMessage='Status interaction rules' />}
      onClose={onClickClose}
      closeIcon={composeId === 'compose-modal' ? require('@phosphor-icons/core/regular/arrow-left.svg') : undefined}
      closePosition={composeId === 'compose-modal' ? 'left' : undefined}
    >
      <Stack space={4}>
        <Warning
          message={
            <FormattedMessage
              id='interaction_policies.preferences_hint'
              defaultMessage='Control, who can interact with this post. You can also configure the default interaction policies in <link>Preferences > Interaction policies</link>.'
              values={{
                link: (children: React.ReactNode) => (
                  <Link className='font-bold text-gray-800 hover:underline dark:text-gray-200' to={'/settings/interaction_policies'}>
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
      </Stack>
    </Modal>
  );
};

export { ComposeInteractionPolicyModal as default, type ComposeInteractionPolicyModalProps };
