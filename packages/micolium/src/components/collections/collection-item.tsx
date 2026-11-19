import { List } from '@mkljczk/react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { ShapesIcon } from 'phosphor-react-native/src/icons/Shapes';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { iconHelper } from '../ui/icon';

import type { Collection } from 'pl-api';

interface ICollectionItem {
  collection: Collection;
  disabled?: boolean;
}

const CollectionItem: React.FC<ICollectionItem> = ({ collection, disabled }) => {
  const navigation = useNavigation();

  return (
    <List.Item
      title={collection.name}
      description={
        <FormattedMessage
          id='collections.account_count'
          defaultMessage='{count, plural, one {# account} other {# accounts}}'
          values={{ count: collection.item_count }}
        />
      }
      left={(props) => <List.Icon {...props} icon={iconHelper(ShapesIcon)} />}
      onPress={
        disabled
          ? undefined
          : () =>
              navigation.navigate('accounts', {
                screen: 'collection',
                params: { id: collection.id },
              })
      }
    />
  );
};

export { CollectionItem };
