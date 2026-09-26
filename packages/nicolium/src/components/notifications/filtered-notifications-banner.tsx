import iconArchive from '@phosphor-icons/core/regular/archive.svg';
import { Link } from '@tanstack/react-router';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { useNotificationPolicy } from '@/queries/notifications/use-notification-policy';

import Icon from '../ui/icon';

const FilteredNotificationsBanner = () => {
  const { data: policy } = useNotificationPolicy();

  if (!policy || !policy.summary.pending_requests_count) return null;

  return (
    <Link className='filtered-notifications-banner' to='/notifications/requests'>
      <Icon src={iconArchive} />
      <p>
        <FormattedMessage
          id='filtered_notifications_banner.pending_requests'
          defaultMessage='You have {notifications, plural, =0 {no pending notifications} one {one pending notification} other {# pending notifications}} from {requests, plural, =0 {no one} one {one person} other {# people}} you may know'
          values={{
            notifications: policy.summary.pending_notifications_count,
            requests: policy.summary.pending_requests_count,
          }}
        />
      </p>
    </Link>
  );
};

export { FilteredNotificationsBanner };
