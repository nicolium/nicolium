import iconAt from '@phosphor-icons/core/regular/at.svg';
import iconCaretDown from '@phosphor-icons/core/regular/caret-down.svg';
import iconChatsCircle from '@phosphor-icons/core/regular/chats-circle.svg';
import iconCirclesThree from '@phosphor-icons/core/regular/circles-three.svg';
import iconCoins from '@phosphor-icons/core/regular/coins.svg';
import iconGlobe from '@phosphor-icons/core/regular/globe.svg';
import iconListDashes from '@phosphor-icons/core/regular/list-dashes.svg';
import iconLock from '@phosphor-icons/core/regular/lock.svg';
import iconMoon from '@phosphor-icons/core/regular/moon.svg';
import iconPlanet from '@phosphor-icons/core/regular/planet.svg';
import iconUsersThree from '@phosphor-icons/core/regular/users-three.svg';
import React, { useMemo } from 'react';
import { useIntl, defineMessages, type IntlShape } from 'react-intl';

import DropdownMenu, { type MenuItem } from '@/components/dropdown-menu';
import Icon from '@/components/ui/icon';
import { useFeatures } from '@/hooks/use-features';
import { getOrderedLists } from '@/pages/account-lists/lists';
import { useCircles } from '@/queries/accounts/use-circles';
import { useLists } from '@/queries/accounts/use-lists';
import { useCompose, useComposeActions, useComposeVisibility } from '@/stores/compose';

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
      icon: iconGlobe,
      value: 'public',
      text: intl.formatMessage(messages.publicShort),
      meta: intl.formatMessage(messages.publicLong),
    },
    {
      icon: iconMoon,
      value: 'unlisted',
      text: intl.formatMessage(messages.unlistedShort),
      meta: intl.formatMessage(messages.unlistedLong),
    },
    {
      icon: iconLock,
      value: 'private',
      text: intl.formatMessage(messages.privateShort),
      meta: intl.formatMessage(messages.privateLong),
    },
    isReply && features.createStatusConversationScope
      ? {
          icon: iconChatsCircle,
          value: 'conversation',
          text: intl.formatMessage(messages.conversationShort),
          meta: intl.formatMessage(messages.conversationLong),
        }
      : undefined,
    features.createStatusMutualsOnlyScope
      ? {
          icon: iconUsersThree,
          value: 'mutuals_only',
          text: intl.formatMessage(messages.mutualsOnlyShort),
          meta: intl.formatMessage(messages.mutualsOnlyLong),
        }
      : undefined,
    features.createStatusSubscribersScope
      ? {
          icon: iconCoins,
          value: 'subscribers',
          text: intl.formatMessage(messages.subscribersShort),
          meta: intl.formatMessage(messages.subscribersLong),
        }
      : undefined,
    {
      icon: iconAt,
      value: 'direct',
      text: intl.formatMessage(messages.directShort),
      meta: intl.formatMessage(messages.directLong),
    },
    features.createStatusLocalScope
      ? {
          icon: iconPlanet,
          value: 'local',
          text: intl.formatMessage(messages.localShort),
          meta: intl.formatMessage(messages.localLong),
        }
      : undefined,
    features.createStatusListScope && Object.keys(lists).length
      ? ({
          icon: iconListDashes,
          value: '',
          items: Object.values(lists).map((list) => ({
            icon: iconListDashes,
            value: `list:${list.id}`,
            text: list.title,
          })),
          text: intl.formatMessage(messages.listShort),
          meta: intl.formatMessage(messages.listLong),
        } as Option)
      : undefined,
    features.circles && Object.keys(circles).length
      ? ({
          icon: iconCirclesThree,
          value: '',
          items: Object.values(circles).map((circle) => ({
            icon: iconListDashes,
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
  const { updateCompose } = useComposeActions();

  const compose = useCompose(composeId);
  const { data: lists = [] } = useLists(getOrderedLists);
  const { data: circles = [] } = useCircles(getOrderedLists);
  const value = useComposeVisibility(composeId);

  const isReply = !!compose.inReplyToId;

  const unavailable = !!compose.editedId;

  const onChange = (value: string) =>
    value &&
    updateCompose(composeId, (draft) => {
      draft.visibility = value;
    });

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
      icon: iconPlanet,
      text: intl.formatMessage(messages.localShort),
      meta: intl.formatMessage(messages.localLong),
      type: 'toggle',
      checked: compose.localOnly,
      onChange: () =>
        updateCompose(composeId, (draft) => {
          draft.localOnly = !draft.localOnly;
        }),
    });

  const valueOption = useMemo(
    () =>
      [options, options.filter((option) => option.items).flatMap((option) => option.items)]
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
      <button type='button' title={compact ? text : intl.formatMessage(messages.changePrivacy)}>
        {valueOption?.icon && <Icon src={valueOption.icon} aria-hidden />}
        {compact ? undefined : text}
        <Icon src={iconCaretDown} aria-hidden />
      </button>
    </DropdownMenu>
  );
};

export { PrivacyDropdown as default };
