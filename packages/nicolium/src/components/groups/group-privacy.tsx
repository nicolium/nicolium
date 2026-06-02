import iconGlobe from '@phosphor-icons/core/regular/globe.svg';
import iconLock from '@phosphor-icons/core/regular/lock.svg';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from '@/components/ui/icon';
import Popover from '@/components/ui/popover';

import type { Group } from 'pl-api';

interface IGroupPolicy {
  group: Pick<Group, 'locked'>;
}

const GroupPrivacy = ({ group }: IGroupPolicy) => (
  <Popover
    content={
      <div className='group-privacy__popover'>
        <div className='group-privacy__popover__icon'>
          <Icon src={group.locked ? iconLock : iconGlobe} />
        </div>

        <div className='group-privacy__popover__body'>
          <p className='group-privacy__popover__title'>
            {group.locked ? (
              <FormattedMessage id='group.privacy.locked.full' defaultMessage='Private group' />
            ) : (
              <FormattedMessage id='group.privacy.public.full' defaultMessage='Public group' />
            )}
          </p>

          <p className='group-privacy__popover__text'>
            {group.locked ? (
              <FormattedMessage
                id='group.privacy.locked.info'
                defaultMessage='Discoverable. Users can join after their request is approved.'
              />
            ) : (
              <FormattedMessage
                id='group.privacy.public.info'
                defaultMessage='Discoverable. Anyone can join.'
              />
            )}
          </p>
        </div>
      </div>
    }
  >
    <div className='group-privacy' data-testid='group-privacy'>
      <Icon src={group.locked ? iconLock : iconGlobe} />

      <p>
        {group.locked ? (
          <FormattedMessage id='group.privacy.locked' defaultMessage='Private' />
        ) : (
          <FormattedMessage id='group.privacy.public' defaultMessage='Public' />
        )}
      </p>
    </div>
  </Popover>
);

export { GroupPrivacy as default };
