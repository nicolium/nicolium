import { Appbar, Avatar, Button, Divider, Text, useTheme } from '@mkljczk/react-native-paper';
import RenderHTML from '@native-html/render';
import { Link, useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import React, { useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { View } from 'react-native';
import { Tabs, TabScreen, TabsProvider } from 'react-native-paper-tabs';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAccount } from '@/queries/accounts/use-account';
import { useTimeline } from '@/queries/timelines/use-timeline';
import { useClient } from '@/stores/auth';

import { Timeline } from '../components/timeline';

interface IProfileTimeline {
  id: string;
  handleScrolled?: (value: boolean) => void;
}

const PostsTimeline: React.FC<IProfileTimeline> = ({ id, ...props }) => {
  const client = useClient();

  const timelineQuery = useTimeline(`account:${id}:exclude_replies`, (paginationParams) =>
    client.accounts.getAccountStatuses(id, { ...paginationParams, exclude_replies: true }),
  );

  return (
    <Timeline
      query={timelineQuery}
      emptyMessageHeading={
        <FormattedMessage id='empty_column.account_timeline' defaultMessage='No posts here!' />
      }
      {...props}
    />
  );
};

const PostsWithRepliesTimeline: React.FC<IProfileTimeline> = ({ id, ...props }) => {
  const client = useClient();

  const timelineQuery = useTimeline(`account:${id}`, (paginationParams) =>
    client.accounts.getAccountStatuses(id, paginationParams),
  );

  return (
    <Timeline
      query={timelineQuery}
      emptyMessageHeading={
        <FormattedMessage id='empty_column.account_timeline' defaultMessage='No posts here!' />
      }
      {...props}
    />
  );
};

const MediaTimeline: React.FC<IProfileTimeline> = ({ id, ...props }) => {
  const client = useClient();

  const timelineQuery = useTimeline(`account:${id}:only_media`, (paginationParams) =>
    client.accounts.getAccountStatuses(id, { ...paginationParams, only_media: true }),
  );

  return (
    <Timeline
      query={timelineQuery}
      emptyMessageHeading={
        <FormattedMessage id='account_gallery.none' defaultMessage='No media to show.' />
      }
      {...props}
    />
  );
};

interface IProfile {
  id: string;
  ownAccount?: boolean;
}

const Profile: React.FC<IProfile> = ({ id, ownAccount }) => {
  const { colors } = useTheme();
  const { top: topInset } = useSafeAreaInsets();
  const { data: account } = useAccount(id);
  const navigation = useNavigation();
  const profileInfoNode = useRef<View>(null);

  const [currentTab, setCurrentTab] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [profileInfoHeight, setProfileInfoHeight] = useState(0);

  const profileInfoMarginTop = useSharedValue(topInset);
  const profileInfoStyle = useAnimatedStyle(() => ({
    marginTop: profileInfoMarginTop.value,
  }));

  React.useEffect(() => {
    if (isScrolled) profileInfoMarginTop.value = withTiming(-profileInfoHeight + topInset + 64);
    else profileInfoMarginTop.value = withTiming(topInset);
  }, [isScrolled]);

  React.useLayoutEffect(() => {
    const height = profileInfoNode.current?.getBoundingClientRect().height;
    if (height) setProfileInfoHeight(height);
  }, [isScrolled]);

  if (!account) return null;

  return (
    <>
      <Animated.View style={profileInfoStyle} ref={profileInfoNode}>
        {!account.header_default && (
          <Image
            style={{
              flex: 1,
              width: '100%',
              maxWidth: '100%',
              aspectRatio: 3 / 1,
              maxHeight: 150 + topInset,
              height: 'auto',
            }}
            source={{
              uri: account.header,
            }}
            accessibilityLabel={account.header_description}
            contentFit='cover'
            transition={300}
          />
        )}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            height: 88,
            marginTop: account.header_default ? 8 + topInset : -16,
            marginBottom: 8,
            marginHorizontal: 16,
          }}
        >
          <Avatar.Image
            source={{ uri: account.avatar }}
            size={80}
            accessibilityLabel={account.avatar_description}
            style={{
              outlineWidth: 4,
              outlineColor: colors.background,
            }}
          />
          {ownAccount && (
            <Button mode='contained-tonal' onPress={() => navigation.navigate('edit-profile')}>
              <FormattedMessage id='settings.edit_profile' defaultMessage='Edit profile' />
            </Button>
          )}
        </View>
        <View style={{ gap: 8, marginHorizontal: 16, marginBottom: 8 }}>
          <View>
            <Text variant='titleMedium' numberOfLines={1}>
              {account.display_name}
            </Text>
            <Text variant='bodyMedium' numberOfLines={1} style={{ color: colors.outline }}>
              @{account.acct}
            </Text>
          </View>
          <RenderHTML
            source={{ html: account.note }}
            baseStyle={{
              color: colors.onSecondaryContainer,
            }}
            tagsStyles={{
              p: {
                marginVertical: 0,
              },
              a: {
                color: colors.primary,
                textDecorationColor: colors.primary,
              },
            }}
          />
        </View>
        <Divider />
        <View style={{ flexDirection: 'row', marginHorizontal: 16, marginVertical: 8, gap: 8 }}>
          <Text style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Text variant='bodyMediumEmphasized'>{account.statuses_count}</Text>
            <FormattedMessage id='account.statuses' defaultMessage='Posts' />
          </Text>
          <Link
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            screen='accounts'
            params={{ screen: 'followers', params: { id: account.id } }}
          >
            <Text variant='bodyMediumEmphasized'>{account.followers_count}</Text>
            <FormattedMessage id='account.followers' defaultMessage='Followers' />
          </Link>
          <Link
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            screen='accounts'
            params={{ screen: 'following', params: { id: account.id } }}
          >
            <Text variant='bodyMediumEmphasized'>{account.following_count}</Text>
            <FormattedMessage id='account.following' defaultMessage='Following' />
          </Link>
        </View>
      </Animated.View>
      {isScrolled && (
        <Appbar.Header
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1,
            backgroundColor: colors.surfaceContainer,
          }}
        >
          {!ownAccount && <Appbar.BackAction onPress={navigation.goBack} />}
          <View style={{ marginLeft: ownAccount ? 16 : 0 }}>
            <Text variant='titleMedium' numberOfLines={1}>
              {account.display_name}
            </Text>
            <Text style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <FormattedMessage
                id='account.statuses_count'
                defaultMessage='{count, plural, one {# post} other {# posts}}'
                values={{ count: account.statuses_count }}
              />
            </Text>
          </View>
        </Appbar.Header>
      )}
      <TabsProvider
        defaultIndex={0}
        onChangeIndex={(index) => {
          setCurrentTab(index);
          setIsScrolled(false);
        }}
      >
        <Tabs
          style={{ backgroundColor: isScrolled ? colors.surfaceContainer : colors.background }}
          uppercase={false}
        >
          <TabScreen label='Posts'>
            {currentTab === 0 ? (
              <PostsTimeline id={account.id} handleScrolled={setIsScrolled} />
            ) : (
              <></>
            )}
          </TabScreen>
          <TabScreen label='With replies'>
            {currentTab === 1 ? (
              <PostsWithRepliesTimeline id={account.id} handleScrolled={setIsScrolled} />
            ) : (
              <></>
            )}
          </TabScreen>
          <TabScreen label='Media'>
            {currentTab === 2 ? (
              <MediaTimeline id={account.id} handleScrolled={setIsScrolled} />
            ) : (
              <></>
            )}
          </TabScreen>
        </Tabs>
      </TabsProvider>
    </>
  );
};

export { Profile };
