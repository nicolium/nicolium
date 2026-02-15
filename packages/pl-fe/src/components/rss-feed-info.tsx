import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import RelativeTimestamp from './relative-timestamp';
import Avatar from './ui/avatar';
import HStack from './ui/hstack';
import Icon from './ui/icon';
import Stack from './ui/stack';
import Text from './ui/text';

import type { RssFeed } from 'pl-api';

interface IRssFeedInfo {
  feed: RssFeed;
  timestamp: string;
  timestampUrl?: string;
}

const RssFeedInfo: React.FC<IRssFeedInfo> = ({ feed, timestamp, timestampUrl }) => (
  <div className='group block w-full shrink-0'>
    <HStack alignItems='center' space={3} className='overflow-hidden'>
      <div className='rounded-lg'>
        <Avatar src={feed.image_url || ''} size={42} alt={feed.title || ''} />
      </div>

      <div className='grow overflow-hidden'>
        <HStack space={1} alignItems='center' grow>
          <Text size='sm' weight='semibold' truncate>
            {feed.title}
          </Text>
        </HStack>

        <Stack>
          <HStack alignItems='center' space={1}>
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

            {timestampUrl ? (
              <Link
                to={timestampUrl}
                className='hover:underline'
                onClick={(event) => event.stopPropagation()}
              >
                <RelativeTimestamp
                  timestamp={timestamp}
                  theme='muted'
                  size='sm'
                  className='whitespace-nowrap'
                />
              </Link>
            ) : (
              <RelativeTimestamp
                timestamp={timestamp}
                theme='muted'
                size='sm'
                className='whitespace-nowrap'
              />
            )}
          </HStack>
        </Stack>
      </div>
    </HStack>
  </div>
);

export default RssFeedInfo;
