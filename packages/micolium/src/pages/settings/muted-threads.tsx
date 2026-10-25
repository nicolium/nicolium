import React from 'react';
import { FormattedMessage } from 'react-intl';

import { StatusesList } from '@/components/statuses/statuses-list';
import { EmptyMessage } from '@/components/ui/empty-message';
import { useMutedThreads } from '@/queries/status-lists/use-muted-threads';

import type { SettingsStackParams } from '@/router/router';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const MutedThreadsScreen = (_: NativeStackScreenProps<SettingsStackParams, 'muted_threads'>) => {
  const mutedThreadsQuery = useMutedThreads();

  return (
    <StatusesList
      query={mutedThreadsQuery}
      emptyMessageText={
        <EmptyMessage
          emptyMessageText={
            <FormattedMessage
              id='empty_column.muted_threads'
              defaultMessage='You have not muted any conversations yet.'
            />
          }
        />
      }
    />
  );
};

export { MutedThreadsScreen };
