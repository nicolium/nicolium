import { Button, Divider } from '@mkljczk/react-native-paper';
import { FlashList } from '@shopify/flash-list';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Account } from '@/components/accounts/account';
import { EmptyMessage } from '@/components/ui/empty-message';
import { LoadMore } from '@/components/ui/load-more';
import { useBlocks, useMutes } from '@/queries/account-lists/use-blocks';
import { useAccount } from '@/queries/accounts/use-account';
import {
  useBlockAccountMutation,
  useMuteAccountMutation,
  useUnblockAccountMutation,
  useUnmuteAccountMutation,
} from '@/queries/accounts/use-relationship';
import { useSetting } from '@/stores/settings';

import type { SettingsStackParams } from '@/router/router';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

interface IMutedAccount {
  accountId: string;
  expiresAt: string | null;
}

const MutedAccount: React.FC<IMutedAccount> = ({ accountId, expiresAt }) => {
  const { data: account } = useAccount(accountId, true);
  const { mutate: muteAccount, isPending: isPendingMute } = useMuteAccountMutation(accountId);
  const { mutate: unmuteAccount } = useUnmuteAccountMutation(accountId);

  const muting = account?.relationship?.muting ?? true;

  return (
    <Account
      id={accountId}
      style={{ paddingVertical: 8, padding: 12 }}
      withLink
      action={
        <Button
          mode={muting ? 'contained-tonal' : 'contained'}
          onPress={() => (muting ? unmuteAccount() : muteAccount(undefined))}
          loading={isPendingMute}
        >
          {muting ? (
            <FormattedMessage id='account.unmute.short' defaultMessage='Unmute' />
          ) : (
            <FormattedMessage id='account.mute.short' defaultMessage='Mute' />
          )}
        </Button>
      }
      timestamp={expiresAt || undefined}
      futureDate
    />
  );
};

interface IBlockedAccount {
  accountId: string;
  expiresAt: string | null;
}

const BlockedAccount: React.FC<IBlockedAccount> = ({ accountId, expiresAt }) => {
  const { data: account } = useAccount(accountId, true);
  const { mutate: blockAccount, isPending: isPendingBlock } = useBlockAccountMutation(accountId);
  const { mutate: unblockAccount } = useUnblockAccountMutation(accountId);

  const blocking = account?.relationship?.blocking ?? true;

  return (
    <Account
      id={accountId}
      style={{ paddingVertical: 8, padding: 12 }}
      withLink
      action={
        <Button
          mode={blocking ? 'contained-tonal' : 'contained'}
          onPress={() => (blocking ? unblockAccount() : blockAccount(undefined))}
          loading={isPendingBlock}
        >
          {blocking ? (
            <FormattedMessage id='account.unblock.short' defaultMessage='Unblock' />
          ) : (
            <FormattedMessage id='account.block.short' defaultMessage='Block' />
          )}
        </Button>
      }
      timestamp={expiresAt || undefined}
      futureDate
    />
  );
};

const MutesScreen = (_: NativeStackScreenProps<SettingsStackParams, 'mutes'>) => {
  const autoloadMore = useSetting('timelines.autoloadMore');
  const query = useMutes();

  return (
    <FlashList
      data={query.data}
      keyExtractor={([accountId]) => accountId}
      renderItem={({ item: [accountId, expiresAt] }) => (
        <MutedAccount accountId={accountId} expiresAt={expiresAt} />
      )}
      ItemSeparatorComponent={Divider}
      onEndReached={
        autoloadMore && query.hasNextPage && !query.isFetching ? query.fetchNextPage : undefined
      }
      onEndReachedThreshold={0.1}
      ListEmptyComponent={
        !query.isPending ? (
          <EmptyMessage
            emptyMessageText={
              <FormattedMessage
                id='empty_column.mutes'
                defaultMessage='You haven’t muted any users yet.'
              />
            }
          />
        ) : null
      }
      ListFooterComponent={<LoadMore query={query} />}
    />
  );
};

const BlocksScreen = (_: NativeStackScreenProps<SettingsStackParams, 'blocks'>) => {
  const autoloadMore = useSetting('timelines.autoloadMore');
  const query = useBlocks();

  return (
    <FlashList
      data={query.data}
      keyExtractor={([accountId]) => accountId}
      renderItem={({ item: [accountId, expiresAt] }) => (
        <BlockedAccount accountId={accountId} expiresAt={expiresAt} />
      )}
      ItemSeparatorComponent={Divider}
      onEndReached={
        autoloadMore && query.hasNextPage && !query.isFetching ? query.fetchNextPage : undefined
      }
      onEndReachedThreshold={0.1}
      ListEmptyComponent={
        !query.isPending ? (
          <EmptyMessage
            emptyMessageText={
              <FormattedMessage
                id='empty_column.blocks'
                defaultMessage='You haven’t blocked any users yet.'
              />
            }
          />
        ) : null
      }
      ListFooterComponent={<LoadMore query={query} />}
    />
  );
};

export { MutesScreen, BlocksScreen };
