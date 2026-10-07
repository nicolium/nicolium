import { Button } from '@mkljczk/react-native-paper';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import {
  useFollowAccountMutation,
  useRelationshipQuery,
  useUnfollowAccountMutation,
} from '@/queries/accounts/use-relationship';

interface IFollowButton {
  id: string;
}

const FollowButton: React.FC<IFollowButton> = ({ id }) => {
  const { data: relationship } = useRelationshipQuery(id);
  const { mutate: followAccount, isPending } = useFollowAccountMutation(id);
  const { mutate: unfollowAccount } = useUnfollowAccountMutation(id);

  return (
    <Button
      mode='contained'
      onPress={() => (relationship?.following ? unfollowAccount() : followAccount(undefined))}
      disabled={!relationship}
      loading={isPending}
    >
      {relationship?.following ? (
        <FormattedMessage id='account.unfollow' defaultMessage='Unfollow' />
      ) : (
        <FormattedMessage id='account.follow' defaultMessage='Follow' />
      )}
    </Button>
  );
};

export { FollowButton };
