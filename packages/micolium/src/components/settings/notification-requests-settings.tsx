import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { StyleProp, ViewStyle } from 'react-native';

import { useFeatures } from '@/contexts/current-account-context';
import {
  useNotificationPolicy,
  useUpdateNotificationPolicy,
} from '@/queries/notifications/use-notification-policy';

import { List } from '../ui/list';
import { LoadingIndicator } from '../ui/loading-indicator';

import type { NotificationPolicy } from 'pl-api';

const messages = defineMessages({
  acceptOption: { id: 'notifications.policy.accept', defaultMessage: 'Accept' },
  filterOption: { id: 'notifications.policy.filter', defaultMessage: 'Filter' },
  dropOption: { id: 'notifications.policy.drop', defaultMessage: 'Ignore' },
  policyTitle: { id: 'notifications.policy.title', defaultMessage: 'Manage notifications from…' },
  forNotFollowing: {
    id: 'notifications.policy.filter_not_following_title',
    defaultMessage: "People you don't follow",
  },
  forNotFollowingHint: {
    id: 'notifications.policy.filter_not_following_hint',
    defaultMessage: 'Until you manually approve them',
  },
  forNotFollowers: {
    id: 'notifications.policy.filter_not_followers_title',
    defaultMessage: 'People not following you',
  },
  forNotFollowersHint: {
    id: 'notifications.policy.filter_not_followers_hint',
    defaultMessage:
      'Including people who have been following you fewer than {days, plural, one {one day} other {# days}}',
  },
  forNewAccounts: {
    id: 'notifications.policy.filter_new_accounts_title',
    defaultMessage: 'New accounts',
  },
  forNewAccountsHint: {
    id: 'notifications.policy.filter_new_accounts.hint',
    defaultMessage: 'Created within the past {days, plural, one {one day} other {# days}}',
  },
  forPrivateMentions: {
    id: 'notifications.policy.filter_private_mentions_title',
    defaultMessage: 'Unsolicited private mentions',
  },
  forPrivateMentionsHint: {
    id: 'notifications.policy.filter_private_mentions_hint',
    defaultMessage: "Filtered unless it's in reply to your own mention or if you follow the sender",
  },
  forLimitedAccounts: {
    id: 'notifications.policy.filter_limited_accounts_title',
    defaultMessage: 'Moderated accounts',
  },
  forLimitedAccountsHint: {
    id: 'notifications.policy.filter_limited_accounts_hint',
    defaultMessage: 'Limited by server moderators',
  },
  forBots: { id: 'notifications.policy.filter_bots_title', defaultMessage: 'Bots' },
  forBotsHint: {
    id: 'notifications.policy.filter_bots_hint',
    defaultMessage: 'Accounts marked as automated',
  },
});

type PolicyRule = Exclude<keyof NotificationPolicy, 'summary'>;

interface INotificationRequestsSettings {
  withHeading?: boolean;
  style?: StyleProp<ViewStyle>;
}

const NotificationRequestsSettings: React.FC<INotificationRequestsSettings> = ({
  withHeading = true,
  style,
}) => {
  const intl = useIntl();
  const features = useFeatures();
  const { data: policy } = useNotificationPolicy();
  const { mutate: updatePolicy } = useUpdateNotificationPolicy();

  if (!policy) return <LoadingIndicator />;

  const rules: Array<{ rule: PolicyRule; label: string; sublabel: string }> = [
    {
      rule: 'for_not_following',
      label: intl.formatMessage(messages.forNotFollowing),
      sublabel: intl.formatMessage(messages.forNotFollowingHint),
    },
    {
      rule: 'for_not_followers',
      label: intl.formatMessage(messages.forNotFollowers),
      sublabel: intl.formatMessage(messages.forNotFollowersHint, { days: 3 }),
    },
    {
      rule: 'for_new_accounts',
      label: intl.formatMessage(messages.forNewAccounts),
      sublabel: intl.formatMessage(messages.forNewAccountsHint, { days: 30 }),
    },
    {
      rule: 'for_private_mentions',
      label: intl.formatMessage(messages.forPrivateMentions),
      sublabel: intl.formatMessage(messages.forPrivateMentionsHint),
    },
    {
      rule: 'for_limited_accounts',
      label: intl.formatMessage(messages.forLimitedAccounts),
      sublabel: intl.formatMessage(messages.forLimitedAccountsHint),
    },
  ];

  if (features.notificationsPolicyForBots) {
    rules.push({
      rule: 'for_bots',
      label: intl.formatMessage(messages.forBots),
      sublabel: intl.formatMessage(messages.forBotsHint),
    });
  }

  const options = (['accept', 'filter', 'drop'] as const).map((value) => ({
    value,
    label: intl.formatMessage(
      { accept: messages.acceptOption, filter: messages.filterOption, drop: messages.dropOption }[
        value
      ],
    ),
  }));

  return (
    <List
      sections={[
        {
          subheader: withHeading ? intl.formatMessage(messages.policyTitle) : undefined,
          items: rules.map(({ rule, label, sublabel }) => ({
            type: 'select',
            label,
            sublabel,
            active: policy[rule],
            onChange: (value: (typeof options)[number]['value']) => updatePolicy({ [rule]: value }),
            options,
          })),
        },
      ]}
      style={style}
    />
  );
};

export { NotificationRequestsSettings };
