import iconCheck from '@phosphor-icons/core/regular/check.svg';
import iconX from '@phosphor-icons/core/regular/x.svg';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { NotificationRequestColumn } from '@/columns/notification-request';
import ColumnLoading from '@/components/column-loading';
import Column from '@/components/ui/column';
import IconButton from '@/components/ui/icon-button';
import Emojify from '@/emoji/emojify';
import { useAccount } from '@/queries/accounts/use-account';
import {
  useAcceptNotificationRequestMutation,
  useDismissNotificationRequestMutation,
  useNotificationRequest,
} from '@/queries/notifications/use-notification-requests';

import '@/styles/notifications.scss';
import { notificationRequestRoute } from '@/router';

const messages = defineMessages({
  title: { id: 'columns.notifications_from', defaultMessage: 'Notifications from {name}' },
  accept: { id: 'notification_requests.accept', defaultMessage: 'Accept' },
  dismiss: { id: 'notification_requests.dismiss', defaultMessage: 'Dismiss' },
});

const NotificationRequestPage = () => {
  const { requestId } = notificationRequestRoute.useParams();
  const { data: request } = useNotificationRequest(requestId);
  const { data: account } = useAccount(request?.account_id);
  const intl = useIntl();

  const { mutate: acceptRequest } = useAcceptNotificationRequestMutation(requestId);
  const { mutate: dismissRequest } = useDismissNotificationRequestMutation(requestId);

  if (!account) return <ColumnLoading />;

  return (
    <Column
      label={intl.formatMessage(messages.title, {
        name: account?.display_name,
      })}
      title={intl.formatMessage(messages.title, {
        name: <Emojify text={account?.display_name} emojis={account.emojis} />,
      })}
      action={
        <>
          <IconButton
            title={intl.formatMessage(messages.accept)}
            src={iconCheck}
            onClick={() => acceptRequest()}
          />
          <IconButton
            title={intl.formatMessage(messages.dismiss)}
            src={iconX}
            onClick={() => dismissRequest()}
          />
        </>
      }
    >
      <NotificationRequestColumn requestId={requestId} />
    </Column>
  );
};

export { NotificationRequestPage as default };
