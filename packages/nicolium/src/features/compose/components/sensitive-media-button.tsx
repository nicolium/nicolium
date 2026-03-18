import iconWarning from '@phosphor-icons/core/regular/warning.svg';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { useCompose, useComposeActions } from '@/stores/compose';

import ComposeFormButton from './compose-form-button';

const messages = defineMessages({
  marked: { id: 'compose_form.sensitive.marked', defaultMessage: 'Media is marked as sensitive' },
  unmarked: {
    id: 'compose_form.sensitive.unmarked',
    defaultMessage: 'Media is not marked as sensitive',
  },
});

interface ISensitiveMediaButton {
  composeId: string;
}

const SensitiveMediaButton: React.FC<ISensitiveMediaButton> = ({ composeId }) => {
  const intl = useIntl();
  const { updateCompose } = useComposeActions();

  const active = useCompose(composeId).sensitive;

  const onClick = () =>
    updateCompose(composeId, (draft) => {
      draft.sensitive = !draft.sensitive;
    });

  return (
    <ComposeFormButton
      icon={iconWarning}
      title={intl.formatMessage(active ? messages.marked : messages.unmarked)}
      active={active}
      onClick={onClick}
    />
  );
};

export { SensitiveMediaButton as default };
