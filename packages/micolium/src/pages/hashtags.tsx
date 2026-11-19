import { Appbar, Button, Text, useTheme } from '@mkljczk/react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { UserMinusIcon } from 'phosphor-react-native/src/icons/UserMinus';
import { UserPlusIcon } from 'phosphor-react-native/src/icons/UserPlus';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  useColorScheme,
  View,
} from 'react-native';
import {
  createAnimatedComponent,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Timeline } from '@/components/timelines/timeline';
import { CornerInset } from '@/components/ui/corner-inset';
import { Emojify } from '@/components/ui/emojify';
import { HeaderBackButton, HeaderIconButton } from '@/components/ui/header-icon-button';
import { useClient, useFeatures } from '@/contexts/current-account-context';
import { useAccount } from '@/queries/accounts/use-account';
import {
  useFollowHashtagMutation,
  useUnfollowHashtagMutation,
} from '@/queries/hashtags/use-followed-tags';
import { useHashtag } from '@/queries/hashtags/use-hashtag';
import { useTimeline } from '@/queries/timelines/use-timeline';
import { useSetting } from '@/stores/settings';

import type { StaticScreenProps } from '@react-navigation/native';

const messages = defineMessages({
  followHashtag: { id: 'hashtag.follow', defaultMessage: 'Follow hashtag' },
  unfollowHashtag: { id: 'hashtag.unfollow', defaultMessage: 'Unfollow hashtag' },
  headingFromAccount: {
    id: 'column.hashtag.from_account',
    defaultMessage: 'Posts tagged #{tag} from {name}',
  },
});

const AnimatedAppbarContent = createAnimatedComponent(Appbar.Content);
const AnimatedHeaderIconButton = createAnimatedComponent(HeaderIconButton);

const HashtagsScreen = ({
  route: {
    params: { tag, accountId },
  },
}: StaticScreenProps<{ tag: string; accountId?: string }>) => {
  const navigation = useNavigation('hashtags');
  const intl = useIntl();
  const { colors } = useTheme();
  const colorScheme = useColorScheme();
  const blackTheme = useSetting('appearance.black');
  const { top: topInset } = useSafeAreaInsets();
  const client = useClient();
  const features = useFeatures();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const { data: account } = useAccount(accountId);

  const headerOpacity = useSharedValue(+isScrolled);
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const { mutate: followHashtag, isPending: isFollowPending } = useFollowHashtagMutation(tag);
  const { mutate: unfollowHashtag } = useUnfollowHashtagMutation(tag);

  const { data: hashtag } = useHashtag(tag);

  const timelineQuery = useTimeline(
    `hashtag:${tag}${accountId ? `:${accountId}` : ''}`,
    (paginationParams) =>
      accountId
        ? client.accounts.getAccountStatuses(accountId, {
            tagged: tag,
          })
        : client.timelines.hashtagTimeline(tag, paginationParams),
    { stream: 'hashtag', params: { tag } },
  );

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.y || event.target?.scrollTop || 0;
    const newIsScrolled = scrollOffset > 64;
    setIsScrolled(newIsScrolled);
    headerOpacity.set(withTiming(+newIsScrolled));
  };

  return (
    <>
      <Appbar.Header
        mode='small'
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1,
            backgroundColor: isScrolled ? colors.surfaceContainer : undefined,
          },
          colorScheme === 'dark' &&
            blackTheme &&
            isScrolled && {
              borderBottomWidth: 1,
              borderBottomColor: colors.surfaceContainerHighest,
            },
        ]}
        elevated={isScrolled}
      >
        <CornerInset direction='horizontal' edge='left' />
        {navigation.canGoBack() ? <HeaderBackButton onPress={navigation.goBack} /> : null}
        <AnimatedAppbarContent
          title={
            accountId
              ? intl.formatMessage(messages.headingFromAccount, {
                  tag,
                  name: account?.display_name,
                })
              : `#${tag}`
          }
          style={headerStyle}
        />
        {!accountId && features.followHashtags && (
          <AnimatedHeaderIconButton
            icon={hashtag?.following ? UserMinusIcon : UserPlusIcon}
            disabled={!hashtag || isFollowPending}
            onPress={() => (hashtag?.following ? unfollowHashtag() : followHashtag())}
            accessibilityLabel={intl.formatMessage(
              hashtag?.following ? messages.unfollowHashtag : messages.followHashtag,
            )}
            style={headerStyle}
          />
        )}
      </Appbar.Header>
      <Timeline
        filtersKey='hashtag'
        query={timelineQuery}
        emptyMessageText={
          <FormattedMessage
            id='empty_column.hashtag'
            defaultMessage='There is nothing in this hashtag yet.'
          />
        }
        onScroll={handleScroll}
        header={
          <View style={{ marginTop: 64 + topInset, paddingHorizontal: 16 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {accountId ? (
                <Text variant='titleLarge'>
                  {intl.formatMessage(messages.headingFromAccount, {
                    tag,
                    name: account && (
                      <Emojify text={account.display_name} emojis={account.emojis} />
                    ),
                  })}
                </Text>
              ) : (
                <Text variant='titleLarge'>#{tag}</Text>
              )}
              {!accountId && (
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
              )}
            </View>
          </View>
        }
      />
    </>
  );
};

export { HashtagsScreen };
