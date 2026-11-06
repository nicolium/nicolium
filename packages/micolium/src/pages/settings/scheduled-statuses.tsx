import { Divider, IconButton, Text, useTheme } from '@mkljczk/react-native-paper';
import { FlashList } from '@shopify/flash-list';
import { DotsThreeIcon } from 'phosphor-react-native/src/icons/DotsThree';
import { DotsThreeVerticalIcon } from 'phosphor-react-native/src/icons/DotsThreeVertical';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Alert, Platform, View } from 'react-native';

import { Account } from '@/components/accounts/account';
import { StatusMedia } from '@/components/statuses/status-media';
import { StatusQuote } from '@/components/statuses/status-quote';
import { StatusVisibilityIcon } from '@/components/statuses/status-visibility-icon';
import DropdownMenu from '@/components/ui/dropdown-menu';
import { EmptyMessage } from '@/components/ui/empty-message';
import { iconHelper } from '@/components/ui/icon';
import { LoadMore } from '@/components/ui/load-more';
import { UIStatus } from '@/components/ui/status';
import { useCredentialAccountId } from '@/queries/accounts/use-account-credentials';
import {
  useCancelScheduledStatusMutation,
  useScheduledStatusesQuery,
} from '@/queries/statuses/scheduled-statuses';
import { useComposeActions } from '@/stores/compose';
import { useSetting } from '@/stores/settings';
import { useUiStoreActions } from '@/stores/ui';

import type { SettingsStackParams } from '@/router/router';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ScheduledStatus as ScheduledStatusEntity } from 'pl-api';

const messages = defineMessages({
  cancel: { id: 'scheduled_status.cancel', defaultMessage: 'Cancel' },
  deleteConfirm: { id: 'confirmations.scheduled_status_delete.confirm', defaultMessage: 'Discard' },
  deleteHeading: {
    id: 'confirmations.scheduled_status_delete.heading',
    defaultMessage: 'Cancel scheduled post',
  },
  deleteMessage: {
    id: 'confirmations.scheduled_status_delete.message',
    defaultMessage: 'Are you sure you want to discard this scheduled post?',
  },
  edit: { id: 'scheduled_status.edit', defaultMessage: 'Edit' },
  menuTitle: { id: 'dropdown_menu.title', defaultMessage: 'Menu' },
});

interface IScheduledStatus {
  scheduledStatus: ScheduledStatusEntity;
}

const ScheduledStatus: React.FC<IScheduledStatus> = ({ scheduledStatus }) => {
  const { colors } = useTheme();
  const intl = useIntl();
  const { data: currentAccountId } = useCredentialAccountId();
  const { setComposeToScheduledStatus } = useComposeActions();
  const { openCompose } = useUiStoreActions();
  const { mutate: cancelScheduledStatus } = useCancelScheduledStatusMutation(scheduledStatus.id);

  const handleEdit = () => {
    setComposeToScheduledStatus(scheduledStatus);
    openCompose();
  };

  const handleCancel = () => {
    Alert.alert(
      intl.formatMessage(messages.deleteHeading),
      intl.formatMessage(messages.deleteMessage),
      [
        {
          text: intl.formatMessage(messages.cancel),
          style: 'cancel',
        },
        {
          text: intl.formatMessage(messages.deleteConfirm),
          style: 'destructive',
          onPress: () => {
            cancelScheduledStatus();
          },
        },
      ],
    );
  };

  const statusBody = (
    <UIStatus
      account={
        currentAccountId ? (
          <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'space-between' }}>
            <Account
              id={currentAccountId}
              timestamp={scheduledStatus.scheduled_at}
              futureDate
              style={{ padding: 8, margin: -8 }}
              withLink
              fullWidthPressable={false}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <StatusVisibilityIcon
                status={{ visibility: scheduledStatus.params.visibility, list_id: null }}
              />
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <IconButton
                    icon={iconHelper(Platform.OS === 'ios' ? DotsThreeIcon : DotsThreeVerticalIcon)}
                    style={{ height: 32, width: 32 }}
                    onPress={() => {}}
                    accessibilityLabel={intl.formatMessage(messages.menuTitle)}
                  />
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  <DropdownMenu.Group>
                    <DropdownMenu.Item key='edit' onSelect={() => handleEdit()}>
                      <DropdownMenu.ItemIcon
                        ios={{ name: 'pencil' }}
                        androidIconName={'ph_pencil_simple'}
                      />
                      <DropdownMenu.ItemTitle>
                        {intl.formatMessage(messages.edit)}
                      </DropdownMenu.ItemTitle>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item key='cancel' onSelect={() => handleCancel()} destructive>
                      <DropdownMenu.ItemIcon ios={{ name: 'xmark' }} androidIconName={'ph_x'} />
                      <DropdownMenu.ItemTitle>
                        {intl.formatMessage(messages.cancel)}
                      </DropdownMenu.ItemTitle>
                    </DropdownMenu.Item>
                  </DropdownMenu.Group>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </View>
          </View>
        ) : undefined
      }
      displayedMentions={
        scheduledStatus.params.in_reply_to_id ? (
          <Text variant='labelLarge'>
            <FormattedMessage id='reply_mentions.reply_empty' defaultMessage='Replying to post' />
          </Text>
        ) : undefined
      }
      content={scheduledStatus.params.text?.replaceAll(new RegExp('\n', 'g'), '<br>') || ''}
      spoilerText={scheduledStatus.params.spoiler_text || undefined}
      media={
        <>
          <StatusMedia
            status={{
              media_attachments: scheduledStatus.media_attachments,
              sensitive: false,
            }}
          />
          {scheduledStatus.params.poll && (
            <View style={{ gap: 8 }}>
              {scheduledStatus.params.poll.options.map((option) => (
                <View
                  key={option}
                  style={{
                    padding: 10,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    borderColor: colors.outlineVariant,
                    borderWidth: 1,
                  }}
                >
                  <Text numberOfLines={1}>{option}</Text>
                </View>
              ))}
            </View>
          )}
          {scheduledStatus.params.quoted_status_id && (
            <StatusQuote id={scheduledStatus.params.quoted_status_id} context={context} />
          )}
        </>
      }
      contentKey={scheduledStatus.id}
    />
  );

  return <View style={{ padding: 16 }}>{statusBody}</View>;
};

const ScheduledStatusesScreen = (
  _: NativeStackScreenProps<SettingsStackParams, 'scheduled_statuses'>,
) => {
  const autoloadMore = useSetting('timelines.autoloadMore');
  const scheduledStatusesQuery = useScheduledStatusesQuery();

  return (
    <FlashList
      data={scheduledStatusesQuery.data}
      renderItem={({ item }) => <ScheduledStatus scheduledStatus={item} />}
      keyExtractor={(item) => item.id}
      ItemSeparatorComponent={Divider}
      onEndReached={
        autoloadMore && scheduledStatusesQuery.hasNextPage && !scheduledStatusesQuery.isFetching
          ? scheduledStatusesQuery.fetchNextPage
          : undefined
      }
      onEndReachedThreshold={0.1}
      onRefresh={scheduledStatusesQuery.refetch}
      refreshing={scheduledStatusesQuery.isRefetching}
      ListEmptyComponent={
        !scheduledStatusesQuery.isPending ? (
          <EmptyMessage
            emptyMessageText={
              <FormattedMessage
                id='empty_column.scheduled_statuses'
                defaultMessage='You don’t have any scheduled posts yet. When you add one, it will show up here.'
              />
            }
          />
        ) : null
      }
      ListFooterComponent={<LoadMore query={scheduledStatusesQuery} />}
    />
  );
};

export { ScheduledStatusesScreen };
