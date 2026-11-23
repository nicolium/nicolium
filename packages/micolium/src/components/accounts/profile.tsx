import {
  Appbar,
  Avatar,
  Chip,
  DataTable,
  Divider,
  Icon,
  Text,
  useTheme,
} from '@mkljczk/react-native-paper';
import { Link, useNavigation } from '@react-navigation/native';
import { GlassView } from 'expo-glass-effect';
import { ArrowLineDownIcon } from 'phosphor-react-native/src/icons/ArrowLineDown';
import { CaretDownIcon } from 'phosphor-react-native/src/icons/CaretDown';
import { type Account, mediaAttachmentSchema } from 'pl-api';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  useColorScheme,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as v from 'valibot';

import { AccountActionsDropdown } from '@/components/accounts/account-actions-dropdown';
import { FollowButton } from '@/components/accounts/follow-button';
import { ProfileFeatured } from '@/components/accounts/profile-featured';
import { ComposeButton } from '@/components/compose-button';
import { StillImage } from '@/components/still-image';
import { CollapsibleContent } from '@/components/ui/collapsible-content';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { Emojify } from '@/components/ui/emojify';
import { GlassButton } from '@/components/ui/glass-button';
import { iconHelper } from '@/components/ui/icon';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { StyledHtml } from '@/components/ui/styled-html';
import { useFeatures } from '@/contexts/current-account-context';
import { useEnableLiquidGlass } from '@/hooks/use-enable-liquid-glass';
import { useAccount } from '@/queries/accounts/use-account';
import {
  useAccountCollections,
  useCollectionsFeaturingAccount,
} from '@/queries/accounts/use-collections';
import { useEndorsedAccounts } from '@/queries/accounts/use-endorsed-accounts';
import { useFeaturedTags } from '@/queries/accounts/use-featured-tags';
import {
  useAcceptFollowRequestMutation,
  useRejectFollowRequestMutation,
} from '@/queries/accounts/use-follow-requests';
import { useSetting, useSettingsActions } from '@/stores/settings';
import { useUiStoreActions } from '@/stores/ui';

import { CornerInset } from '../ui/corner-inset';
import { HeaderBackButton } from '../ui/header-icon-button';

import { ProfileMedia } from './profile-media';
import { ProfileTimeline } from './profile-timeline';

import type { TimelineEntry } from '@/stores/timelines';
import type { FlashListRef } from '@shopify/flash-list';

const messages = defineMessages({
  repliesToggle: { id: 'account.filters.replies_toggle', defaultMessage: 'Show replies' },
  reblogsToggle: { id: 'account.filters.reblogs_toggle', defaultMessage: 'Show boosts' },
  pinnedToggle: { id: 'account.filters.pinned_toggle', defaultMessage: 'Show pinned' },
  changeFilters: {
    id: 'account.filters.change_filters',
    defaultMessage: 'Change timeline filters',
  },
  filtersAll: { id: 'account.filters.label.all', defaultMessage: 'All activity' },
  filtersWithReblogs: {
    id: 'account.filters.label.with_reblogs',
    defaultMessage: 'Posts and boosts',
  },
  filtersWithReplies: {
    id: 'account.filters.label.with_replies',
    defaultMessage: 'Posts and replies',
  },
  filtersNone: { id: 'account.filters.label.none', defaultMessage: 'Posts' },
  filtersAllExceptPinned: {
    id: 'account.filters.label.all.except_pinned',
    defaultMessage: 'All activity, without pinned',
  },
  filtersWithReblogsExceptPinned: {
    id: 'account.filters.label.with_reblogs.except_pinned',
    defaultMessage: 'Posts and boosts, without pinned',
  },
  filtersWithRepliesExceptPinned: {
    id: 'account.filters.label.with_replies.except_pinned',
    defaultMessage: 'Posts and replies, without pinned',
  },
  filtersNoneExceptPinned: {
    id: 'account.filters.label.none.except_pinned',
    defaultMessage: 'Posts, without pinned',
  },
  followRequestWithName: {
    id: 'notification.follow_request',
    defaultMessage: '{name} requested to follow you',
  },
  followRequestAuthorize: {
    id: 'follow_request.authorize',
    defaultMessage: 'Authorize',
  },
  followRequestReject: {
    id: 'follow_request.reject',
    defaultMessage: 'Reject',
  },
  posts: { id: 'account.posts', defaultMessage: 'Posts' },
  media: { id: 'account.media', defaultMessage: 'Media' },
  hashtags: { id: 'account.tabs.hashtags', defaultMessage: 'Hashtags' },
  accounts: { id: 'account.tabs.accounts', defaultMessage: 'Accounts' },
  collections: { id: 'column.collections', defaultMessage: 'Collections' },
});

type ProfileTab = 'posts' | 'media' | 'hashtags' | 'accounts' | 'collections';

const useProfileTabs = (accountId: string, ownAccount: boolean) => {
  const features = useFeatures();

  const { data: featuredTags = [] } = useFeaturedTags(accountId);
  const { data: endorsedAccounts = [] } = useEndorsedAccounts(accountId);
  const { data: collections = [] } = useAccountCollections(ownAccount ? undefined : accountId);
  const { data: featuringCollections = [] } = useCollectionsFeaturingAccount(accountId);

  const tabs: Array<ProfileTab> = ['posts', 'media'];
  if (featuredTags.length) tabs.push('hashtags');
  if (endorsedAccounts.length) tabs.push('accounts');
  if ((features.collections && ownAccount) || collections.length || featuringCollections.length)
    tabs.push('collections');

  return tabs;
};

interface IProfileTabs {
  tabs: Array<ProfileTab>;
  active: ProfileTab;
  onChange: (tab: ProfileTab) => void;
}

const ProfileTabs: React.FC<IProfileTabs> = ({ tabs, active, onChange }) => {
  const intl = useIntl();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingBottom: 8 }}
    >
      {tabs.map((tab) => (
        <Chip
          key={tab}
          mode={active === tab ? 'flat' : 'outlined'}
          selected={active === tab}
          showSelectedCheck={false}
          onPress={() => onChange(tab)}
        >
          {intl.formatMessage(messages[tab])}
        </Chip>
      ))}
    </ScrollView>
  );
};

interface IFollowRequestedChip {
  account: Account;
}

const FollowRequestedChip: React.FC<IFollowRequestedChip> = ({ account }) => {
  const intl = useIntl();

  const { mutate: authorizeFollowRequest } = useAcceptFollowRequestMutation(account.id);
  const { mutate: rejectFollowRequest } = useRejectFollowRequestMutation(account.id);

  const handleAuthorize = () => {
    authorizeFollowRequest();
  };

  const handleReject = () => {
    rejectFollowRequest();
  };

  return (
    <DropdownMenu
      trigger={
        <Chip key='requested' mode='flat' compact onPress={() => {}}>
          <FormattedMessage
            id='account.requested_follow'
            defaultMessage='Requested to follow you'
          />
        </Chip>
      }
      items={[
        {
          key: 'follow-request',
          type: 'section',
          label: intl.formatMessage(messages.followRequestWithName, {
            name: `@${account.acct}`,
          }),
          children: [
            {
              key: 'authorize',
              type: 'button',
              label: intl.formatMessage(messages.followRequestAuthorize),
              onPress: handleAuthorize,
            },
            {
              key: 'reject',
              type: 'button',
              label: intl.formatMessage(messages.followRequestReject),
              onPress: handleReject,
            },
          ],
        },
      ]}
    />
  );
};

interface IProfile {
  id: string;
  ownAccount?: boolean;
}

const Profile: React.FC<IProfile> = ({ id, ownAccount }) => {
  const intl = useIntl();
  const { colors } = useTheme();
  const colorScheme = useColorScheme();
  const blackTheme = useSetting('appearance.black');
  const { top: topInset } = useSafeAreaInsets();
  const { data: account } = useAccount(id, !ownAccount);
  const navigation = useNavigation();
  const profileInfoNode = React.useRef<React.ComponentRef<typeof View>>(null);
  const previousScrollOffset = React.useRef<number>(0);
  const timelineNode = React.useRef<FlashListRef<TimelineEntry>>(null);
  const pinnedCount = React.useRef<number>(0);
  const glassEffect = useEnableLiquidGlass();
  const { openMediaViewer } = useUiStoreActions();

  const profileFilters = useSetting('timelines.profileFilters');
  const { update } = useSettingsActions();

  const [showHeader, setShowHeader] = React.useState(false);
  const [showComposeButton, setShowComposeButton] = React.useState(true);
  const [tab, setTab] = React.useState<ProfileTab>('posts');

  const tabs = useProfileTabs(id, ownAccount || false);

  const headerMarginTop = useSharedValue(-128);
  const headerStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    marginTop: headerMarginTop.value,
    left: 0,
    right: 0,
    zIndex: 1,
  }));

  const badges = React.useMemo(() => {
    const chips: React.ReactNode[] = [];

    if (!account?.relationship || ownAccount) return chips;

    if (account.relationship?.followed_by) {
      chips.push(
        <Chip key='followed_by' mode='flat' compact>
          <FormattedMessage id='account.follows_you' defaultMessage='Follows you' />
        </Chip>,
      );
    } else if (account.relationship?.blocking) {
      chips.push(
        <Chip key='blocked' mode='flat' compact>
          <FormattedMessage id='account.blocked' defaultMessage='Blocked' />
        </Chip>,
      );
    } else if (account.relationship?.requested_by) {
      chips.push(<FollowRequestedChip account={account} />);
    }

    if (account.relationship?.muting) {
      chips.push(
        <Chip key='muted' mode='flat' compact>
          <FormattedMessage id='account.muted' defaultMessage='Muted' />
        </Chip>,
      );
    } else if (account.relationship?.domain_blocking) {
      chips.push(
        <Chip key='domain_blocked' mode='flat' compact>
          <FormattedMessage id='account.domain_blocked' defaultMessage='Domain hidden' />
        </Chip>,
      );
    }

    return chips;
  }, [account?.relationship, ownAccount]);

  if (!account) return <LoadingIndicator />;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset =
      event.nativeEvent.contentOffset.y ||
      (typeof event.target === 'object' && event.target.scrollTop) ||
      0;
    const showHeader =
      !!profileInfoNode.current &&
      scrollOffset + topInset > profileInfoNode.current.getBoundingClientRect().height;
    setShowHeader(showHeader);
    headerMarginTop.set(withTiming(showHeader ? 0 : -64 - topInset));
    setShowComposeButton(scrollOffset < previousScrollOffset.current || scrollOffset === 0);
    previousScrollOffset.current = scrollOffset;
  };

  const handlePreviewHeader = () => {
    const header = v.parse(mediaAttachmentSchema, {
      id: '',
      type: 'image',
      url: account.header,
      description: account.header_description,
    });

    openMediaViewer([header], 0);
  };

  const handlePreviewAvatar = () => {
    const avatar = v.parse(mediaAttachmentSchema, {
      id: '',
      type: 'image',
      url: account.avatar,
      description: account.avatar_description,
    });

    openMediaViewer([avatar], 0);
  };

  const filtersLabel = (() => {
    if (profileFilters.showReblogs && profileFilters.showReplies) {
      return intl.formatMessage(
        profileFilters.showPinned ? messages.filtersAll : messages.filtersAllExceptPinned,
      );
    } else if (profileFilters.showReblogs) {
      return intl.formatMessage(
        profileFilters.showPinned
          ? messages.filtersWithReblogs
          : messages.filtersWithReblogsExceptPinned,
      );
    } else if (profileFilters.showReplies) {
      return intl.formatMessage(
        profileFilters.showPinned
          ? messages.filtersWithReplies
          : messages.filtersWithRepliesExceptPinned,
      );
    } else {
      return intl.formatMessage(
        profileFilters.showPinned ? messages.filtersNone : messages.filtersNoneExceptPinned,
      );
    }
  })();

  const timelineFiltersSelector = (
    <DropdownMenu
      trigger={
        glassEffect ? (
          <Pressable onPress={() => {}}>
            <GlassView
              style={{
                gap: 4,
                flexDirection: 'row',
                alignItems: 'center',
                borderRadius: 16,
                borderCurve: 'continuous',
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
              isInteractive
            >
              <Text>{filtersLabel}</Text>
              <Icon source={iconHelper(CaretDownIcon)} size={16} color={colors.onSurfaceVariant} />
            </GlassView>
          </Pressable>
        ) : (
          <Chip mode='outlined' rightIcon={iconHelper(CaretDownIcon)}>
            {filtersLabel}
          </Chip>
        )
      }
      accessibilityLabel={filtersLabel}
      accessibilityHint={intl.formatMessage(messages.changeFilters)}
      items={[
        {
          key: 'show-replies',
          type: 'button',
          label: intl.formatMessage(messages.repliesToggle),
          checked: profileFilters.showReplies,
          onPress: () =>
            update('timelines.profileFilters', {
              ...profileFilters,
              showReplies: !profileFilters.showReplies,
            }),
        },
        {
          key: 'show-reblogs',
          type: 'button',
          label: intl.formatMessage(messages.reblogsToggle),
          checked: profileFilters.showReblogs,
          onPress: () =>
            update('timelines.profileFilters', {
              ...profileFilters,
              showReblogs: !profileFilters.showReblogs,
            }),
        },
        {
          key: 'show-pinned',
          type: 'button',
          label: intl.formatMessage(messages.pinnedToggle),
          checked: profileFilters.showPinned,
          onPress: () =>
            update('timelines.profileFilters', {
              ...profileFilters,
              showPinned: !profileFilters.showPinned,
            }),
        },
      ]}
    />
  );

  const handleSkipPinned = () => {
    timelineNode.current?.scrollToIndex({ index: pinnedCount.current, viewOffset: -64 });
  };

  const skipPinnedButton = glassEffect ? (
    <Pressable onPress={handleSkipPinned}>
      <GlassView
        style={{
          gap: 4,
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 16,
          borderCurve: 'continuous',
          paddingHorizontal: 12,
          paddingVertical: 8,
        }}
        isInteractive
      >
        <Icon source={iconHelper(ArrowLineDownIcon)} size={16} color={colors.onSurfaceVariant} />
        <Text>
          <FormattedMessage id='status.skip_pinned' defaultMessage='Skip pinned posts' />
        </Text>
      </GlassView>
    </Pressable>
  ) : (
    <Chip mode='outlined' onPress={handleSkipPinned} icon={iconHelper(ArrowLineDownIcon)}>
      {/* <View style={{ paddingRight: 4 }}>
        <Icon source={iconHelper(ArrowLineDownIcon)} size={16} color={colors.onSurfaceVariant} />
      </View> */}
      <FormattedMessage id='status.skip_pinned' defaultMessage='Skip pinned posts' />
    </Chip>
  );

  const header = (
    <>
      {badges && (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 4,
            position: 'absolute',
            zIndex: 1,
            top: topInset + 8,
            left: 8,
          }}
        >
          {badges}
        </View>
      )}
      <View ref={profileInfoNode}>
        <Pressable
          disabled={account.header_default}
          onPress={account.header_default ? undefined : handlePreviewHeader}
        >
          <StillImage
            style={{
              flex: 1,
              width: '100%',
              maxWidth: '100%',
              minWidth: '100%',
              height: Math.min(
                (account.header_default ? (badges.length ? 60 : 50) : 150) + topInset,
                180,
              ),
            }}
            src={account.header}
            staticSrc={account.header_static}
            accessibilityLabel={account.header_description}
            contentFit='cover'
            transition={300}
            recyclingKey={account.header}
          />
        </Pressable>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            height: 88,
            marginTop: -16,
            marginBottom: 8,
            marginHorizontal: 16,
          }}
        >
          <Pressable
            disabled={account.avatar_default}
            onPress={account.avatar_default ? undefined : handlePreviewAvatar}
          >
            {account.avatar_default ? (
              <Avatar.Text
                size={80}
                label={(account.display_name || account.acct).slice(0, 2)}
                style={{
                  outlineWidth: 4,
                  outlineColor: colors.background,
                }}
                aria-hidden
              />
            ) : (
              <View
                style={{
                  outlineWidth: 4,
                  outlineColor: colors.background,
                  borderRadius: 40,
                  overflow: 'hidden',
                }}
              >
                <StillImage
                  src={account.avatar}
                  staticSrc={account.avatar_static}
                  accessibilityLabel={account.avatar_description}
                  style={{
                    height: 80,
                    width: 80,
                  }}
                  contentFit='contain'
                  recyclingKey={`avatar-${account.id}`}
                  aria-hidden={!account.avatar_description}
                />
              </View>
            )}
          </Pressable>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            {ownAccount ? (
              <GlassButton
                mode='contained-tonal'
                onPress={() =>
                  navigation.navigate('settings', {
                    screen: 'edit_profile',
                  })
                }
              >
                <FormattedMessage id='settings.edit_profile' defaultMessage='Edit profile' />
              </GlassButton>
            ) : (
              <FollowButton id={id} />
            )}
            <AccountActionsDropdown account={account} />
          </View>
        </View>
        <CollapsibleContent key={id}>
          <>
            <View style={{ gap: 8, marginHorizontal: 16, marginBottom: 8 }}>
              <View>
                <Text variant='titleMedium' numberOfLines={1}>
                  <Emojify text={account.display_name} emojis={account.emojis} />
                </Text>
                <Text variant='bodyMedium' numberOfLines={1} style={{ color: colors.outline }}>
                  @{account.acct}
                </Text>
              </View>
              <StyledHtml
                html={account.note}
                emojis={account.emojis}
                nyaize={account.speak_as_cat}
              />
              {account.fields.length > 0 && (
                <DataTable>
                  {account.fields.map((field, index) => (
                    <DataTable.Row key={index}>
                      <DataTable.Cell>
                        {field.verified_at ? (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Text>{field.name}</Text>
                            {field.verified_at && (
                              <Chip compact>
                                <FormattedMessage
                                  id='status.verified_field'
                                  defaultMessage='Verified'
                                />
                              </Chip>
                            )}
                          </View>
                        ) : (
                          field.name
                        )}
                      </DataTable.Cell>
                      <DataTable.Cell>
                        <StyledHtml
                          html={field.value}
                          emojis={account.emojis}
                          nyaize={account.speak_as_cat}
                        />
                      </DataTable.Cell>
                    </DataTable.Row>
                  ))}
                </DataTable>
              )}
            </View>
            {account.fields.length === 0 && <Divider />}
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                marginHorizontal: 16,
                marginVertical: 8,
                gap: 8,
              }}
            >
              <Text style={{ display: 'flex', alignItems: 'center' }}>
                <FormattedMessage
                  id='account.statuses_with_count'
                  defaultMessage='{count, plural, one {<strong>#</strong> post} other {<strong>#</strong> posts}}'
                  values={{
                    count: account.statuses_count,
                    strong: (chunks) => <Text variant='bodyMediumEmphasized'>{chunks}</Text>,
                  }}
                />
              </Text>
              <Link
                style={{ display: 'flex', alignItems: 'center' }}
                screen='accounts'
                params={{ screen: 'followers', params: { id: account.id } }}
              >
                <FormattedMessage
                  id='account.followers_with_count'
                  defaultMessage='{count, plural, one {<strong>#</strong> follower} other {<strong>#</strong> followers}}'
                  values={{
                    count: account.followers_count,
                    strong: (chunks) => <Text variant='bodyMediumEmphasized'>{chunks}</Text>,
                  }}
                />
              </Link>
              <Link
                style={{ display: 'flex', alignItems: 'center' }}
                screen='accounts'
                params={{ screen: 'following', params: { id: account.id } }}
              >
                <FormattedMessage
                  id='account.following_with_count'
                  defaultMessage='{count, plural, one {<strong>#</strong> following} other {<strong>#</strong> following}}'
                  values={{
                    count: account.following_count,
                    strong: (chunks) => <Text variant='bodyMediumEmphasized'>{chunks}</Text>,
                  }}
                />
              </Link>
              {account.subscribers_count > 0 && (
                <Link
                  style={{ display: 'flex', alignItems: 'center' }}
                  screen='accounts'
                  params={{ screen: 'subscribers', params: { id: account.id } }}
                >
                  <FormattedMessage
                    id='account.subscribers_with_count'
                    defaultMessage='{count, plural, one {<strong>#</strong> subscriber} other {<strong>#</strong> subscribers}}'
                    values={{
                      count: account.subscribers_count,
                      strong: (chunks) => <Text variant='bodyMediumEmphasized'>{chunks}</Text>,
                    }}
                  />
                </Link>
              )}
            </View>
          </>
        </CollapsibleContent>
      </View>
      <ProfileTabs tabs={tabs} active={tab} onChange={setTab} />
      {tab === 'posts' && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 8,
            marginHorizontal: 16,
          }}
        >
          {timelineFiltersSelector}
          {pinnedCount.current > 3 && skipPinnedButton}
        </View>
      )}
    </>
  );

  return (
    <>
      <Animated.View style={headerStyle}>
        <Appbar.Header
          mode='small'
          style={[
            {
              backgroundColor: colors.surfaceContainer,
            },
            colorScheme === 'dark' &&
              blackTheme && {
                borderBottomWidth: 1,
                borderBottomColor: colors.surfaceContainerHighest,
              },
          ]}
        >
          <CornerInset direction='horizontal' edge='left' />
          {!ownAccount && <HeaderBackButton onPress={navigation.goBack} />}
          <Appbar.Content
            title={
              <View style={{ marginLeft: ownAccount ? 16 : 0 }}>
                <Text variant='titleMedium' numberOfLines={1}>
                  <Emojify text={account.display_name} emojis={account.emojis} />
                </Text>
                <Text style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FormattedMessage
                    id='account.statuses_count'
                    defaultMessage='{count, plural, one {# post} other {# posts}}'
                    values={{ count: account.statuses_count }}
                  />
                </Text>
              </View>
            }
          />
          <AccountActionsDropdown account={account} headerButton visible={showHeader} />
        </Appbar.Header>
      </Animated.View>
      {tab === 'posts' ? (
        <ProfileTimeline
          ref={timelineNode}
          pinnedCountRef={pinnedCount}
          id={account.id}
          onScroll={handleScroll}
          header={header}
          withReplies={profileFilters.showReplies}
          withReblogs={profileFilters.showReblogs}
          withPinned={profileFilters.showPinned}
        />
      ) : tab === 'media' ? (
        <ProfileMedia id={account.id} onScroll={handleScroll} header={header} />
      ) : (
        <ProfileFeatured
          tab={tab}
          account={account}
          onScroll={handleScroll}
          header={header}
          ownAccount={ownAccount}
        />
      )}
      <ComposeButton visible={showComposeButton} />
    </>
  );
};

export { Profile };
