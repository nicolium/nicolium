import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { setComposeShowLocationPicker } from '@/actions/compose';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useCompose } from '@/hooks/use-compose';

import ComposeFormButton from './compose-form-button';

const messages = defineMessages({
  show_location_picker: {
    id: 'location_button.show_location_picker',
    defaultMessage: 'Show location picker',
  },
  hide_location_picker: {
    id: 'location_button.hide_location_picker',
    defaultMessage: 'Hide location picker',
  },
});

interface ILocationButton {
  composeId: string;
}

const LocationButton: React.FC<ILocationButton> = ({ composeId }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const compose = useCompose(composeId);

  const unavailable = compose.isUploading;
  const active = compose.showLocationPicker;

  const onClick = () => {
    if (active) {
      dispatch(setComposeShowLocationPicker(composeId, false));
    } else {
      dispatch(setComposeShowLocationPicker(composeId, true));
    }
  };

  if (unavailable) {
    return null;
  }

  return (
    <ComposeFormButton
      icon={require('@phosphor-icons/core/regular/map-pin.svg')}
      title={intl.formatMessage(
        active ? messages.hide_location_picker : messages.show_location_picker,
      )}
      active={active}
      onClick={onClick}
    />
  );
};

export { LocationButton as default };
