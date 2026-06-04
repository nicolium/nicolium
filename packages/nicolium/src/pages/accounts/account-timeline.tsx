import React from 'react';
import { FormattedMessage } from 'react-intl';

import { AccountTimelineColumn } from '@/columns/timeline';
import MissingIndicator from '@/components/missing-indicator';
import Card, { CardBody } from '@/components/ui/card';
import Spinner from '@/components/ui/spinner';
import { useFeatures } from '@/hooks/use-features';
import { useAccountLookup } from '@/queries/accounts/use-account-lookup';
import { usePinnedStatuses } from '@/queries/status-lists/use-pinned-statuses';
import { profileRoute } from '@/router';

const AccountTimelinePage: React.FC = () => {
  const { username } = profileRoute.useParams();
  const { with_replies: withReplies = false } = profileRoute.useSearch();

  const features = useFeatures();

  const { data: account, isPending } = useAccountLookup(username);
  const { data: featuredStatusIds } = usePinnedStatuses(account?.id || '');

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
          <p className='account-timeline__blocked'>
            <FormattedMessage
              id='empty_column.account_blocked'
              defaultMessage='You are blocked by @{accountUsername}.'
              values={{ accountUsername }}
            />
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <AccountTimelineColumn
      accountId={account.id}
      excludeReplies={!withReplies}
      featuredStatusIds={!withReplies ? featuredStatusIds : undefined}
      emptyMessageText={
        <FormattedMessage id='empty_column.account_timeline' defaultMessage='No posts here!' />
      }
    />
  );
};

export { AccountTimelinePage as default };
