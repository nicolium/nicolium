import React from 'react';
import { FormattedMessage } from 'react-intl';

import { HashtagTimelineColumn } from '@/columns/timeline';
import DropdownMenu from '@/components/dropdown-menu';
import List, { ListItem } from '@/components/list';
import Column from '@/components/ui/column';
import Toggle from '@/components/ui/toggle';
import { hashtagTimelineRoute } from '@/features/ui/router';
import { useFeatures } from '@/hooks/use-features';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { useTimelineFiltersOptions } from '@/hooks/use-timeline-filters-options';
import {
  useFollowHashtagMutation,
  useUnfollowHashtagMutation,
} from '@/queries/hashtags/use-followed-tags';
import { useHashtag } from '@/queries/hashtags/use-hashtag';

const HashtagTimelinePage: React.FC = () => {
  const { hashtag } = hashtagTimelineRoute.useParams();

  const features = useFeatures();
  const { data: tag } = useHashtag(hashtag);
  const { isLoggedIn } = useLoggedIn();
  const items = useTimelineFiltersOptions('hashtag');

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
    <Column
      label={`#${hashtag}`}
      action={
        <DropdownMenu
          items={items}
          src={require('@phosphor-icons/core/regular/dots-three-vertical.svg')}
        />
      }
    >
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
      <HashtagTimelineColumn
        hashtag={hashtag}
        emptyMessageText={
          <FormattedMessage
            id='empty_column.hashtag'
            defaultMessage='There is nothing in this hashtag yet.'
          />
        }
      />
    </Column>
  );
};

export { HashtagTimelinePage as default };
