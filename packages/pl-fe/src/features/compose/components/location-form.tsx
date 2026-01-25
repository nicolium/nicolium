import { Location } from 'pl-api';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { setComposeLocation } from 'pl-fe/actions/compose';
import { ADDRESS_ICONS } from 'pl-fe/components/autosuggest-location';
import LocationSearch from 'pl-fe/components/location-search';
import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import IconButton from 'pl-fe/components/ui/icon-button';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useCompose } from 'pl-fe/hooks/use-compose';

const messages = defineMessages({
  resetLocation: { id: 'compose_event.reset_location', defaultMessage: 'Reset location' },
});

interface ILocationForm {
  composeId: string;
}

const LocationForm: React.FC<ILocationForm> = ({ composeId }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const { showLocationPicker, location } = useCompose(composeId);

  const onChangeLocation = (location: Location | null) => {
    dispatch(setComposeLocation(composeId, location));
  };

  if (!showLocationPicker) {
    return null;
  }

  return (
    <div className='⁂-compose-form__schedule'>
      {location ? (
        <HStack className='h-[38px] text-gray-700 dark:text-gray-500' alignItems='center' space={2}>
          <Icon src={ADDRESS_ICONS[location.type] || require('@phosphor-icons/core/regular/map-pin.svg')} />
          <Stack className='grow'>
            <Text>{location.description}</Text>
            <Text theme='muted' size='xs'>{[location.street, location.locality, location.country].filter(val => val?.trim()).join(' · ')}</Text>
          </Stack>
          <IconButton title={intl.formatMessage(messages.resetLocation)} src={require('@phosphor-icons/core/regular/x.svg')} onClick={() => onChangeLocation(null)} />
        </HStack>
      ) : (
        <LocationSearch
          onSelected={onChangeLocation}
        />
      )}
    </div>
  );
};

export { LocationForm as default };
