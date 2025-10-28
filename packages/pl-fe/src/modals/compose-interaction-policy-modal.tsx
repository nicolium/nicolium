import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { changeComposeInteractionPolicyOption } from 'pl-fe/actions/compose';
import Modal from 'pl-fe/components/ui/modal';
import Stack from 'pl-fe/components/ui/stack';
import Warning from 'pl-fe/features/compose/components/warning';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useCompose } from 'pl-fe/hooks/use-compose';
import { InteractionPolicyConfig, type Policy, type Rule, type Scope } from 'pl-fe/pages/settings/interaction-policies';
import { useInteractionPolicies } from 'pl-fe/queries/settings/use-interaction-policies';

import type { BaseModalProps } from 'pl-fe/features/ui/components/modal-root';

const MANAGABLE_VISIBILITIES = ['public', 'unlisted', 'private'];

interface ComposeInteractionPolicyModalProps {
  composeId: string;
}

const ComposeInteractionPolicyModal: React.FC<BaseModalProps & ComposeInteractionPolicyModalProps> = ({ composeId, onClose }) => {
  const dispatch = useAppDispatch();
  const { interactionPolicies: initial } = useInteractionPolicies();
  const compose = useCompose(composeId);

  const canManageInteractionPolicies = MANAGABLE_VISIBILITIES.includes(compose.visibility);

  useEffect(() => {
    if (!canManageInteractionPolicies) {
      onClose('COMPOSE_INTERACTION_POLICY');
    }
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
          visibility={compose.visibility as 'public'}
          onChange={onChange}
          singlePost
        />
      </Stack>
    </Modal>
  );
};

export { ComposeInteractionPolicyModal as default, type ComposeInteractionPolicyModalProps };
