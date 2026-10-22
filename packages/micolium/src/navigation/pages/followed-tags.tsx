import { Button, Divider, List } from '@mkljczk/react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { HashIcon } from 'phosphor-react-native/src/icons/Hash';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { EmptyMessage } from '@/components/ui/empty-message';
import { iconHelper } from '@/components/ui/icon';
import { LoadMore } from '@/components/ui/load-more';
import { useFollowedTags, useUnfollowHashtagMutation } from '@/queries/hashtags/use-followed-tags';
import { useSetting } from '@/stores/settings';

import type { SettingsStackParams } from '../router';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Tag } from 'pl-api';

interface IFollowedTag {
  tag: Tag;
}

const FollowedTag: React.FC<IFollowedTag> = ({ tag }) => {
  const navigation = useNavigation();
  const { mutate: unfollow, isPending } = useUnfollowHashtagMutation(tag.name);

  return (
    <List.Item
      title={`#${tag.name}`}
      left={(props) => <List.Icon {...props} icon={iconHelper(HashIcon)} />}
      right={() => (
        <Button mode='contained-tonal' onPress={() => unfollow()} loading={isPending}>
          <FormattedMessage id='hashtag.unfollow.short' defaultMessage='Unfollow' />
        </Button>
      )}
      onPress={() => navigation.navigate('hashtags', { tag: tag.name })}
      containerStyle={{ alignItems: 'center' }}
    />
  );
};

const FollowedTagsScreen = (_: NativeStackScreenProps<SettingsStackParams, 'followed_tags'>) => {
  const autoloadMore = useSetting('timelines.autoloadMore');
  const query = useFollowedTags();

  return (
    <FlashList
      data={query.data}
      keyExtractor={(tag) => tag.name}
      renderItem={({ item }) => <FollowedTag tag={item} />}
      ItemSeparatorComponent={Divider}
      onEndReached={
        autoloadMore && query.hasNextPage && !query.isFetching ? query.fetchNextPage : undefined
      }
      onEndReachedThreshold={0.1}
      onRefresh={query.refetch}
      refreshing={query.isRefetching}
      ListEmptyComponent={
        !query.isPending ? (
          <EmptyMessage
            emptyMessageText={
              <FormattedMessage
                id='empty_column.followed_tags'
                defaultMessage='You haven’t followed any hashtag yet.'
              />
            }
          />
        ) : null
      }
      ListFooterComponent={<LoadMore query={query} />}
    />
  );
};

export { FollowedTagsScreen };
