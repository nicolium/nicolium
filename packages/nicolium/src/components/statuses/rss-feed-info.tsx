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
  url: string;
}

const RssFeedInfo: React.FC<IRssFeedInfo> = ({ feed, timestamp, url }) => (
  <div className='⁂-rss-feed-info'>
    <div className='⁂-rss-feed-info__avatar'>
      <Avatar src={feed.image_url || ''} size={42} alt={feed.title || ''} />
    </div>

    <div className='⁂-rss-feed-info__content'>
      <p className='⁂-rss-feed-info__title'>
        {feed.title}

        <a href={url} target='_blank' rel='noopener noreferrer' className='⁂-rss-feed-info__link'>
          <RelativeTimestamp timestamp={timestamp} theme='muted' size='sm' />
        </a>
      </p>

      <div className='⁂-rss-feed-info__details'>
        <p>
          <FormattedMessage id='rss_feed.label' defaultMessage='RSS Feed' />
        </p>

        <Icon src={iconRss} />
      </div>
    </div>
  </div>
);

export default RssFeedInfo;
