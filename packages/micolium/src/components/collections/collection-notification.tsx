import { Button, Card } from '@mkljczk/react-native-paper';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { View } from 'react-native';

import { CollectionItem } from './collection-item';
import { useRevokeCollection } from './use-revoke-collection';

import type { Collection } from 'pl-api';

interface ICollectionNotification {
  collection: Collection;
}

const CollectionNotification: React.FC<ICollectionNotification> = ({ collection }) => {
  const confirmRevoke = useRevokeCollection(collection);

  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 4,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Card mode='outlined' style={{ flex: 1 }}>
        <CollectionItem collection={collection} />
      </Card>
      {confirmRevoke && (
        <Button mode='contained-tonal' onPress={confirmRevoke}>
          <FormattedMessage id='collections.revoke_inclusion' defaultMessage='Remove me' />
        </Button>
      )}
    </View>
  );
};

export { CollectionNotification };
