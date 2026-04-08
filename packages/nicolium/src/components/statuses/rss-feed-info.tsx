import iconRss from '@phosphor-icons/core/regular/rss.svg';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import RelativeTimestamp from '../relative-timestamp';
import Avatar from '../ui/avatar';
import Icon from '../ui/icon';

import type { RssFeed } from 'pl-api';

interface IRssFeedInfo {
  feed: RssFeed;
  timestamp: string;
}

const RssFeedInfo: React.FC<IRssFeedInfo> = ({ feed, timestamp }) => (
  <div className='⁂-rss-feed-info'>
    <div className='⁂-rss-feed-info__avatar'>
      <Avatar src={feed.image_url || ''} size={42} alt={feed.title || ''} />
    </div>

    <div className='⁂-rss-feed-info__content'>
      <p className='⁂-rss-feed-info__title'>{feed.title}</p>

      <div className='flex items-center gap-1 text-gray-700 dark:text-gray-600'>
        <p>
          <FormattedMessage id='rss_feed.label' defaultMessage='RSS Feed' />
        </p>

        <Icon src={iconRss} />

        <span aria-hidden>&middot;</span>

        <RelativeTimestamp
          timestamp={timestamp}
          theme='muted'
          size='sm'
          className='whitespace-nowrap'
        />
      </div>
    </div>
  </div>
);

export default RssFeedInfo;
