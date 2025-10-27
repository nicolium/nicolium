import React, { useMemo } from 'react';
import { useIntl, defineMessages, IntlShape } from 'react-intl';

import { changeComposeFederated, changeComposeVisibility } from 'pl-fe/actions/compose';
import DropdownMenu, { MenuItem } from 'pl-fe/components/dropdown-menu';
import Button from 'pl-fe/components/ui/button';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useCompose } from 'pl-fe/hooks/use-compose';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { getOrderedLists } from 'pl-fe/pages/account-lists/lists';
import { useCircles } from 'pl-fe/queries/accounts/use-circles';
import { useLists } from 'pl-fe/queries/accounts/use-lists';

import type { Circle, Features } from 'pl-api';

const messages = defineMessages({
  public_short: { id: 'privacy.public.short', defaultMessage: 'Public' },
  public_long: { id: 'privacy.public.long', defaultMessage: 'Post to public timelines' },
  unlisted_short: { id: 'privacy.unlisted.short', defaultMessage: 'Quiet public' },
  unlisted_long: { id: 'privacy.unlisted.long', defaultMessage: 'Not visible in public timelines' },
  private_short: { id: 'privacy.private.short', defaultMessage: 'Followers-only' },
  private_long: { id: 'privacy.private.long', defaultMessage: 'Post to followers only' },
  conversation_short: { id: 'privacy.conversation.short', defaultMessage: 'Conversation' },
  conversation_long: { id: 'privacy.conversation.long', defaultMessage: 'Post to recipients of the parent post' },
  mutuals_only_short: { id: 'privacy.mutuals_only.short', defaultMessage: 'Mutuals-only' },
  mutuals_only_long: { id: 'privacy.mutuals_only.long', defaultMessage: 'Post to mutually followed users only' },
  direct_short: { id: 'privacy.direct.short', defaultMessage: 'Private mention' },
  direct_long: { id: 'privacy.direct.long', defaultMessage: 'Visible to mentioned users only' },
  local_short: { id: 'privacy.local.short', defaultMessage: 'Local-only' },
  local_long: { id: 'privacy.local.long', defaultMessage: 'Only visible on your instance' },
  list_short: { id: 'privacy.list.short', defaultMessage: 'List only' },
  list_long: { id: 'privacy.list.long', defaultMessage: 'Visible to members of a list' },
  circle_short: { id: 'privacy.circle.short', defaultMessage: 'Circle only' },
  circle_long: { id: 'privacy.circle.long', defaultMessage: 'Visible to members of a circle' },
  subscribers_short: { id: 'privacy.subscribers.short', defaultMessage: 'Subscribers-only' },
  subscribers_long: { id: 'privacy.subscribers.long', defaultMessage: 'Post to users subscribing you only' },

  change_privacy: { id: 'privacy.change', defaultMessage: 'Adjust post privacy' },
  local: { id: 'privacy.local', defaultMessage: '{privacy} (local-only)' },
});

interface Option {
  icon: string;
  value: string;
  text: string;
  meta?: string;
  items?: Array<Omit<Option, 'items'>>;
}

const getItems = (features: Features, lists: ReturnType<typeof getOrderedLists>, circles: Array<Circle>, isReply: boolean, intl: IntlShape) => [
  {
    icon: require('@phosphor-icons/core/regular/globe.svg'),
    value: 'public',
    text: intl.formatMessage(messages.public_short),
    meta: intl.formatMessage(messages.public_long),
  },
  {
    icon: require('@phosphor-icons/core/regular/moon.svg'),
    value: 'unlisted',
    text: intl.formatMessage(messages.unlisted_short),
    meta: intl.formatMessage(messages.unlisted_long),
  },
  {
    icon: require('@phosphor-icons/core/regular/lock.svg'),
    value: 'private',
    text: intl.formatMessage(messages.private_short),
    meta: intl.formatMessage(messages.private_long),
  },
  isReply && features.createStatusConversationScope ? {
    icon: require('@phosphor-icons/core/regular/chats-circle.svg'),
    value: 'conversation',
    text: intl.formatMessage(messages.conversation_short),
    meta: intl.formatMessage(messages.conversation_long),
  } : undefined,
  features.createStatusMutualsOnlyScope ? {
    icon: require('@phosphor-icons/core/regular/users-three.svg'),
    value: 'mutuals_only',
    text: intl.formatMessage(messages.mutuals_only_short),
    meta: intl.formatMessage(messages.mutuals_only_long),
  } : undefined,
  features.createStatusSubscribersScope ? {
    icon: require('@phosphor-icons/core/regular/coins.svg'),
    value: 'subscribers',
    text: intl.formatMessage(messages.subscribers_short),
    meta: intl.formatMessage(messages.subscribers_long),
  } : undefined,
  {
    icon: require('@phosphor-icons/core/regular/at.svg'),
    value: 'direct',
    text: intl.formatMessage(messages.direct_short),
    meta: intl.formatMessage(messages.direct_long),
  },
  features.createStatusLocalScope ? {
    icon: require('@phosphor-icons/core/regular/planet.svg'),
    value: 'local',
    text: intl.formatMessage(messages.local_short),
    meta: intl.formatMessage(messages.local_long),
  } : undefined,
  features.createStatusListScope && Object.keys(lists).length ? {
    icon: require('@phosphor-icons/core/regular/list-dashes.svg'),
    value: '',
    items: Object.values(lists).map((list) => ({
      icon: require('@phosphor-icons/core/regular/list-dashes.svg'),
      value: `list:${list.id}`,
      text: list.title,
    })),
    text: intl.formatMessage(messages.list_short),
    meta: intl.formatMessage(messages.list_long),
  } as Option : undefined,
  features.circles && Object.keys(circles).length ? {
    icon: require('@phosphor-icons/core/regular/circles-three.svg'),
    value: '',
    items: Object.values(circles).map((circle) => ({
      icon: require('@phosphor-icons/core/regular/list-dashes.svg'),
      value: `circle:${circle.id}`,
      text: circle.title,
    })),
    text: intl.formatMessage(messages.circle_short),
    meta: intl.formatMessage(messages.circle_long),
  } as Option : undefined,
].filter((option): option is Option => !!option);

interface IPrivacyDropdown {
  composeId: string;
  compact?: boolean;
}

const PrivacyDropdown: React.FC<IPrivacyDropdown> = ({
  composeId,
  compact,
}) => {
  const intl = useIntl();
  const features = useFeatures();
  const dispatch = useAppDispatch();

  const compose = useCompose(composeId);
  const { data: lists = [] } = useLists(getOrderedLists);
  const { data: circles = [] } = useCircles(getOrderedLists);

  const isReply = !!compose.in_reply_to;

  const value = compose.privacy;
  const unavailable = compose.id;

  const onChange = (value: string) => value && dispatch(changeComposeVisibility(composeId,
    value));

  const options = useMemo(() => getItems(features, lists, circles, isReply, intl), [features, lists, circles, isReply]);
  const items: Array<MenuItem> = options.map(item => ({
    ...item,
    action: item.value ? () => onChange(item.value) : undefined,
    active: item.value === value || item.items?.some((item) => item.value === value),
    items: item.items?.map(item => ({
      ...item,
      action: item.value ? () => onChange(item.value) : undefined,
      active: item.value === value,
    })),
  }));

  if (features.localOnlyStatuses) items.push({
    icon: require('@phosphor-icons/core/regular/planet.svg'),
    text: intl.formatMessage(messages.local_short),
    meta: intl.formatMessage(messages.local_long),
    type: 'toggle',
    checked: !compose.federated,
    onChange: () => dispatch(changeComposeFederated(composeId)),
  });

  const valueOption = useMemo(() => [
    options,
    options.filter(option => option.items).map(option => option.items).flat(),
  ].flat().find(item => item!.value === value), [value, lists, circles]);

  if (unavailable) {
    return null;
  }

  const text = compose.federated ? valueOption?.text : intl.formatMessage(messages.local, {
    privacy: valueOption?.text,
  });

  return (
    <DropdownMenu items={items} width='16rem'>
      <Button
        theme='muted'
        size='xs'
        text={compact ? undefined : text}
        icon={valueOption?.icon}
        secondaryIcon={require('@phosphor-icons/core/regular/caret-down.svg')}
        title={compact ? text : intl.formatMessage(messages.change_privacy)}
      />
    </DropdownMenu>
  );
};

export { PrivacyDropdown as default };
