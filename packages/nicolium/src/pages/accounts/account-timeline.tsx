import React from 'react';
import { FormattedMessage } from 'react-intl';

import { AccountTimelineColumn } from '@/columns/timeline';
import MissingIndicator from '@/components/missing-indicator';
import Card, { CardBody } from '@/components/ui/card';
import Spinner from '@/components/ui/spinner';
import Text from '@/components/ui/text';
import { profileRoute } from '@/features/ui/router';
import { useFeatures } from '@/hooks/use-features';
import { useAccountLookup } from '@/queries/accounts/use-account-lookup';
import { usePinnedStatuses } from '@/queries/status-lists/use-pinned-statuses';

const AccountTimelinePage: React.FC = () => {
  const { username } = profileRoute.useParams();
  const { with_replies: withReplies = false } = profileRoute.useSearch();

  const features = useFeatures();

  const { data: account, isPending } = useAccountLookup(username);

  const { data: _featuredStatusIds } = usePinnedStatuses(account?.id || '');

  const isBlocked = account?.relationship?.blocked_by && !features.blockersVisible;

  const accountUsername = account?.username ?? username;

  if (!account && isPending) {
    return <Spinner />;
  } else if (!account) {
    return <MissingIndicator nested />;
  }

  if (isBlocked) {
    return (
      <Card>
        <CardBody>
          <Text align='center'>
            <FormattedMessage
              id='empty_column.account_blocked'
              defaultMessage='You are blocked by @{accountUsername}.'
              values={{ accountUsername }}
            />
          </Text>
        </CardBody>
      </Card>
    );
  }

  return (
    <AccountTimelineColumn
      accountId={account.id}
      excludeReplies={!withReplies}
      // featuredStatusIds={showPins ? featuredStatusIds : undefined}
      emptyMessageText={
        <FormattedMessage id='empty_column.account_timeline' defaultMessage='No posts here!' />
      }
    />
  );
};

export { AccountTimelinePage as default };
