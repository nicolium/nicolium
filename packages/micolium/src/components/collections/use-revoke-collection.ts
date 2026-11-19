import { defineMessages, useIntl } from 'react-intl';

import { useCredentialAccountId } from '@/queries/accounts/use-account-credentials';
import { useRevokeCollectionInclusion } from '@/queries/accounts/use-collections';
import { Alert } from '@/stores/alerts';
import { toast } from '@/utils/toast';

import type { Collection } from 'pl-api';

const messages = defineMessages({
  cancel: { id: 'common.cancel', defaultMessage: 'Cancel' },
  heading: {
    id: 'confirmations.revoke_collection_inclusion.heading',
    defaultMessage: 'Remove yourself from this collection?',
  },
  message: {
    id: 'confirmations.revoke_collection_inclusion.message',
    defaultMessage:
      'The curator won’t be able to re-add you to this collection for 24 hours. To prevent them from adding you to collections permanently, you can block them.',
  },
  confirm: {
    id: 'confirmations.revoke_collection_inclusion.confirm',
    defaultMessage: 'Remove me',
  },
  success: {
    id: 'collections.revoke_inclusion.success',
    defaultMessage: 'You’ve been removed from “{collection}”',
  },
  error: {
    id: 'collections.revoke_inclusion.error',
    defaultMessage: 'There was an error, please try again later.',
  },
});

const useRevokeCollection = (collection?: Pick<Collection, 'id' | 'name' | 'items'> | null) => {
  const intl = useIntl();
  const { data: me } = useCredentialAccountId();
  const { mutate: revokeInclusion } = useRevokeCollectionInclusion();

  const ownItemId = collection?.items.find((item) => item.account_id === me)?.id;

  if (!collection || !ownItemId) {
    return undefined;
  }

  return () => {
    Alert.alert(intl.formatMessage(messages.heading), intl.formatMessage(messages.message), [
      {
        text: intl.formatMessage(messages.cancel),
        style: 'cancel',
      },
      {
        text: intl.formatMessage(messages.confirm),
        style: 'destructive',
        onPress: () =>
          revokeInclusion(
            { collectionId: collection.id, itemId: ownItemId },
            {
              onSuccess: () =>
                toast.success(
                  intl.formatMessage(messages.success, { collection: collection.name }),
                ),
              onError: () => toast.error(intl.formatMessage(messages.error)),
            },
          ),
      },
    ]);
  };
};

export { useRevokeCollection };
