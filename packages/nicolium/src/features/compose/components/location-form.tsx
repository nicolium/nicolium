import iconMapPin from '@phosphor-icons/core/regular/map-pin.svg';
import iconX from '@phosphor-icons/core/regular/x.svg';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { ADDRESS_ICONS } from '@/components/autosuggest-location';
import LocationSearch from '@/components/location-search';
import Icon from '@/components/ui/icon';
import IconButton from '@/components/ui/icon-button';
import { useCompose, useComposeActions } from '@/stores/compose';

import type { Location } from 'pl-api';

const messages = defineMessages({
  resetLocation: { id: 'compose_event.reset_location', defaultMessage: 'Reset location' },
});

interface ILocationForm {
  composeId: string;
}

const LocationForm: React.FC<ILocationForm> = ({ composeId }) => {
  const { updateCompose } = useComposeActions();
  const intl = useIntl();

  const { showLocationPicker, location } = useCompose(composeId);

  const onChangeLocation = (loc: Location | null) => {
    updateCompose(composeId, (draft) => {
      draft.location = loc;
    });
  };

  if (!showLocationPicker) {
    return null;
  }

  return (
    <div className='compose-form__schedule'>
      {location ? (
        <div className='compose-form__location'>
          <Icon src={ADDRESS_ICONS[location.type] || iconMapPin} />
          <div className='compose-form__location__text'>
            <span className='compose-form__location__name'>{location.description}</span>
            <span className='compose-form__location__details'>
              {[location.street, location.locality, location.country]
                .filter((val) => val?.trim())
                .join(' · ')}
            </span>
          </div>
          <IconButton
            title={intl.formatMessage(messages.resetLocation)}
            src={iconX}
            onClick={() => {
              onChangeLocation(null);
            }}
          />
        </div>
      ) : (
        <LocationSearch onSelected={onChangeLocation} />
      )}
    </div>
  );
};

export { LocationForm as default };
