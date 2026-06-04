import { Link } from '@tanstack/react-router';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Hashtag from '@/components/hashtag';
import PlaceholderSidebarTrends from '@/components/placeholders/placeholder-sidebar-trends';
import Widget from '@/components/ui/widget';
import useTrendingTags from '@/queries/trends/use-trending-tags';

interface ITrendsPanel {
  limit: number;
}

const TrendsPanel = ({ limit }: ITrendsPanel) => {
  const { data: trends, isFetching } = useTrendingTags();

  if (!isFetching && !trends?.length) {
    return null;
  }

  return (
    <Widget
      title={<FormattedMessage id='trends.title' defaultMessage='Trends' />}
      action={
        <Link className='widget__action-link' to='/search' search={{ type: 'hashtags' }}>
          <FormattedMessage id='trends_panel.view_all' defaultMessage='View all' />
        </Link>
      }
    >
      {isFetching ? (
        <PlaceholderSidebarTrends limit={limit} />
      ) : (
        trends?.slice(0, limit).map((hashtag) => <Hashtag key={hashtag.name} hashtag={hashtag} />)
      )}
    </Widget>
  );
};

export { TrendsPanel as default };
