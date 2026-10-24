import { Text } from '@mkljczk/react-native-paper';
import { Link } from '@react-navigation/native';
import React from 'react';
import { FormattedList, FormattedMessage } from 'react-intl';

import type { SelectedStatus } from '@/queries/statuses/use-status';

interface IStatusReplyMentions {
  status: SelectedStatus;
}

const StatusReplyMentions: React.FC<IStatusReplyMentions> = ({ status }) => {
  if (!status.in_reply_to_id) {
    // Used as placeholder by Akkoma
    // https://akkoma.dev/AkkomaGang/akkoma/src/branch/develop/lib/pleroma/web/mastodon_api/views/status_view.ex#L31
    if (status.in_reply_to_account_id === '_') {
      return (
        <Text variant='labelLarge'>
          <FormattedMessage id='reply_mentions.reply_empty' defaultMessage='Replying to post' />
        </Text>
      );
    }
    return null;
  }

  const to = status.mentions;

  // The post is a reply, but it has no mentions.
  // Rare, but it can happen.
  if (to.length === 0) {
    return (
      <Text
        variant='labelLarge'
        style={{ textDecorationLine: status.parent_visible === false ? 'line-through' : undefined }}
      >
        <FormattedMessage id='reply_mentions.reply_empty' defaultMessage='Replying to post' />
      </Text>
    );
  }

  // The typical case with a reply-to and a list of mentions.
  const accounts = to.slice(0, 2).map((account) => (
    <Link
      screen='accounts'
      params={{ screen: 'view', params: { id: account.id } }}
      key={account.id}
    >
      @{account.username}
    </Link>
  ));

  if (to.length > 2) {
    accounts.push(
      <Link screen='status' params={{ screen: 'mentions', params: { id: status.id } }} key='more'>
        <FormattedMessage
          id='reply_mentions.more'
          defaultMessage='{count} more'
          values={{ count: to.length - 2 }}
        />
      </Link>,
    );
  }

  return (
    <Text variant='labelLarge'>
      <FormattedMessage
        id='reply_mentions.reply'
        defaultMessage='Replying to {accounts}'
        values={{
          accounts: <FormattedList type='conjunction' value={accounts} />,
        }}
      />
    </Text>
  );
};

export { StatusReplyMentions };
