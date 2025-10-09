import React from 'react';

import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';

import type { Location } from 'pl-api';

const buildingCommunityIcon = require('@phosphor-icons/core/regular/city.svg');
const homeIcon = require('@phosphor-icons/core/regular/house.svg');
const mapPinIcon = require('@phosphor-icons/core/regular/map-pin.svg');
const roadIcon = require('@phosphor-icons/core/regular/road-horizon.svg');

const ADDRESS_ICONS: Record<string, string> = {
  house: homeIcon,
  street: roadIcon,
  secondary: roadIcon,
  zone: buildingCommunityIcon,
  city: buildingCommunityIcon,
  administrative: buildingCommunityIcon,
};

interface IAutosuggestLocation {
  location: Location;
}

const AutosuggestLocation: React.FC<IAutosuggestLocation> = ({ location }) => {
  if (!location) return null;

  return (
    <HStack alignItems='center' space={2}>
      <Icon src={ADDRESS_ICONS[location.type] || mapPinIcon} />
      <Stack>
        <Text>{location.description}</Text>
        <Text size='xs' theme='muted'>{[location.street, location.locality, location.country].filter(val => val?.trim()).join(' · ')}</Text>
      </Stack>
    </HStack>
  );
};

export { ADDRESS_ICONS, AutosuggestLocation as default };
