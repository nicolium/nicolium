import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { fetchHashtagTimeline, clearTimeline } from '@/actions/timelines';
import { useHashtagStream } from '@/api/hooks/streaming/use-hashtag-stream';
import { HashtagTimelineColumn } from '@/columns/timeline';
import List, { ListItem } from '@/components/list';
import Column from '@/components/ui/column';
import Toggle from '@/components/ui/toggle';
import Timeline from '@/features/ui/components/timeline';
import { hashtagTimelineRoute } from '@/features/ui/router';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useFeatures } from '@/hooks/use-features';
import { useLoggedIn } from '@/hooks/use-logged-in';
import {
  useFollowHashtagMutation,
  useUnfollowHashtagMutation,
} from '@/queries/hashtags/use-followed-tags';
import { useHashtag } from '@/queries/hashtags/use-hashtag';
import { useSettings } from '@/stores/settings';

interface IHashtagTimeline {
  hashtag: string;
}

const HashtagTimeline: React.FC<IHashtagTimeline> = ({ hashtag }) => {
  const dispatch = useAppDispatch();

  const handleLoadMore = () => {
    dispatch(fetchHashtagTimeline(hashtag, {}, true));
  };

  useHashtagStream(hashtag);

  useEffect(() => {
    dispatch(clearTimeline(`hashtag:${hashtag}`));
    dispatch(fetchHashtagTimeline(hashtag));
  }, [hashtag]);

  return (
    <Timeline
      loadMoreClassName='sm:pb-4 black:sm:pb-0 black:sm:mx-4'
      scrollKey='hashtag_timeline'
      timelineId={`hashtag:${hashtag}`}
      onLoadMore={handleLoadMore}
      emptyMessageText={
        <FormattedMessage
          id='empty_column.hashtag'
          defaultMessage='There is nothing in this hashtag yet.'
        />
      }
    />
  );
};

const HashtagTimelinePage: React.FC = () => {
  const { hashtag } = hashtagTimelineRoute.useParams();

  const features = useFeatures();
  const { experimentalTimeline } = useSettings();
  const { data: tag } = useHashtag(hashtag);
  const { isLoggedIn } = useLoggedIn();

  const { mutate: followHashtag } = useFollowHashtagMutation(hashtag);
  const { mutate: unfollowHashtag } = useUnfollowHashtagMutation(hashtag);

  const handleFollow = () => {
    if (tag?.following) {
      unfollowHashtag();
    } else {
      followHashtag();
    }
  };

  return (
    <Column label={`#${hashtag}`}>
      {features.followHashtags && isLoggedIn && (
        <List>
          <ListItem
            className='mb-3 black:mx-4 black:mb-0'
            label={<FormattedMessage id='hashtag.follow' defaultMessage='Follow hashtag' />}
          >
            <Toggle checked={tag?.following} onChange={handleFollow} />
          </ListItem>
        </List>
      )}
      {experimentalTimeline ? (
        <HashtagTimelineColumn hashtag={hashtag} />
      ) : (
        <HashtagTimeline hashtag={hashtag} />
      )}
    </Column>
  );
};

export { HashtagTimelinePage as default };
