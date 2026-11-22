import { FlashList } from '@shopify/flash-list';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { View } from 'react-native';

import { Announcement } from '@/components/announcements/announcement';
import { EmptyMessage } from '@/components/ui/empty-message';
import { useAnnouncements } from '@/queries/announcements/use-announcements';

import type { SettingsStackParams } from '@/router/router';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const AnnouncementsScreen = (_: NativeStackScreenProps<SettingsStackParams, 'announcements'>) => {
  const announcementsQuery = useAnnouncements();

  return (
    <FlashList
      data={announcementsQuery.data}
      renderItem={({ item }) => <Announcement announcement={item} />}
      keyExtractor={(item) => item.id}
      onRefresh={announcementsQuery.refetch}
      refreshing={announcementsQuery.isRefetching}
      ListEmptyComponent={
        !announcementsQuery.isPending ? (
          <EmptyMessage
            emptyMessageText={
              <FormattedMessage
                id='announcements.empty'
                defaultMessage='There are no announcements at the moment.'
              />
            }
          />
        ) : null
      }
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8 }}
    />
  );
};

export { AnnouncementsScreen };
