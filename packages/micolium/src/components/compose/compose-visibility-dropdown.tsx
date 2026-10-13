import { Chip, Icon, useTheme } from '@mkljczk/react-native-paper';
import {
  AtIcon,
  CaretDownIcon,
  ChatsCircleIcon,
  CirclesFourIcon,
  CoinsIcon,
  GlobeIcon,
  ListDashesIcon,
  LockIcon,
  MoonIcon,
  PlanetIcon,
  UsersThreeIcon,
  type Icon as PhosphorIcon,
} from 'phosphor-react-native';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl, type MessageDescriptor } from 'react-intl';
import { View } from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu';

import { iconHelper } from '@/components/ui/icon';
import { useFeatures } from '@/contexts/current-account-context';
import { useCircles } from '@/queries/accounts/use-circles';
import { useLists } from '@/queries/accounts/use-lists';
import { useCompose, useComposeActions } from '@/stores/compose';
import { useSetting } from '@/stores/settings';

import type { SFSymbol } from '@/utils/types';

const messages = defineMessages({
  publicShort: { id: 'privacy.public.short', defaultMessage: 'Public' },
  publicLong: { id: 'privacy.public.long', defaultMessage: 'Post to public timelines' },
  unlistedShort: { id: 'privacy.unlisted.short', defaultMessage: 'Quiet public' },
  unlistedLong: { id: 'privacy.unlisted.long', defaultMessage: 'Not visible in public timelines' },
  privateShort: { id: 'privacy.private.short', defaultMessage: 'Followers-only' },
  privateLong: { id: 'privacy.private.long', defaultMessage: 'Post to followers only' },
  conversationShort: { id: 'privacy.conversation.short', defaultMessage: 'Conversation' },
  conversationLong: {
    id: 'privacy.conversation.long',
    defaultMessage: 'Post to recipients of the parent post',
  },
  mutualsOnlyShort: { id: 'privacy.mutuals_only.short', defaultMessage: 'Mutuals-only' },
  mutualsOnlyLong: {
    id: 'privacy.mutuals_only.long',
    defaultMessage: 'Post to mutually followed users only',
  },
  directShort: { id: 'privacy.direct.short', defaultMessage: 'Private mention' },
  directLong: { id: 'privacy.direct.long', defaultMessage: 'Visible to mentioned users only' },
  localShort: { id: 'privacy.local.short', defaultMessage: 'Local-only' },
  localLong: { id: 'privacy.local.long', defaultMessage: 'Only visible on your instance' },
  listShort: { id: 'privacy.list.short', defaultMessage: 'List only' },
  listLong: { id: 'privacy.list.long', defaultMessage: 'Visible to members of a list' },
  circleShort: { id: 'privacy.circle.short', defaultMessage: 'Circle only' },
  circleLong: { id: 'privacy.circle.long', defaultMessage: 'Visible to members of a circle' },
  subscribersShort: { id: 'privacy.subscribers.short', defaultMessage: 'Subscribers-only' },
  subscribersLong: {
    id: 'privacy.subscribers.long',
    defaultMessage: 'Post to users subscribing you only',
  },

  changePrivacy: { id: 'privacy.change', defaultMessage: 'Adjust post privacy' },
  loading: { id: 'loading_indicator.label', defaultMessage: 'Loading…' },
  noLists: { id: 'column.lists.empty', defaultMessage: 'You have no lists yet.' },
  noCircles: { id: 'column.circles.empty', defaultMessage: 'You have no circles yet.' },
});

const getVisibilityIcon = (visibility: string): PhosphorIcon => {
  switch (visibility) {
    case 'unlisted':
      return MoonIcon;
    case 'private':
      return LockIcon;
    case 'conversation':
      return ChatsCircleIcon;
    case 'mutuals_only':
      return UsersThreeIcon;
    case 'subscribers':
      return CoinsIcon;
    case 'direct':
      return AtIcon;
    case 'local':
      return PlanetIcon;
    default:
      if (visibility.startsWith('list:')) return ListDashesIcon;
      if (visibility.startsWith('circle:')) return CirclesFourIcon;
      return GlobeIcon;
  }
};

interface IVisibilityLabel {
  visibility: string;
}

const VisibilityLabel: React.FC<IVisibilityLabel> = ({ visibility }) => {
  const { data: lists } = useLists(visibility.startsWith('list:'));
  const { data: circles } = useCircles(visibility.startsWith('circle:'));

  switch (visibility) {
    case 'public':
      return <FormattedMessage id='privacy.public.short' defaultMessage='Public' />;
    case 'unlisted':
      return <FormattedMessage id='privacy.unlisted.short' defaultMessage='Quiet public' />;
    case 'private':
      return <FormattedMessage id='privacy.private.short' defaultMessage='Followers-only' />;
    case 'conversation':
      return <FormattedMessage id='privacy.conversation.short' defaultMessage='Conversation' />;
    case 'mutuals_only':
      return <FormattedMessage id='privacy.mutuals_only.short' defaultMessage='Mutuals-only' />;
    case 'subscribers':
      return <FormattedMessage id='privacy.subscribers.short' defaultMessage='Subscribers-only' />;
    case 'direct':
      return <FormattedMessage id='privacy.direct.short' defaultMessage='Private mention' />;
    case 'local':
      return <FormattedMessage id='privacy.local.short' defaultMessage='Local-only' />;
    default:
      if (visibility.startsWith('list:')) {
        return lists?.find((list) => `list:${list.id}` === visibility)?.title ?? '';
      }
      if (visibility.startsWith('circle:')) {
        return circles?.find((circle) => `circle:${circle.id}` === visibility)?.title ?? '';
      }
      return visibility;
  }
};

interface IComposeVisibilityDropdown {
  composeId: string;
}

const ComposeVisibilityDropdown: React.FC<IComposeVisibilityDropdown> = ({ composeId }) => {
  const { colors } = useTheme();
  const intl = useIntl();
  const features = useFeatures();
  const defaultPrivacy = useSetting('compose.defaultPrivacy');

  const compose = useCompose(composeId);
  const { updateCompose } = useComposeActions();

  const visibility = compose.visibility === 'default' ? defaultPrivacy : compose.visibility;
  const isReply = !!compose.inReplyToId;

  const { data: lists } = useLists(features.createStatusListScope);
  const { data: circles } = useCircles(features.circles);

  const handleChangeVisibility = (newVisibility: string) => () => {
    updateCompose(composeId, (draft) => {
      draft.visibility = newVisibility;
    });
  };

  const handleToggleLocalOnly = () =>
    updateCompose(composeId, (draft) => {
      draft.localOnly = !draft.localOnly;
    });

  if (compose.editedId) return null;

  const getVisibilityItem = (
    value: string,
    icon: SFSymbol,
    title: MessageDescriptor,
    subtitle: MessageDescriptor,
  ) => (
    <DropdownMenu.CheckboxItem
      key={value}
      value={visibility === value}
      onSelect={handleChangeVisibility(value)}
    >
      <DropdownMenu.ItemIcon ios={{ name: icon }} />
      <DropdownMenu.ItemTitle>{intl.formatMessage(title)}</DropdownMenu.ItemTitle>
      <DropdownMenu.ItemSubtitle>{intl.formatMessage(subtitle)}</DropdownMenu.ItemSubtitle>
    </DropdownMenu.CheckboxItem>
  );

  const getListsSubMenu = (
    name: 'list' | 'circle',
    lists?: Array<{ id: string; title: string }>,
  ) => {
    const listIcon: SFSymbol = name === 'circle' ? 'circle.grid.2x2' : 'list.bullet';
    const title = name === 'circle' ? messages.circleShort : messages.listShort;
    const subtitle = name === 'circle' ? messages.circleLong : messages.listLong;
    const emptyMessage = name === 'circle' ? messages.noCircles : messages.noLists;

    return (
      <DropdownMenu.Sub key={name}>
        <DropdownMenu.SubTrigger key={`${name}-sub`}>
          <DropdownMenu.ItemIcon ios={{ name: listIcon }} />
          <DropdownMenu.ItemTitle>{intl.formatMessage(title)}</DropdownMenu.ItemTitle>
          <DropdownMenu.ItemSubtitle>{intl.formatMessage(subtitle)}</DropdownMenu.ItemSubtitle>
        </DropdownMenu.SubTrigger>
        <DropdownMenu.SubContent>
          {lists ? (
            lists.length ? (
              lists.map((list) => (
                <DropdownMenu.CheckboxItem
                  key={`${name}:${list.id}`}
                  value={visibility === `${name}:${list.id}`}
                  onSelect={handleChangeVisibility(`${name}:${list.id}`)}
                >
                  <DropdownMenu.ItemIcon ios={{ name: listIcon }} />
                  <DropdownMenu.ItemTitle>{list.title}</DropdownMenu.ItemTitle>
                </DropdownMenu.CheckboxItem>
              ))
            ) : (
              <DropdownMenu.Item key={`${name}-empty`} disabled>
                <DropdownMenu.ItemTitle>{intl.formatMessage(emptyMessage)}</DropdownMenu.ItemTitle>
              </DropdownMenu.Item>
            )
          ) : (
            <DropdownMenu.Item key={`${name}-loading`} disabled>
              <DropdownMenu.ItemTitle>
                {intl.formatMessage(messages.loading)}
              </DropdownMenu.ItemTitle>
            </DropdownMenu.Item>
          )}
        </DropdownMenu.SubContent>
      </DropdownMenu.Sub>
    );
  };

  return (
    <View style={{ alignItems: 'flex-start' }}>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Chip
            mode='outlined'
            icon={iconHelper(getVisibilityIcon(visibility))}
            accessibilityLabel={intl.formatMessage(messages.changePrivacy)}
          >
            {compose.localOnly ? (
              <FormattedMessage
                id='privacy.local'
                defaultMessage='{privacy} (local-only)'
                values={{
                  privacy: <VisibilityLabel visibility={visibility} />,
                }}
              />
            ) : (
              <VisibilityLabel visibility={visibility} />
            )}
            <View style={{ paddingLeft: 4 }}>
              <Icon source={iconHelper(CaretDownIcon)} size={16} color={colors.onSurfaceVariant} />
            </View>
          </Chip>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Label>{intl.formatMessage(messages.changePrivacy)}</DropdownMenu.Label>
          <DropdownMenu.Group>
            {getVisibilityItem('public', 'globe', messages.publicShort, messages.publicLong)}
            {getVisibilityItem('unlisted', 'moon', messages.unlistedShort, messages.unlistedLong)}
            {getVisibilityItem('private', 'lock', messages.privateShort, messages.privateLong)}
            {isReply &&
              features.createStatusConversationScope &&
              getVisibilityItem(
                'conversation',
                'bubble.left.and.bubble.right',
                messages.conversationShort,
                messages.conversationLong,
              )}
            {features.createStatusMutualsOnlyScope &&
              getVisibilityItem(
                'mutuals_only',
                'person.3',
                messages.mutualsOnlyShort,
                messages.mutualsOnlyLong,
              )}
            {features.createStatusSubscribersScope &&
              getVisibilityItem(
                'subscribers',
                'dollarsign.circle',
                messages.subscribersShort,
                messages.subscribersLong,
              )}
            {getVisibilityItem('direct', 'at', messages.directShort, messages.directLong)}
            {features.createStatusLocalScope &&
              getVisibilityItem('local', 'globe.desk', messages.localShort, messages.localLong)}
            {features.createStatusListScope && getListsSubMenu('list', lists)}
            {features.circles && getListsSubMenu('circle', circles)}
          </DropdownMenu.Group>
          {features.localOnlyStatuses && (
            <DropdownMenu.Group>
              <DropdownMenu.CheckboxItem
                key='local-only'
                value={compose.localOnly}
                onValueChange={handleToggleLocalOnly}
              >
                <DropdownMenu.ItemIcon ios={{ name: 'building.2' }} />
                <DropdownMenu.ItemTitle>
                  {intl.formatMessage(messages.localShort)}
                </DropdownMenu.ItemTitle>
                <DropdownMenu.ItemSubtitle>
                  {intl.formatMessage(messages.localLong)}
                </DropdownMenu.ItemSubtitle>
              </DropdownMenu.CheckboxItem>
            </DropdownMenu.Group>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </View>
  );
};

export { ComposeVisibilityDropdown };
