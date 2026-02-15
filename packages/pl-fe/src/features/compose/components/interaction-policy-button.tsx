import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { useCompose } from '@/hooks/use-compose';
import { useModalsActions } from '@/stores/modals';

import ComposeFormButton from './compose-form-button';

const messages = defineMessages({
  label: {
    id: 'compose_form.interaction_policy.label',
    defaultMessage: 'Manage interaction policy',
  },
});

interface IInteractionPolicyButton {
  composeId: string;
}

const InteractionPolicyButton: React.FC<IInteractionPolicyButton> = ({ composeId }) => {
  const intl = useIntl();

  const { openModal } = useModalsActions();

  const handleClick = () => {
    openModal('COMPOSE_INTERACTION_POLICY', {
      composeId,
    });
  };

  const { visibility, interactionPolicy } = useCompose(composeId);

  if (!['public', 'unlisted', 'private'].includes(visibility)) return null;

  return (
    <ComposeFormButton
      icon={require('@phosphor-icons/core/regular/sliders.svg')}
      title={intl.formatMessage(messages.label)}
      onClick={handleClick}
      active={!!interactionPolicy}
    />
  );
};

export { InteractionPolicyButton as default };
