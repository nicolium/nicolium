import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { ADDRESS_ICONS } from '@/components/autosuggest-location';
import LocationSearch from '@/components/location-search';
import Icon from '@/components/ui/icon';
import IconButton from '@/components/ui/icon-button';
import Text from '@/components/ui/text';
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
    <div className='⁂-compose-form__schedule'>
      {location ? (
        <div className='flex h-[38px] items-center gap-2 text-gray-700 dark:text-gray-500'>
          <Icon
            src={
              ADDRESS_ICONS[location.type] || require('@phosphor-icons/core/regular/map-pin.svg')
            }
          />
          <div className='flex grow flex-col'>
            <Text>{location.description}</Text>
            <Text theme='muted' size='xs'>
              {[location.street, location.locality, location.country]
                .filter((val) => val?.trim())
                .join(' · ')}
            </Text>
          </div>
          <IconButton
            title={intl.formatMessage(messages.resetLocation)}
            src={require('@phosphor-icons/core/regular/x.svg')}
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
