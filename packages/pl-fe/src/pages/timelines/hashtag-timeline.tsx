import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { fetchHashtagTimeline, clearTimeline } from 'pl-fe/actions/timelines';
import { useHashtagStream } from 'pl-fe/api/hooks/streaming/use-hashtag-stream';
import List, { ListItem } from 'pl-fe/components/list';
import Column from 'pl-fe/components/ui/column';
import Toggle from 'pl-fe/components/ui/toggle';
import Timeline from 'pl-fe/features/ui/components/timeline';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useLoggedIn } from 'pl-fe/hooks/use-logged-in';
import { useFollowHashtagMutation, useUnfollowHashtagMutation } from 'pl-fe/queries/hashtags/use-followed-tags';
import { useHashtag } from 'pl-fe/queries/hashtags/use-hashtag';

interface IHashtagTimelinePage {
  params?: {
    id?: string;
  };
}

const HashtagTimelinePage: React.FC<IHashtagTimelinePage> = ({ params }) => {
  const tagId = params?.id || '';

  const features = useFeatures();
  const dispatch = useAppDispatch();
  const { data: tag } = useHashtag(tagId);
  const { isLoggedIn } = useLoggedIn();

  const { mutate: followHashtag } = useFollowHashtagMutation(tagId);
  const { mutate: unfollowHashtag } = useUnfollowHashtagMutation(tagId);

  const handleLoadMore = () => {
    dispatch(fetchHashtagTimeline(tagId, { }, true));
  };

  const handleFollow = () => {
    if (tag?.following) {
      unfollowHashtag();
    } else {
      followHashtag();
    }
  };

  useHashtagStream(tagId);

  useEffect(() => {
    dispatch(clearTimeline(`hashtag:${tagId}`));
    dispatch(fetchHashtagTimeline(tagId));
  }, [tagId]);

  return (
    <Column label={`#${tagId}`}>
      {features.followHashtags && isLoggedIn && (
        <List>
          <ListItem
            className='mb-3 black:mx-4 black:mb-0'
            label={<FormattedMessage id='hashtag.follow' defaultMessage='Follow hashtag' />}
          >
            <Toggle
              checked={tag?.following}
              onChange={handleFollow}
            />
          </ListItem>
        </List>
      )}
      <Timeline
        loadMoreClassName='sm:pb-4 black:sm:pb-0 black:sm:mx-4'
        scrollKey='hashtag_timeline'
        timelineId={`hashtag:${tagId}`}
        onLoadMore={handleLoadMore}
        emptyMessageText={<FormattedMessage id='empty_column.hashtag' defaultMessage='There is nothing in this hashtag yet.' />}
      />
    </Column>
  );
};

export { HashtagTimelinePage as default };
