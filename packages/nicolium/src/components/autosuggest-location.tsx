import React from 'react';

import Icon from '@/components/ui/icon';
import Text from '@/components/ui/text';

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
    <div className='flex items-center gap-2'>
      <Icon src={ADDRESS_ICONS[location.type] || mapPinIcon} />
      <div className='flex flex-col'>
        <Text>{location.description}</Text>
        <Text size='xs' theme='muted'>
          {[location.street, location.locality, location.country]
            .filter((val) => val?.trim())
            .join(' · ')}
        </Text>
      </div>
    </div>
  );
};

export { ADDRESS_ICONS, AutosuggestLocation as default };
