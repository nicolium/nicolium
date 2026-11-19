import { useTheme } from '@mkljczk/react-native-paper';
import { FlashList } from '@shopify/flash-list';
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Pressable, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { type AccountGalleryAttachment, useAccountGallery } from '@/hooks/use-account-gallery';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { queryKeys } from '@/queries/keys';
import { scopedQueryKey } from '@/queries/query';
import { useSetting } from '@/stores/settings';
import { useUiStoreActions } from '@/stores/ui';

import { renderMedia } from '../statuses/status-media';
import { EmptyMessage } from '../ui/empty-message';
import { LoadMore } from '../ui/load-more';
import { LoadingIndicator } from '../ui/loading-indicator';

interface IProfileMediaItem {
  item: Extract<AccountGalleryAttachment, { type: 'image' | 'video' | 'gifv' }>;
}

const ProfileMediaItem: React.FC<IProfileMediaItem> = ({ item }) => {
  const { colors, shapes } = useTheme();
  const { openMediaViewer } = useUiStoreActions();
  const queryClient = useQueryClient();
  const scopeUrl = useScopeUrl();

  const handleOpenMediaViewer = () => {
    const media = queryClient.getQueryData(
      scopedQueryKey(queryKeys.statuses.show(item.status_id), scopeUrl),
    )?.media_attachments;

    return openMediaViewer(media || [], item.index);
  };

  return (
    <Pressable
      onPress={handleOpenMediaViewer}
      style={{
        flex: 1,
        aspectRatio: 1,
        borderRadius: shapes.corner.medium,
        overflow: 'hidden',
        backgroundColor: colors.surfaceContainerHighest,
      }}
      accessibilityRole='button'
      accessibilityLabel={item.description}
    >
      {renderMedia(item, item.sensitive, false, true)}
    </Pressable>
  );
};

interface IProfileMedia {
  id: string;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  header: React.JSX.Element;
}

const ProfileMedia: React.FC<IProfileMedia> = ({ id, onScroll, header }) => {
  const autoloadMore = useSetting('timelines.autoloadMore');

  const { bottom: bottomInset } = useSafeAreaInsets();

  const accountGalleryQuery = useAccountGallery(id);

  return (
    <FlashList
      data={accountGalleryQuery.data.filter(
        (item) => item.type !== 'audio' && item.type !== 'unknown',
      )}
      numColumns={3}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={{ padding: 4 }}>
          <ProfileMediaItem item={item} />
        </View>
      )}
      ListEmptyComponent={
        accountGalleryQuery.isPending ? (
          <LoadingIndicator />
        ) : (
          <EmptyMessage
            emptyMessageText={
              <FormattedMessage id='account_gallery.none' defaultMessage='No media to show.' />
            }
          />
        )
      }
      ListFooterComponent={<LoadMore query={accountGalleryQuery} />}
      ListHeaderComponent={header}
      onScroll={onScroll}
      contentContainerStyle={{ paddingBottom: bottomInset }}
      onRefresh={() => accountGalleryQuery.refetch()}
      refreshing={!accountGalleryQuery.isPending && accountGalleryQuery.isRefetching}
      onEndReached={
        autoloadMore
          ? () => {
              if (accountGalleryQuery.hasNextPage && !accountGalleryQuery.isFetching)
                accountGalleryQuery.fetchNextPage();
            }
          : undefined
      }
      onEndReachedThreshold={0.1}
    />
  );
};

export { ProfileMedia };
