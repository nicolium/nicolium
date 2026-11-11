import { Appbar, Button, Divider, List, TextInput, useTheme } from '@mkljczk/react-native-paper';
import { FlashList } from '@shopify/flash-list';
import { GlobeSimpleXIcon } from 'phosphor-react-native/src/icons/GlobeSimpleX';
import { PlusIcon } from 'phosphor-react-native/src/icons/Plus';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useColorScheme } from 'react-native';

import { DialogOrSheet } from '@/components/ui/dialog-or-sheet';
import { EmptyMessage } from '@/components/ui/empty-message';
import { HeaderBackButton, HeaderIconButton } from '@/components/ui/header-icon-button';
import { iconHelper } from '@/components/ui/icon';
import { LoadMore } from '@/components/ui/load-more';
import {
  useBlockDomainMutation,
  useDomainBlocksQuery,
  useUnblockDomainMutation,
} from '@/queries/settings/domain-blocks';
import { useSetting } from '@/stores/settings';
import { toast } from '@/utils/toast';

import type { SettingsStackParams } from '@/router/router';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const messages = defineMessages({
  heading: { id: 'column.domain_blocks', defaultMessage: 'Domain blocks' },
  cancel: { id: 'common.cancel', defaultMessage: 'Cancel' },
  add: { id: 'domain_blocks.add', defaultMessage: 'Block domain' },
  domainPlaceholder: { id: 'domain_blocks.add.placeholder', defaultMessage: 'example.com' },
  addSuccess: { id: 'domain_blocks.add.success', defaultMessage: 'Blocked {domain}' },
  addFail: { id: 'domain_blocks.add.fail', defaultMessage: 'Failed to block domain' },
});

interface IDomain {
  domain: string;
}

const Domain: React.FC<IDomain> = ({ domain }) => {
  const { mutate: unblockDomain, isPending } = useUnblockDomainMutation();

  return (
    <List.Item
      title={domain}
      left={(props) => <List.Icon {...props} icon={iconHelper(GlobeSimpleXIcon)} />}
      right={() => (
        <Button mode='contained-tonal' onPress={() => unblockDomain(domain)} loading={isPending}>
          <FormattedMessage id='account.unblock.short' defaultMessage='Unblock' />
        </Button>
      )}
      containerStyle={{ alignItems: 'center' }}
    />
  );
};

interface IBlockDomainDialog {
  onDismiss: () => void;
}

const BlockDomainDialog: React.FC<IBlockDomainDialog> = ({ onDismiss }) => {
  const intl = useIntl();

  const [closing, setClosing] = React.useState(false);
  const [domain, setDomain] = React.useState('');

  const { mutate: blockDomain, isPending } = useBlockDomainMutation();

  const handleClose = () => setClosing(true);

  const handleSubmit = () => {
    const value = domain.trim().toLowerCase();
    if (!value) return;

    blockDomain(value, {
      onSuccess: () => {
        handleClose();
        toast.success(intl.formatMessage(messages.addSuccess, { domain: value }));
      },
      onError: () => {
        toast.error(intl.formatMessage(messages.addFail));
      },
    });
  };

  return (
    <DialogOrSheet
      visible={!closing}
      handleDismiss={onDismiss}
      actions={[
        {
          icon: 'xmark',
          label: intl.formatMessage(messages.cancel),
          onPress: handleClose,
        },
        {
          icon: 'checkmark',
          label: intl.formatMessage(messages.add),
          onPress: handleSubmit,
          loading: isPending,
          disabled: isPending || !domain.trim(),
          confirm: true,
        },
      ]}
      title={<FormattedMessage id='domain_blocks.add.heading' defaultMessage='Block domain' />}
    >
      <TextInput
        variant='outlined'
        placeholder={intl.formatMessage(messages.domainPlaceholder)}
        value={domain}
        onChangeText={setDomain}
        autoCapitalize='none'
        autoCorrect={false}
        keyboardType='url'
        onSubmitEditing={handleSubmit}
      />
    </DialogOrSheet>
  );
};

const DomainBlocksScreen = ({
  navigation,
}: NativeStackScreenProps<SettingsStackParams, 'domain_blocks'>) => {
  const intl = useIntl();
  const { colors } = useTheme();
  const colorScheme = useColorScheme();
  const blackTheme = useSetting('appearance.black');
  const autoloadMore = useSetting('timelines.autoloadMore');
  const query = useDomainBlocksQuery();

  const [showDialog, setShowDialog] = React.useState(false);

  return (
    <>
      <Appbar.Header
        mode='small'
        style={[
          {
            backgroundColor: colors.surfaceContainer,
          },
          colorScheme === 'dark' &&
            blackTheme && {
              borderBottomWidth: 1,
              borderBottomColor: colors.surfaceContainerHighest,
            },
        ]}
      >
        <HeaderBackButton onPress={navigation.goBack} />
        <Appbar.Content title={intl.formatMessage(messages.heading)} />
        <HeaderIconButton
          icon={PlusIcon}
          accessibilityLabel={intl.formatMessage(messages.add)}
          onPress={() => setShowDialog(true)}
        />
      </Appbar.Header>

      <FlashList
        data={query.data}
        keyExtractor={(domain) => domain}
        renderItem={({ item }) => <Domain domain={item} />}
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
                  id='empty_column.domain_blocks'
                  defaultMessage='There are no hidden domains yet.'
                />
              }
            />
          ) : null
        }
        ListFooterComponent={<LoadMore query={query} />}
      />

      {showDialog && <BlockDomainDialog onDismiss={() => setShowDialog(false)} />}
    </>
  );
};

export { DomainBlocksScreen };
