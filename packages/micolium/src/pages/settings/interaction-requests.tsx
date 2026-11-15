import { Chip, Divider, IconButton, Text, useTheme } from '@mkljczk/react-native-paper';
import { Link, useScrollToTop } from '@react-navigation/native';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { ArrowBendUpLeftIcon } from 'phosphor-react-native/src/icons/ArrowBendUpLeft';
import { CheckIcon } from 'phosphor-react-native/src/icons/Check';
import { HeartIcon } from 'phosphor-react-native/src/icons/Heart';
import { RepeatIcon } from 'phosphor-react-native/src/icons/Repeat';
import { StarIcon } from 'phosphor-react-native/src/icons/Star';
import { XIcon } from 'phosphor-react-native/src/icons/X';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { View } from 'react-native';
import { toast } from 'sonner-native';

import RelativeTimestamp from '@/components/relative-timestamp';
import { Status } from '@/components/statuses/status';
import { Emojify } from '@/components/ui/emojify';
import { EmptyMessage } from '@/components/ui/empty-message';
import { iconHelper } from '@/components/ui/icon';
import { LoadMore } from '@/components/ui/load-more';
import { useAccount } from '@/queries/accounts/use-account';
import {
  type MinifiedInteractionRequest,
  useAuthorizeInteractionRequestMutation,
  useFlatInteractionRequests,
  useRejectInteractionRequestMutation,
} from '@/queries/statuses/use-interaction-requests';
import { useSetting } from '@/stores/settings';

import type { SettingsStackParams } from '@/router/router';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const messages = defineMessages({
  favourite: {
    id: 'interaction_request.favourite',
    defaultMessage: '{name} wants to like your <link>post</link>',
  },
  reply: {
    id: 'interaction_request.reply',
    defaultMessage: '{name} wants to reply to your <link>post</link>',
  },
  reblog: {
    id: 'interaction_request.reblog',
    defaultMessage: '{name} wants to repost your <link>post</link>',
  },
  authorize: {
    id: 'interaction_request.authorize',
    defaultMessage: 'Authorize',
  },
  authorized: {
    id: 'interaction_request.authorize.success',
    defaultMessage: 'Authorized @{acct} interaction request',
  },
  authorizeFail: {
    id: 'interaction_request.authorize.fail',
    defaultMessage: 'Failed to authorize @{acct} interaction request',
  },
  reject: {
    id: 'interaction_request.reject',
    defaultMessage: 'Reject',
  },
  rejected: {
    id: 'interaction_request.reject.success',
    defaultMessage: 'Rejected @{acct} interaction request',
  },
  rejectFail: {
    id: 'interaction_request.reject.fail',
    defaultMessage: 'Failed to reject @{acct} interaction request',
  },
});

const icons = {
  favourite: StarIcon,
  reblog: RepeatIcon,
  reply: ArrowBendUpLeftIcon,
};

interface IInteractionRequest {
  interactionRequest: MinifiedInteractionRequest;
}

const InteractionRequest: React.FC<IInteractionRequest> = ({ interactionRequest }) => {
  const { colors } = useTheme();
  const intl = useIntl();

  const { data: account } = useAccount(interactionRequest.account_id);

  const { mutate: authorize, isPending } = useAuthorizeInteractionRequestMutation(
    interactionRequest.id,
  );
  const { mutate: reject } = useRejectInteractionRequestMutation(interactionRequest.id);

  const handleAuthorize = () => {
    authorize(undefined, {
      onSuccess: () => {
        toast.success(
          intl.formatMessage(messages.authorized, {
            acct: account?.acct,
          }),
        );
      },
      onError: () => {
        toast.error(
          intl.formatMessage(messages.authorizeFail, {
            acct: account?.acct,
          }),
        );
      },
    });
  };

  const handleReject = () => {
    reject(undefined, {
      onSuccess: () => {
        toast.success(
          intl.formatMessage(messages.rejected, {
            acct: account?.acct,
          }),
        );
      },
      onError: () => {
        toast.error(
          intl.formatMessage(messages.rejectFail, {
            acct: account?.acct,
          }),
        );
      },
    });
  };

  const useHeartIconForFavourites = useSetting('appearance.useHeartIconForFavourites');

  let icon = icons[interactionRequest.type];
  if (interactionRequest.type === 'favourite' && useHeartIconForFavourites) {
    icon = HeartIcon;
  }

  const message = intl.formatMessage(messages[interactionRequest.type], {
    name: account && (
      <Link screen='accounts' params={{ screen: 'view', params: { id: account.id } }}>
        <Emojify text={account.display_name} emojis={account.emojis} />
      </Link>
    ),
    link: (children: React.ReactNode) => {
      if (interactionRequest.status_id) {
        return (
          <Link
            screen='status'
            params={{ screen: 'view', params: { id: interactionRequest.status_id } }}
          >
            {children}
          </Link>
        );
      }

      return children;
    },
  });

  const chip = (
    <Chip
      mode='outlined'
      icon={iconHelper(icon)}
      compact
      style={{ flexShrink: 1 }}
      textStyle={{ flexShrink: 1 }}
    >
      {message}
    </Chip>
  );

  const actions = (
    <View style={{ flexDirection: 'row' }}>
      <IconButton
        mode='outlined'
        icon={iconHelper(XIcon)}
        onPress={() => handleReject()}
        disabled={isPending}
        loading={isPending}
        accessibilityLabel={intl.formatMessage(messages.reject)}
      />
      <IconButton
        mode='contained'
        icon={iconHelper(CheckIcon)}
        onPress={() => handleAuthorize()}
        disabled={isPending}
        loading={isPending}
        accessibilityLabel={intl.formatMessage(messages.authorize)}
      />
    </View>
  );

  return (
    <View style={{ padding: 16, gap: 8 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        {chip}
        <Text variant='bodyMedium' numberOfLines={1} style={{ color: colors.outline }}>
          {!interactionRequest.reply_id && (
            <RelativeTimestamp timestamp={interactionRequest.created_at} />
          )}
        </Text>
      </View>
      {interactionRequest.status_id && (
        <Status
          id={interactionRequest.status_id}
          withLink
          compact
          context='notifications'
          style={{ padding: 0 }}
          withActions={false}
          isConnectedBottom={!!interactionRequest.reply_id}
          actions={interactionRequest.reply_id ? undefined : actions}
        />
      )}
      {interactionRequest.reply_id && (
        <Status
          id={interactionRequest.reply_id}
          withLink
          context='notifications'
          style={{ padding: 0, marginTop: 24 }}
          withActions={false}
          actions={actions}
        />
      )}
    </View>
  );
};

const InteractionRequestsScreen = (
  _: NativeStackScreenProps<SettingsStackParams, 'interaction_requests'>,
) => {
  const autoloadMore = useSetting('timelines.autoloadMore');

  const query = useFlatInteractionRequests();
  const ref = React.useRef<FlashListRef<MinifiedInteractionRequest>>(null);
  useScrollToTop(ref);

  return (
    <FlashList
      ref={ref}
      data={query.data}
      renderItem={({ item }) => <InteractionRequest interactionRequest={item} />}
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
                id='empty_column.interaction_requests'
                defaultMessage='There are no pending interaction requests.'
              />
            }
          />
        ) : null
      }
      ListFooterComponent={<LoadMore query={query} />}
    />
  );
};

export { InteractionRequestsScreen };
