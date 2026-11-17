import { Badge, Divider, IconButton, List as PaperList } from '@mkljczk/react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { ArchiveIcon } from 'phosphor-react-native/src/icons/Archive';
import { CheckIcon } from 'phosphor-react-native/src/icons/Check';
import { SlidersHorizontalIcon } from 'phosphor-react-native/src/icons/SlidersHorizontal';
import { XIcon } from 'phosphor-react-native/src/icons/X';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Account } from '@/components/accounts/account';
import { Notification } from '@/components/notification';
import { NotificationRequestsSettings } from '@/components/settings/notification-requests-settings';
import { DialogOrSheet } from '@/components/ui/dialog-or-sheet';
import { EmptyMessage } from '@/components/ui/empty-message';
import { HeaderIconButton } from '@/components/ui/header-icon-button';
import { iconHelper } from '@/components/ui/icon';
import { LoadMore } from '@/components/ui/load-more';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { useNotificationPolicy } from '@/queries/notifications/use-notification-policy';
import {
  useAcceptNotificationRequestMutation,
  useDismissNotificationRequestMutation,
  useNotificationRequest,
  useNotificationRequests,
  useNotificationsFromAccount,
} from '@/queries/notifications/use-notification-requests';
import { useSetting } from '@/stores/settings';

import type { MinifiedNotificationRequest } from '@/queries/utils/minify-list';
import type { NotificationsStackParams } from '@/router/router';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const messages = defineMessages({
  accept: { id: 'notification_requests.accept', defaultMessage: 'Accept' },
  dismiss: { id: 'notification_requests.dismiss', defaultMessage: 'Dismiss' },
  settings: { id: 'notifications.settings', defaultMessage: 'Notification settings' },
  close: { id: 'lightbox.close', defaultMessage: 'Close' },
});

const FilteredNotificationsBanner: React.FC = () => {
  const navigation = useNavigation();
  const { data: policy } = useNotificationPolicy();

  if (!policy || !policy.summary.pending_requests_count) return null;

  return (
    <>
      <PaperList.Item
        title={
          <FormattedMessage
            id='filtered_notifications_banner.pending_requests'
            defaultMessage='You have {notifications, plural, =0 {no pending notifications} one {one pending notification} other {# pending notifications}} from {requests, plural, =0 {no one} one {one person} other {# people}} you may know'
            values={{
              notifications: policy.summary.pending_notifications_count,
              requests: policy.summary.pending_requests_count,
            }}
          />
        }
        titleNumberOfLines={3}
        left={(props) => <PaperList.Icon {...props} icon={iconHelper(ArchiveIcon)} />}
        onPress={() =>
          navigation.navigate('app', {
            screen: 'notifications',
            params: { screen: 'requests' },
          })
        }
      />
      <Divider />
    </>
  );
};

interface IRequestActions {
  requestId: string;
  onSuccess?: () => void;
}

const useRequestActions = ({ requestId, onSuccess }: IRequestActions) => {
  const { mutate: accept, isPending: isAccepting } =
    useAcceptNotificationRequestMutation(requestId);
  const { mutate: dismiss, isPending: isDismissing } =
    useDismissNotificationRequestMutation(requestId);

  return {
    accept: () => accept(undefined, { onSuccess }),
    dismiss: () => dismiss(undefined, { onSuccess }),
    isAccepting,
    isDismissing,
  };
};

interface INotificationRequest {
  request: MinifiedNotificationRequest;
}

const NotificationRequest: React.FC<INotificationRequest> = ({ request }) => {
  const intl = useIntl();
  const navigation = useNavigation();
  const { accept, dismiss, isAccepting, isDismissing } = useRequestActions({
    requestId: request.id,
  });

  const isPending = isAccepting || isDismissing;

  return (
    <Account
      id={request.account_id}
      style={{ paddingVertical: 8, paddingHorizontal: 12 }}
      action={
        <View style={{ flexDirection: 'row' }}>
          <IconButton
            mode='outlined'
            icon={iconHelper(XIcon)}
            onPress={dismiss}
            disabled={isPending}
            loading={isDismissing}
            accessibilityLabel={intl.formatMessage(messages.dismiss)}
          />
          <IconButton
            mode='contained'
            icon={iconHelper(CheckIcon)}
            onPress={accept}
            disabled={isPending}
            loading={isAccepting}
            accessibilityLabel={intl.formatMessage(messages.accept)}
          />
        </View>
      }
      onPress={() =>
        navigation.navigate('app', {
          screen: 'notifications',
          params: { screen: 'request', params: { id: request.id } },
        })
      }
      badge={<Badge>{request.notifications_count}</Badge>}
    />
  );
};

const NotificationRequestsScreenHeaderRight = () => {
  const intl = useIntl();

  const [showDialog, setShowDialog] = React.useState(false);

  return (
    <>
      <HeaderIconButton
        icon={SlidersHorizontalIcon}
        onPress={() => setShowDialog(true)}
        accessibilityLabel={intl.formatMessage(messages.settings)}
      />
      <DialogOrSheet
        visible={showDialog}
        handleDismiss={() => setShowDialog(false)}
        actions={[
          null,
          {
            icon: 'checkmark',
            label: intl.formatMessage(messages.close),
            onPress: () => {
              setShowDialog(false);
            },
            confirm: true,
          },
        ]}
        title={
          <FormattedMessage
            id='notifications.policy.title'
            defaultMessage='Manage notifications from…'
          />
        }
      >
        <NotificationRequestsSettings withHeading={false} style={{ marginHorizontal: -16 }} />
      </DialogOrSheet>
    </>
  );
};

const NotificationRequestsScreen = ({
  navigation,
}: NativeStackScreenProps<NotificationsStackParams, 'requests'>) => {
  const autoloadMore = useSetting('timelines.autoloadMore');
  const { bottom: bottomInset } = useSafeAreaInsets();
  const query = useNotificationRequests();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <NotificationRequestsScreenHeaderRight />,
    });
  }, [navigation]);

  return (
    <FlashList
      data={query.data}
      keyExtractor={(request) => request.id}
      renderItem={({ item }) => <NotificationRequest request={item} />}
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
                id='empty_column.notification_requests'
                defaultMessage='There are no filtered notifications to review.'
              />
            }
          />
        ) : null
      }
      ListFooterComponent={<LoadMore query={query} />}
      contentContainerStyle={{ paddingBottom: bottomInset }}
    />
  );
};

const NotificationRequestScreen = ({
  navigation,
  route: {
    params: { id },
  },
}: NativeStackScreenProps<NotificationsStackParams, 'request'>) => {
  const intl = useIntl();
  const autoloadMore = useSetting('timelines.autoloadMore');
  const { bottom: bottomInset } = useSafeAreaInsets();

  const { data: request } = useNotificationRequest(id);
  const query = useNotificationsFromAccount(request?.account_id);
  const { accept, dismiss, isAccepting, isDismissing } = useRequestActions({
    requestId: id,
    onSuccess: navigation.goBack,
  });

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <>
          <HeaderIconButton
            icon={XIcon}
            onPress={dismiss}
            disabled={isAccepting || isDismissing}
            accessibilityLabel={intl.formatMessage(messages.dismiss)}
          />
          <HeaderIconButton
            icon={CheckIcon}
            onPress={accept}
            disabled={isAccepting || isDismissing}
            accessibilityLabel={intl.formatMessage(messages.accept)}
          />
        </>
      ),
    });
  }, [navigation, isAccepting, isDismissing]);

  if (!request) return <LoadingIndicator />;

  return (
    <FlashList
      data={query.data}
      keyExtractor={(notification) => notification.group_key}
      renderItem={({ item }) => <Notification notification={item} />}
      ItemSeparatorComponent={Divider}
      ListHeaderComponent={
        <>
          <Account
            id={request.account_id}
            style={{ paddingVertical: 8, paddingHorizontal: 12 }}
            withLink
          />
          <Divider />
        </>
      }
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
                id='empty_column.notification_request'
                defaultMessage='There are no pending notifications from this user yet.'
              />
            }
          />
        ) : null
      }
      ListFooterComponent={<LoadMore query={query} />}
      contentContainerStyle={{ paddingBottom: bottomInset }}
    />
  );
};

export { FilteredNotificationsBanner, NotificationRequestsScreen, NotificationRequestScreen };
