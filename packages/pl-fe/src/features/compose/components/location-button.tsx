import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { useCompose, useComposeActions } from '@/stores/compose';

import ComposeFormButton from './compose-form-button';

const messages = defineMessages({
  showLocationPicker: {
    id: 'location_button.show_location_picker',
    defaultMessage: 'Show location picker',
  },
  hideLocationPicker: {
    id: 'location_button.hide_location_picker',
    defaultMessage: 'Hide location picker',
  },
});

interface ILocationButton {
  composeId: string;
}

const LocationButton: React.FC<ILocationButton> = ({ composeId }) => {
  const intl = useIntl();
  const { updateCompose } = useComposeActions();

  const compose = useCompose(composeId);

  const unavailable = compose.isUploading;
  const active = compose.showLocationPicker;

  const onClick = () => {
    updateCompose(composeId, (draft) => {
      draft.showLocationPicker = !draft.showLocationPicker;
      if (!draft.showLocationPicker) {
        draft.location = null;
      }
    });
  };

  if (unavailable) {
    return null;
  }

  return (
    <ComposeFormButton
      icon={require('@phosphor-icons/core/regular/map-pin.svg')}
      title={intl.formatMessage(active ? messages.hideLocationPicker : messages.showLocationPicker)}
      active={active}
      onClick={onClick}
    />
  );
};

export { LocationButton as default };
