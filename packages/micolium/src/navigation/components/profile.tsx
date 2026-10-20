import {
  ActivityIndicator,
  Appbar,
  Avatar,
  Button,
  Chip,
  DataTable,
  Divider,
  Icon,
  Text,
  useTheme,
} from '@mkljczk/react-native-paper';
import { Link, useNavigation } from '@react-navigation/native';
import { GlassView } from 'expo-glass-effect';
import { Image } from 'expo-image';
import { CaretDownIcon } from 'phosphor-react-native/src/icons/CaretDown';
import { mediaAttachmentSchema } from 'pl-api';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { type NativeScrollEvent, type NativeSyntheticEvent, Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as v from 'valibot';
import * as DropdownMenu from 'zeego/dropdown-menu';

import { AccountActionsDropdown } from '@/components/accounts/account-actions-dropdown';
import { FollowButton } from '@/components/accounts/follow-button';
import { ComposeButton } from '@/components/compose-button';
import { CollapsibleContent } from '@/components/ui/collapsible-content';
import { Emojify } from '@/components/ui/emojify';
import { iconHelper } from '@/components/ui/icon';
import { StyledHtml } from '@/components/ui/styled-html';
import { useClient } from '@/contexts/current-account-context';
import { useEnableLiquidGlass } from '@/hooks/use-enable-liquid-glass';
import { useAccount } from '@/queries/accounts/use-account';
import { useTimeline } from '@/queries/timelines/use-timeline';
import { useUiStoreActions } from '@/stores/ui';

import { type ITimeline, Timeline } from '../components/timeline';
import { GlassButton } from '@/components/ui/glass-button';

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
    id: 'account.filters.label.all',
    defaultMessage: 'All activity, without pinned',
  },
  filtersWithReblogsExceptPinned: {
    id: 'account.filters.label.with_reblogs',
    defaultMessage: 'Posts and boosts, without pinned',
  },
  filtersWithRepliesExceptPinned: {
    id: 'account.filters.label.with_replies',
    defaultMessage: 'Posts and replies, without pinned',
  },
  filtersNoneExceptPinned: {
    id: 'account.filters.label.none',
    defaultMessage: 'Posts, without pinned',
  },
});

interface IProfileTimeline extends Pick<ITimeline, 'header'> {
  id: string;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  withReplies?: boolean;
  withReblogs?: boolean;
  withPinned?: boolean;
}

const PostsTimeline: React.FC<IProfileTimeline> = ({
  id,
  withReplies,
  withReblogs,
  withPinned,
  ...props
}) => {
  const client = useClient();

  const pinnedQuery = useTimeline(`account:${id}:pinned`, (paginationParams) =>
    client.accounts.getAccountStatuses(id, { ...paginationParams, pinned: true }),
  );

  const timelineQuery = useTimeline(
    `account:${id}${withReblogs ? '' : ':exclude_reblogs'}${withReplies ? '' : ':exclude_replies'}`,
    (paginationParams) =>
      client.accounts.getAccountStatuses(id, {
        ...paginationParams,
        exclude_reblogs: !withReblogs,
        exclude_replies: !withReplies,
      }),
  );

  return (
    <Timeline
      query={timelineQuery}
      pinnedQuery={withPinned ? pinnedQuery : undefined}
      emptyMessageHeading={
        <FormattedMessage id='empty_column.account_timeline' defaultMessage='No posts here!' />
      }
      context='account'
      {...props}
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
  const { top: topInset } = useSafeAreaInsets();
  const { data: account } = useAccount(id, !ownAccount);
  const navigation = useNavigation();
  const profileInfoNode = React.useRef<View>(null);
  const previousScrollOffset = React.useRef<number>(0);
  const glassEffect = useEnableLiquidGlass();
  const { openMediaViewer } = useUiStoreActions();

  const [showReplies, setShowReplies] = React.useState(false);
  const [showReblogs, setShowReblogs] = React.useState(true);
  const [showPinned, setShowPinned] = React.useState(true);
  const [showComposeButton, setShowComposeButton] = React.useState(true);

  const headerMarginTop = useSharedValue(-64 - topInset);
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
      chips.push(
        <Chip key='requested' mode='flat' compact>
          <FormattedMessage
            id='account.requested_follow'
            defaultMessage='Requested to follow you'
          />
        </Chip>,
      );
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

  if (!account)
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size='large' />
      </View>
    );

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.y || event.target?.scrollTop || 0;
    const showHeader =
      !!profileInfoNode.current &&
      scrollOffset + topInset > profileInfoNode.current.getBoundingClientRect().height;
    headerMarginTop.value = withTiming(showHeader ? 0 : -64 - topInset);
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
    if (showReblogs && showReplies) {
      return intl.formatMessage(showPinned ? messages.filtersAll : messages.filtersAllExceptPinned);
    } else if (showReblogs) {
      return intl.formatMessage(
        showPinned ? messages.filtersWithReblogs : messages.filtersWithReblogsExceptPinned,
      );
    } else if (showReplies) {
      return intl.formatMessage(
        showPinned ? messages.filtersWithReplies : messages.filtersWithRepliesExceptPinned,
      );
    } else {
      return intl.formatMessage(
        showPinned ? messages.filtersNone : messages.filtersNoneExceptPinned,
      );
    }
  })();

  const timelineFiltersSelector = (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <View style={{ flexDirection: 'row', marginHorizontal: 16 }}>
          {glassEffect ? (
            <Pressable onPress={() => {}}>
              <GlassView
                style={{
                  gap: 4,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderRadius: 16,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                }}
              >
                <Text>{filtersLabel}</Text>
                <Icon
                  source={iconHelper(CaretDownIcon)}
                  size={16}
                  color={colors.onSurfaceVariant}
                />
              </GlassView>
            </Pressable>
          ) : (
            <Chip mode='outlined' accessibilityLabel={intl.formatMessage(messages.changeFilters)}>
              {filtersLabel}
              <View style={{ paddingLeft: 4 }}>
                <Icon
                  source={iconHelper(CaretDownIcon)}
                  size={16}
                  color={colors.onSurfaceVariant}
                />
              </View>
            </Chip>
          )}
        </View>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.CheckboxItem
          key='show-replies'
          value={showReplies}
          onSelect={() => setShowReplies((value) => !value)}
        >
          {intl.formatMessage(messages.repliesToggle)}
        </DropdownMenu.CheckboxItem>
        <DropdownMenu.CheckboxItem
          key='show-reblogs'
          value={showReblogs}
          onSelect={() => setShowReblogs((value) => !value)}
        >
          {intl.formatMessage(messages.reblogsToggle)}
        </DropdownMenu.CheckboxItem>
        <DropdownMenu.CheckboxItem
          key='show-pinned'
          value={showPinned}
          onSelect={() => setShowPinned((value) => !value)}
        >
          {intl.formatMessage(messages.pinnedToggle)}
        </DropdownMenu.CheckboxItem>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
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
          <Image
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
            source={{
              uri: account.header,
            }}
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
            <Avatar.Image
              source={{ uri: account.avatar }}
              size={80}
              accessibilityLabel={account.avatar_description}
              style={{
                outlineWidth: 4,
                outlineColor: colors.background,
              }}
            />
          </Pressable>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            {ownAccount ? (
              <GlassButton mode='contained-tonal' onPress={() => navigation.navigate('edit-profile')}>
                <FormattedMessage id='settings.edit_profile' defaultMessage='Edit profile' />
              </GlassButton>
            ) : (
              <FollowButton id={id} />
            )}
            <AccountActionsDropdown account={account} />
          </View>
        </View>
        <CollapsibleContent>
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
              <StyledHtml html={account.note} emojis={account.emojis} />
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
                        <StyledHtml html={field.value} emojis={account.emojis} />
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
                  defaultMessage='{count, plural, one {<strong>#</strong> status} other {<strong>#</strong> statuses}}'
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
      {timelineFiltersSelector}
    </>
  );

  return (
    <>
      <Animated.View style={headerStyle}>
        <Appbar.Header style={{ backgroundColor: colors.surfaceContainer }}>
          {!ownAccount && <Appbar.BackAction onPress={navigation.goBack} />}
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
        </Appbar.Header>
      </Animated.View>
      <PostsTimeline
        id={account.id}
        onScroll={handleScroll}
        header={header}
        withReplies={showReplies}
        withReblogs={showReblogs}
        withPinned={showPinned}
      />
      <ComposeButton visible={showComposeButton} />
    </>
  );
};

export { Profile };
