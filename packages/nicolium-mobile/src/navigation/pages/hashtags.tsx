import { Appbar, Button, Text, useTheme } from '@mkljczk/react-native-paper';
import { UserMinusIcon, UserPlusIcon } from 'phosphor-react-native';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { iconHelper } from '@/components/ui/icon';
import { useClient, useFeatures } from '@/contexts/current-account-context';
import {
  useFollowHashtagMutation,
  useUnfollowHashtagMutation,
} from '@/queries/hashtags/use-followed-tags';
import { useHashtag } from '@/queries/hashtags/use-hashtag';
import { useTimeline } from '@/queries/timelines/use-timeline';

import { Timeline } from '../components/timeline';

import type { RootStackParams } from '../router';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const messages = defineMessages({
  followHashtag: { id: 'hashtag.follow', defaultMessage: 'Follow hashtag' },
  unfollowHashtag: { id: 'hashtag.unfollow', defaultMessage: 'Unfollow hashtag' },
});

const HashtagsScreen = ({
  navigation,
  route: {
    params: { tag },
  },
}: NativeStackScreenProps<RootStackParams, 'hashtags'>) => {
  const intl = useIntl();
  const { colors } = useTheme();
  const { top: topInset } = useSafeAreaInsets();
  const client = useClient();
  const features = useFeatures();
  const [isScrolled, setIsScrolled] = React.useState(false);

  const { mutate: followHashtag, isPending: isFollowPending } = useFollowHashtagMutation(tag);
  const { mutate: unfollowHashtag } = useUnfollowHashtagMutation(tag);

  const { data: hashtag } = useHashtag(tag);

  const timelineQuery = useTimeline(`hashtag:${tag}`, (paginationParams) =>
    client.timelines.hashtagTimeline(tag, paginationParams),
  );

  return (
    <>
      <Appbar.Header
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1,
          backgroundColor: isScrolled ? colors.surfaceContainer : undefined,
        }}
        elevated={isScrolled}
      >
        {navigation.canGoBack() ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
        {isScrolled && (
          <>
            <Appbar.Content title={`#${tag}`} />
            {features.followHashtags && (
              <Appbar.Action
                icon={iconHelper(hashtag?.following ? UserMinusIcon : UserPlusIcon)}
                disabled={!hashtag || isFollowPending}
                onPress={() => (hashtag?.following ? unfollowHashtag() : followHashtag())}
                accessibilityLabel={intl.formatMessage(
                  hashtag?.following ? messages.unfollowHashtag : messages.followHashtag,
                )}
              ></Appbar.Action>
            )}
          </>
        )}
      </Appbar.Header>
      <Timeline
        query={timelineQuery}
        emptyMessageText={
          <FormattedMessage
            id='empty_column.hashtag'
            defaultMessage='There is nothing in this hashtag yet.'
          />
        }
        handleScrolled={setIsScrolled}
        header={
          <View style={{ marginTop: 64 + topInset, paddingHorizontal: 16 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text variant='titleLarge'>#{tag}</Text>
              <Button
                mode={hashtag?.following ? 'contained-tonal' : 'contained'}
                disabled={!hashtag || isFollowPending}
                loading={isFollowPending}
                onPress={() => (hashtag?.following ? unfollowHashtag() : followHashtag())}
              >
                {hashtag?.following ? (
                  <FormattedMessage id='account.unfollow' defaultMessage='Unfollow' />
                ) : (
                  <FormattedMessage id='account.follow' defaultMessage='Follow' />
                )}
              </Button>
            </View>
          </View>
        }
      />
    </>
  );
};

export { HashtagsScreen };
