import { ActivityIndicator, Button } from '@mkljczk/react-native-paper';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { View } from 'react-native';

import { useSetting } from '@/stores/settings';

interface ILoadMore {
  query: {
    fetchNextPage: () => Promise<any>;
    hasNextPage: boolean;
    isFetching: boolean;
    isPending: boolean;
  };
}

const LoadMore: React.FC<ILoadMore> = ({ query }) => {
  const autoloadMore = useSetting('timelines.autoloadMore');

  if (autoloadMore) {
    if (query.isFetching && !query.isPending) {
      return <ActivityIndicator style={{ marginVertical: 8 }} size='large' />;
    }

    return null;
  }

  if (query.isPending || !query.hasNextPage) return null;

  return (
    <View style={{ paddingVertical: 8, paddingHorizontal: 16, alignItems: 'center' }}>
      <Button
        mode='contained-tonal'
        onPress={() => query.fetchNextPage()}
        loading={query.isFetching}
      >
        <FormattedMessage id='status.load_more' defaultMessage='Load more' />
      </Button>
    </View>
  );
};

export { LoadMore };
