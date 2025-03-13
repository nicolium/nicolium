import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useRouteMatch } from 'react-router-dom';

import Tabs from 'pl-fe/components/ui/tabs';
import { useFeatures } from 'pl-fe/hooks/use-features';

const messages = defineMessages({
  followRequests: { id: 'column.follow_requests', defaultMessage: 'Follow requests' },
  outgoingFollowRequests: { id: 'column.outgoing_follow_requests', defaultMessage: 'Outgoing follow requests' },
});

const FollowRequestsTabs = () => {
  const intl = useIntl();
  const match = useRouteMatch();
  const features = useFeatures();

  if (!features.outgoingFollowRequests) {
    return null;
  }

  const tabs = [{
    name: '/follow_requests',
    text: intl.formatMessage(messages.followRequests),
    to: '/follow_requests',
  }, {
    name: '/outgoing_follow_requests',
    text: intl.formatMessage(messages.outgoingFollowRequests),
    to: '/outgoing_follow_requests',
  }];

  return <Tabs items={tabs} activeItem={match.path} />;
};

export { FollowRequestsTabs as default };
