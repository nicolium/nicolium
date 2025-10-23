import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import IconButton from 'pl-fe/components/ui/icon-button';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useFollowMutation } from 'pl-fe/queries/accounts/use-relationship';
import toast from 'pl-fe/toast';

import type { Account as AccountEntity } from 'pl-fe/normalizers/account';

const messages = defineMessages({
  subscribe: { id: 'account.subscribe', defaultMessage: 'Subscribe to notifications from @{name}' },
  unsubscribe: { id: 'account.unsubscribe', defaultMessage: 'Unsubscribe to notifications from @{name}' },
  subscribeSuccess: { id: 'account.subscribe.success', defaultMessage: 'You have subscribed to this account.' },
  unsubscribeSuccess: { id: 'account.unsubscribe.success', defaultMessage: 'You have unsubscribed from this account.' },
  subscribeFailure: { id: 'account.subscribe.failure', defaultMessage: 'An error occurred trying to subscribe to this account.' },
  unsubscribeFailure: { id: 'account.unsubscribe.failure', defaultMessage: 'An error occurred trying to unsubscribe to this account.' },
});

interface ISubscriptionButton {
  account: Pick<AccountEntity, 'id' | 'username' | 'relationship'>;
}

const SubscriptionButton = ({ account }: ISubscriptionButton) => {
  const features = useFeatures();
  const intl = useIntl();
  const { mutate: follow, isPending } = useFollowMutation(account.id);

  const isFollowing = account.relationship?.following;
  const isRequested = account.relationship?.requested;
  const isSubscribed = account.relationship?.notifying;
  const title = isSubscribed
    ? intl.formatMessage(messages.unsubscribe, { name: account.username })
    : intl.formatMessage(messages.subscribe, { name: account.username });

  const onNotifyToggle = () => {
    if (account.relationship?.notifying) {
      follow({ notify: false }, {
        onSuccess: () => toast.success(intl.formatMessage(messages.unsubscribeSuccess)),
        onError: () => toast.error(intl.formatMessage(messages.unsubscribeFailure)),
      });
    } else {
      follow({ notify: true }, {
        onSuccess: () => toast.success(intl.formatMessage(messages.subscribeSuccess)),
        onError: () => toast.error(intl.formatMessage(messages.subscribeFailure)),
      });
    }
  };

  const handleToggle = () => {
    onNotifyToggle();
  };

  if (!features.accountNotifies) {
    return null;
  }

  if (isRequested || isFollowing) {
    return (
      <IconButton
        src={isSubscribed ? require('@phosphor-icons/core/regular/bell-simple-ringing.svg') : require('@phosphor-icons/core/regular/bell-simple.svg')}
        onClick={handleToggle}
        disabled={isPending}
        title={title}
        theme='outlined'
        className='px-2'
        iconClassName='h-4 w-4'
      />
    );
  }

  return null;
};

export { SubscriptionButton as default };
