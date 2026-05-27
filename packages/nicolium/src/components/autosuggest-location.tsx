import buildingCommunityIcon from '@phosphor-icons/core/regular/city.svg';
import homeIcon from '@phosphor-icons/core/regular/house.svg';
import mapPinIcon from '@phosphor-icons/core/regular/map-pin.svg';
import roadIcon from '@phosphor-icons/core/regular/road-horizon.svg';
import React from 'react';

import Icon from '@/components/ui/icon';

import type { Location } from 'pl-api';

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
    <div className='autosuggest-location'>
      <Icon src={ADDRESS_ICONS[location.type] || mapPinIcon} />
      <div>
        <p>{location.description}</p>
        <p>
          {[location.street, location.locality, location.country]
            .filter((val) => val?.trim())
            .join(' · ')}
        </p>
      </div>
    </div>
  );
};

export { ADDRESS_ICONS, AutosuggestLocation as default };
