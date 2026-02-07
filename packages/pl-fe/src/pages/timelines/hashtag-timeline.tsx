import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { fetchHashtagTimeline, clearTimeline } from '@/actions/timelines';
import { useHashtagStream } from '@/api/hooks/streaming/use-hashtag-stream';
import List, { ListItem } from '@/components/list';
import Column from '@/components/ui/column';
import Toggle from '@/components/ui/toggle';
import Timeline from '@/features/ui/components/timeline';
import { hashtagTimelineRoute } from '@/features/ui/router';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useFeatures } from '@/hooks/use-features';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { useFollowHashtagMutation, useUnfollowHashtagMutation } from '@/queries/hashtags/use-followed-tags';
import { useHashtag } from '@/queries/hashtags/use-hashtag';

const HashtagTimelinePage: React.FC = () => {
  const { id: tagId } = hashtagTimelineRoute.useParams();

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
