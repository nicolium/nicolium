import React from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import Hashtag from '@/components/hashtag';
import ScrollableList from '@/components/scrollable-list';
import Column from '@/components/ui/column';
import PlaceholderHashtag from '@/features/placeholder/components/placeholder-hashtag';
import { useFollowedTags } from '@/queries/hashtags/use-followed-tags';

const messages = defineMessages({
  heading: { id: 'column.followed_tags', defaultMessage: 'Followed hashtags' },
});

const FollowedTagsPage = () => {
  const intl = useIntl();

  const { data: tags = [], isLoading, hasNextPage, fetchNextPage } = useFollowedTags();

  const emptyMessage = <FormattedMessage id='empty_column.followed_tags' defaultMessage="You haven't followed any hashtag yet." />;

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <ScrollableList
        scrollKey='followedTags'
        emptyMessageText={emptyMessage}
        isLoading={isLoading}
        hasMore={hasNextPage}
        onLoadMore={fetchNextPage}
        placeholderComponent={PlaceholderHashtag}
        placeholderCount={5}
        itemClassName='pb-3'
      >
        {tags.map(tag => <Hashtag key={tag.name} hashtag={tag} />)}
      </ScrollableList>
    </Column>
  );
};

export { FollowedTagsPage as default };
