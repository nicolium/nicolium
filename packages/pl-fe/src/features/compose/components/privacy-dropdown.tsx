import React, { useMemo } from 'react';
import { useIntl, defineMessages, IntlShape } from 'react-intl';

import { changeComposeFederated, changeComposeVisibility } from '@/actions/compose';
import DropdownMenu, { MenuItem } from '@/components/dropdown-menu';
import Icon from '@/components/ui/icon';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useCompose } from '@/hooks/use-compose';
import { useFeatures } from '@/hooks/use-features';
import { getOrderedLists } from '@/pages/account-lists/lists';
import { useCircles } from '@/queries/accounts/use-circles';
import { useLists } from '@/queries/accounts/use-lists';

import type { Circle, Features } from 'pl-api';

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
  local: { id: 'privacy.local', defaultMessage: '{privacy} (local-only)' },
});

interface Option {
  icon: string;
  value: string;
  text: string;
  meta?: string;
  items?: Array<Omit<Option, 'items'>>;
}

const getItems = (
  features: Features,
  lists: ReturnType<typeof getOrderedLists>,
  circles: Array<Circle>,
  isReply: boolean,
  intl: IntlShape,
) =>
  [
    {
      icon: require('@phosphor-icons/core/regular/globe.svg'),
      value: 'public',
      text: intl.formatMessage(messages.publicShort),
      meta: intl.formatMessage(messages.publicLong),
    },
    {
      icon: require('@phosphor-icons/core/regular/moon.svg'),
      value: 'unlisted',
      text: intl.formatMessage(messages.unlistedShort),
      meta: intl.formatMessage(messages.unlistedLong),
    },
    {
      icon: require('@phosphor-icons/core/regular/lock.svg'),
      value: 'private',
      text: intl.formatMessage(messages.privateShort),
      meta: intl.formatMessage(messages.privateLong),
    },
    isReply && features.createStatusConversationScope
      ? {
          icon: require('@phosphor-icons/core/regular/chats-circle.svg'),
          value: 'conversation',
          text: intl.formatMessage(messages.conversationShort),
          meta: intl.formatMessage(messages.conversationLong),
        }
      : undefined,
    features.createStatusMutualsOnlyScope
      ? {
          icon: require('@phosphor-icons/core/regular/users-three.svg'),
          value: 'mutuals_only',
          text: intl.formatMessage(messages.mutualsOnlyShort),
          meta: intl.formatMessage(messages.mutualsOnlyLong),
        }
      : undefined,
    features.createStatusSubscribersScope
      ? {
          icon: require('@phosphor-icons/core/regular/coins.svg'),
          value: 'subscribers',
          text: intl.formatMessage(messages.subscribersShort),
          meta: intl.formatMessage(messages.subscribersLong),
        }
      : undefined,
    {
      icon: require('@phosphor-icons/core/regular/at.svg'),
      value: 'direct',
      text: intl.formatMessage(messages.directShort),
      meta: intl.formatMessage(messages.directLong),
    },
    features.createStatusLocalScope
      ? {
          icon: require('@phosphor-icons/core/regular/planet.svg'),
          value: 'local',
          text: intl.formatMessage(messages.localShort),
          meta: intl.formatMessage(messages.localLong),
        }
      : undefined,
    features.createStatusListScope && Object.keys(lists).length
      ? ({
          icon: require('@phosphor-icons/core/regular/list-dashes.svg'),
          value: '',
          items: Object.values(lists).map((list) => ({
            icon: require('@phosphor-icons/core/regular/list-dashes.svg'),
            value: `list:${list.id}`,
            text: list.title,
          })),
          text: intl.formatMessage(messages.listShort),
          meta: intl.formatMessage(messages.listLong),
        } as Option)
      : undefined,
    features.circles && Object.keys(circles).length
      ? ({
          icon: require('@phosphor-icons/core/regular/circles-three.svg'),
          value: '',
          items: Object.values(circles).map((circle) => ({
            icon: require('@phosphor-icons/core/regular/list-dashes.svg'),
            value: `circle:${circle.id}`,
            text: circle.title,
          })),
          text: intl.formatMessage(messages.circleShort),
          meta: intl.formatMessage(messages.circleLong),
        } as Option)
      : undefined,
  ].filter((option): option is Option => !!option);

interface IPrivacyDropdown {
  composeId: string;
  compact?: boolean;
}

const PrivacyDropdown: React.FC<IPrivacyDropdown> = ({ composeId, compact }) => {
  const intl = useIntl();
  const features = useFeatures();
  const dispatch = useAppDispatch();

  const compose = useCompose(composeId);
  const { data: lists = [] } = useLists(getOrderedLists);
  const { data: circles = [] } = useCircles(getOrderedLists);

  const isReply = !!compose.inReplyToId;

  const value = compose.visibility;
  const unavailable = !!compose.editedId;

  const onChange = (value: string) => value && dispatch(changeComposeVisibility(composeId, value));

  const options = useMemo(
    () => getItems(features, lists, circles, isReply, intl),
    [features, lists, circles, isReply],
  );
  const items: Array<MenuItem> = options.map((item) => ({
    ...item,
    action: item.value ? () => onChange(item.value) : undefined,
    active: item.value === value || item.items?.some((item) => item.value === value),
    items: item.items?.map((item) => ({
      ...item,
      action: item.value ? () => onChange(item.value) : undefined,
      active: item.value === value,
    })),
  }));

  if (features.localOnlyStatuses)
    items.push({
      icon: require('@phosphor-icons/core/regular/planet.svg'),
      text: intl.formatMessage(messages.localShort),
      meta: intl.formatMessage(messages.localLong),
      type: 'toggle',
      checked: compose.localOnly,
      onChange: () => dispatch(changeComposeFederated(composeId)),
    });

  const valueOption = useMemo(
    () =>
      [
        options,
        options
          .filter((option) => option.items)
          .map((option) => option.items)
          .flat(),
      ]
        .flat()
        .find((item) => item!.value === value),
    [value, lists, circles],
  );

  if (unavailable) {
    return null;
  }

  const text = compose.visibility
    ? valueOption?.text
    : intl.formatMessage(messages.local, {
        privacy: valueOption?.text,
      });

  return (
    <DropdownMenu items={items} width='16rem'>
      <button title={compact ? text : intl.formatMessage(messages.changePrivacy)}>
        {valueOption?.icon && <Icon src={valueOption.icon} aria-hidden />}
        {compact ? undefined : text}
        <Icon src={require('@phosphor-icons/core/regular/caret-down.svg')} aria-hidden />
      </button>
    </DropdownMenu>
  );
};

export { PrivacyDropdown as default };
