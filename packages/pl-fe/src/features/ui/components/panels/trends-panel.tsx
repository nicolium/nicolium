import { Link } from '@tanstack/react-router';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Hashtag from '@/components/hashtag';
import Text from '@/components/ui/text';
import Widget from '@/components/ui/widget';
import PlaceholderSidebarTrends from '@/features/placeholder/components/placeholder-sidebar-trends';
import useTrends from '@/queries/trends';

interface ITrendsPanel {
  limit: number;
}

const TrendsPanel = ({ limit }: ITrendsPanel) => {
  const { data: trends, isFetching } = useTrends();

  if (!isFetching && !trends?.length) {
    return null;
  }

  return (
    <Widget
      title={<FormattedMessage id='trends.title' defaultMessage='Trends' />}
      action={
        <Link className='text-right' to='/search' search={{ type: 'hashtags' }}>
          <Text tag='span' theme='primary' size='sm' className='hover:underline'>
            <FormattedMessage id='trends_panel.view_all' defaultMessage='View all' />
          </Text>
        </Link>
      }
    >
      {isFetching ? (
        <PlaceholderSidebarTrends limit={limit} />
      ) : (
        trends?.slice(0, limit).map((hashtag) => (
          <Hashtag key={hashtag.name} hashtag={hashtag} />
        ))
      )}
    </Widget>
  );
};

export { TrendsPanel as default };
