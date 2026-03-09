import React from 'react';
import { FormattedMessage } from 'react-intl';

import RelativeTimestamp from '../relative-timestamp';
import Avatar from '../ui/avatar';
import Icon from '../ui/icon';
import Text from '../ui/text';

import type { RssFeed } from 'pl-api';

interface IRssFeedInfo {
  feed: RssFeed;
  timestamp: string;
}

const RssFeedInfo: React.FC<IRssFeedInfo> = ({ feed, timestamp }) => (
  <div className='group block w-full shrink-0'>
    <div className='flex items-center gap-3 overflow-hidden'>
      <div className='rounded-lg'>
        <Avatar src={feed.image_url || ''} size={42} alt={feed.title || ''} />
      </div>

      <div className='grow overflow-hidden'>
        <div className='flex flex-grow items-center gap-1'>
          <Text size='sm' weight='semibold' truncate>
            {feed.title}
          </Text>
        </div>

        <div className='flex items-center gap-1'>
          <Text theme='muted' size='sm'>
            <FormattedMessage id='rss_feed.label' defaultMessage='RSS Feed' />
          </Text>

          <Icon
            className='size-4 text-gray-700 dark:text-gray-600'
            src={require('@phosphor-icons/core/regular/rss.svg')}
          />

          <Text tag='span' theme='muted' size='sm'>
            &middot;
          </Text>

          <RelativeTimestamp
            timestamp={timestamp}
            theme='muted'
            size='sm'
            className='whitespace-nowrap'
          />
        </div>
      </div>
    </div>
  </div>
);

export default RssFeedInfo;
