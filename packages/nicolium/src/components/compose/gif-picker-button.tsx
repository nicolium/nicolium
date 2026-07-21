import iconGif from '@phosphor-icons/core/regular/gif.svg';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { useModalsActions } from '@/stores/modals';

import ComposeFormButton from './compose-form-button';

const messages = defineMessages({
  button: { id: 'compose_form.gif_button', defaultMessage: 'Search GIFs' },
});

interface IGifPickerButton {
  composeId: string;
}

const GifPickerButton: React.FC<IGifPickerButton> = ({ composeId }) => {
  const intl = useIntl();
  const { openModal } = useModalsActions();

  const onClick = () => {
    openModal('GIF_PICKER', {
      composeId,
    });
  };

  return (
    <ComposeFormButton
      icon={iconGif}
      title={intl.formatMessage(messages.button)}
      onClick={onClick}
    />
  );
};

export { GifPickerButton as default };
