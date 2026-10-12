import {
  ActivityIndicator,
  Checkbox,
  Chip,
  Divider,
  Icon,
  Menu,
  useTheme,
} from '@mkljczk/react-native-paper';
import {
  AtIcon,
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  ChatsCircleIcon,
  CheckIcon,
  CirclesThreeIcon,
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
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { View } from 'react-native';

import { iconHelper } from '@/components/ui/icon';
import { useFeatures } from '@/contexts/current-account-context';
import { useCircles } from '@/queries/accounts/use-circles';
import { useLists } from '@/queries/accounts/use-lists';
import { useCompose, useComposeActions } from '@/stores/compose';
import { useSetting } from '@/stores/settings';

const messages = defineMessages({
  changePrivacy: { id: 'privacy.change', defaultMessage: 'Adjust post privacy' },
  back: { id: 'navigation_bar.back', defaultMessage: 'Back' },
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
      if (visibility.startsWith('circle:')) return CirclesThreeIcon;
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

  const [showMenu, setShowMenu] = React.useState(false);
  const [menuPage, setMenuPage] = React.useState<'visibility' | 'lists' | 'circles'>('visibility');

  const { data: lists } = useLists(menuPage === 'lists');
  const { data: circles } = useCircles(menuPage === 'circles');

  const closeMenu = () => {
    setShowMenu(false);
    setMenuPage('visibility');
  };

  const handleChangeVisibility = (newVisibility: string) => () => {
    closeMenu();
    updateCompose(composeId, (draft) => {
      draft.visibility = newVisibility;
    });
  };

  const handleToggleLocalOnly = () =>
    updateCompose(composeId, (draft) => {
      draft.localOnly = !draft.localOnly;
    });

  if (compose.editedId) return null;

  let menuContent;

  const getListsMenuPage = (
    name: 'list' | 'circle',
    lists?: Array<{ id: string; title: string }>,
  ) => {
    const listIcon = name === 'circle' ? CirclesThreeIcon : ListDashesIcon;
    const emptyMessage = name === 'circle' ? messages.noCircles : messages.noLists;

    return (
      <>
        <Menu.Item
          leadingIcon={iconHelper(CaretLeftIcon)}
          onPress={() => setMenuPage('visibility')}
          title={intl.formatMessage(messages.back)}
        />
        <Divider />
        {lists ? (
          lists.length ? (
            lists.map((list) => (
              <Menu.Item
                key={list.id}
                onPress={handleChangeVisibility(`${name}:${list.id}`)}
                title={list.title}
                leadingIcon={iconHelper(listIcon)}
                selected={visibility === `${name}:${list.id}`}
              />
            ))
          ) : (
            <Menu.Item title={intl.formatMessage(emptyMessage)} />
          )
        ) : (
          <ActivityIndicator style={{ paddingVertical: 8 }} />
        )}
      </>
    );
  };

  switch (menuPage) {
    case 'visibility': {
      menuContent = (
        <>
          <Menu.Item
            onPress={handleChangeVisibility('public')}
            title={<FormattedMessage id='privacy.public.short' defaultMessage='Public' />}
            supportingText={
              <FormattedMessage
                id='privacy.public.long'
                defaultMessage='Post to public timelines'
              />
            }
            leadingIcon={iconHelper(GlobeIcon)}
            selected={visibility === 'public'}
          />
          <Menu.Item
            onPress={handleChangeVisibility('unlisted')}
            title={<FormattedMessage id='privacy.unlisted.short' defaultMessage='Quiet public' />}
            supportingText={
              <FormattedMessage
                id='privacy.unlisted.long'
                defaultMessage='Not visible in public timelines'
              />
            }
            leadingIcon={iconHelper(MoonIcon)}
            selected={visibility === 'unlisted'}
          />
          <Menu.Item
            onPress={handleChangeVisibility('private')}
            title={<FormattedMessage id='privacy.private.short' defaultMessage='Followers-only' />}
            supportingText={
              <FormattedMessage id='privacy.private.long' defaultMessage='Post to followers only' />
            }
            leadingIcon={iconHelper(LockIcon)}
            selected={visibility === 'private'}
          />
          {isReply && features.createStatusConversationScope && (
            <Menu.Item
              onPress={handleChangeVisibility('conversation')}
              title={
                <FormattedMessage id='privacy.conversation.short' defaultMessage='Conversation' />
              }
              supportingText={
                <FormattedMessage
                  id='privacy.conversation.long'
                  defaultMessage='Post to recipients of the parent post'
                />
              }
              leadingIcon={iconHelper(ChatsCircleIcon)}
              selected={visibility === 'conversation'}
            />
          )}
          {features.createStatusMutualsOnlyScope && (
            <Menu.Item
              onPress={handleChangeVisibility('mutuals_only')}
              title={
                <FormattedMessage id='privacy.mutuals_only.short' defaultMessage='Mutuals-only' />
              }
              supportingText={
                <FormattedMessage
                  id='privacy.mutuals_only.long'
                  defaultMessage='Post to mutually followed users only'
                />
              }
              leadingIcon={iconHelper(UsersThreeIcon)}
              selected={visibility === 'mutuals_only'}
            />
          )}
          {features.createStatusSubscribersScope && (
            <Menu.Item
              onPress={handleChangeVisibility('subscribers')}
              title={
                <FormattedMessage
                  id='privacy.subscribers.short'
                  defaultMessage='Subscribers-only'
                />
              }
              supportingText={
                <FormattedMessage
                  id='privacy.subscribers.long'
                  defaultMessage='Post to users subscribing you only'
                />
              }
              leadingIcon={iconHelper(CoinsIcon)}
              selected={visibility === 'subscribers'}
            />
          )}
          <Menu.Item
            onPress={handleChangeVisibility('direct')}
            title={<FormattedMessage id='privacy.direct.short' defaultMessage='Private mention' />}
            supportingText={
              <FormattedMessage
                id='privacy.direct.long'
                defaultMessage='Visible to mentioned users only'
              />
            }
            leadingIcon={iconHelper(AtIcon)}
            selected={visibility === 'direct'}
          />
          {features.createStatusLocalScope && (
            <Menu.Item
              onPress={handleChangeVisibility('local')}
              title={<FormattedMessage id='privacy.local.short' defaultMessage='Local-only' />}
              supportingText={
                <FormattedMessage
                  id='privacy.local.long'
                  defaultMessage='Only visible on your instance'
                />
              }
              leadingIcon={iconHelper(PlanetIcon)}
              selected={visibility === 'local'}
            />
          )}
          {features.createStatusListScope && (
            <Menu.Item
              onPress={() => setMenuPage('lists')}
              title={<FormattedMessage id='privacy.list.short' defaultMessage='List only' />}
              supportingText={
                <FormattedMessage
                  id='privacy.list.long'
                  defaultMessage='Visible to members of a list'
                />
              }
              contentStyle={{ flex: 1 }}
              leadingIcon={iconHelper(ListDashesIcon)}
              trailingIcon={iconHelper(CaretRightIcon)}
              selected={visibility.startsWith('list:')}
            />
          )}
          {features.circles && (
            <Menu.Item
              onPress={() => setMenuPage('circles')}
              title={<FormattedMessage id='privacy.circle.short' defaultMessage='Circle only' />}
              supportingText={
                <FormattedMessage
                  id='privacy.circle.long'
                  defaultMessage='Visible to members of a circle'
                />
              }
              contentStyle={{ flex: 1 }}
              leadingIcon={iconHelper(CirclesThreeIcon)}
              trailingIcon={iconHelper(CaretRightIcon)}
              selected={visibility.startsWith('circle:')}
            />
          )}
          {features.localOnlyStatuses && (
            <>
              <Divider />
              <Menu.Item
                onPress={handleToggleLocalOnly}
                title={<FormattedMessage id='privacy.local.short' defaultMessage='Local-only' />}
                supportingText={
                  <FormattedMessage
                    id='privacy.local.long'
                    defaultMessage='Only visible on your instance'
                  />
                }
                contentStyle={{ flex: 1 }}
                leadingIcon={iconHelper(PlanetIcon)}
                trailingIcon={() => (
                  <Checkbox
                    status={compose.localOnly ? 'checked' : 'unchecked'}
                    onPress={handleToggleLocalOnly}
                    style={{ marginLeft: -12 }}
                  />
                )}
                selected={compose.localOnly}
              />
            </>
          )}
        </>
      );
      break;
    }
    case 'lists': {
      menuContent = getListsMenuPage('list', lists);
      break;
    }
    case 'circles': {
      menuContent = getListsMenuPage('circle', circles);
      break;
    }
  }

  return (
    <View style={{ alignItems: 'flex-start' }}>
      <Menu
        anchor={
          <Chip
            mode='outlined'
            icon={iconHelper(getVisibilityIcon(visibility))}
            accessibilityLabel={intl.formatMessage(messages.changePrivacy)}
            onPress={() => setShowMenu(true)}
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
        }
        anchorPosition='bottom'
        visible={showMenu}
        onDismiss={closeMenu}
      >
        {menuContent}
      </Menu>
    </View>
  );
};

export { ComposeVisibilityDropdown };
