import React from 'react';
import { FormattedMessage } from 'react-intl';

import List, { ListItem } from '@/components/list';
import Toggle from '@/components/ui/toggle';
import { useFeatures } from '@/hooks/use-features';
import { useLoggedIn } from '@/hooks/use-logged-in';
import {
  useFollowHashtagMutation,
  useUnfollowHashtagMutation,
} from '@/queries/hashtags/use-followed-tags';
import { useHashtag } from '@/queries/hashtags/use-hashtag';

interface IHashtagFollowToggle {
  hashtag: string;
}

const HashtagFollowToggle: React.FC<IHashtagFollowToggle> = ({ hashtag }) => {
  const features = useFeatures();
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
    features.followHashtags &&
    isLoggedIn && (
      <List>
        <ListItem
          className='hashtag-follow_toggle'
          label={<FormattedMessage id='hashtag.follow' defaultMessage='Follow hashtag' />}
        >
          <Toggle checked={tag?.following} onChange={handleFollow} />
        </ListItem>
      </List>
    )
  );
};

export { HashtagFollowToggle as default };
