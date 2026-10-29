import {
  ActivityIndicator,
  Divider,
  Text,
  TouchableRipple,
  useTheme,
} from '@mkljczk/react-native-paper';
import { FlashList } from '@shopify/flash-list';
import { GlassView } from 'expo-glass-effect';
import { EyeIcon } from 'phosphor-react-native/src/icons/Eye';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CurrentAccountAvatar } from '@/components/current-account-avatar';
import { Status } from '@/components/statuses/status';
import { HeaderIconButton } from '@/components/ui/header-icon-button';
import { useFeatures } from '@/contexts/current-account-context';
import { useCanInteract } from '@/hooks/use-can-interact';
import { useEnableLiquidGlass } from '@/hooks/use-enable-liquid-glass';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { type SelectedStatus, useStatus, useStatusContext } from '@/queries/statuses/use-status';
import { useComposeActions } from '@/stores/compose';
import { useThread } from '@/stores/contexts';
import { useStatusMetaActions } from '@/stores/status-meta';
import { useUiStoreActions } from '@/stores/ui';

import type { StatusStackParams } from '@/router/router';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const messages = defineMessages({
  expandAll: { id: 'status.thread.expand_all', defaultMessage: 'Expand all posts' },
});

const MaybeDivider: React.FC<{ statusId: string }> = ({ statusId }) => {
  const { data: status } = useStatus(statusId);

  if (status?.replies_count) return null;

  return <Divider />;
};

interface IReplyBox {
  status?: SelectedStatus;
}

const ReplyBox: React.FC<IReplyBox> = ({ status }) => {
  const { bottom: bottomInset } = useSafeAreaInsets();
  const { colors } = useTheme();
  const { replyCompose } = useComposeActions();
  const { openCompose } = useUiStoreActions();
  const glassEffect = useEnableLiquidGlass();

  const canReply = useCanInteract(status, 'can_reply');

  const features = useFeatures();
  const scopeUrl = useScopeUrl();

  if (!status || !canReply) return null;

  const handleReply = () => {
    if (!status) return;

    replyCompose(status, scopeUrl, features);
    openCompose();
  };

  const content = (
    <>
      <CurrentAccountAvatar />
      <Text>
        <FormattedMessage
          id='compose.reply_indicator'
          defaultMessage='Reply to @{acct}'
          values={{
            acct: status.account.acct,
          }}
        />
      </Text>
    </>
  );

  if (glassEffect) {
    return (
      <Pressable
        onPress={handleReply}
        style={{
          marginTop: 8,
          marginBottom: 8 + bottomInset,
          marginHorizontal: 16,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <GlassView
          style={{
            gap: 8,
            flexDirection: 'row',
            alignItems: 'center',
            padding: 8,
            backgroundColor: colors.surfaceVariant,
            borderRadius: 20,
            overflow: 'hidden',
          }}
          glassEffectStyle='clear'
          isInteractive
        >
          {content}
        </GlassView>
      </Pressable>
    );
  }

  return (
    <View
      style={{
        backgroundColor: colors.surfaceContainer,
        paddingTop: 8,
        paddingBottom: 8 + bottomInset,
        paddingHorizontal: 16,
        borderTopColor: colors.surfaceVariant,
        borderTopWidth: 1,
      }}
    >
      <TouchableRipple
        style={{
          gap: 8,
          flexDirection: 'row',
          alignItems: 'center',
          padding: 8,
          backgroundColor: colors.surfaceVariant,
          borderRadius: 20,
          overflow: 'hidden',
        }}
        onPress={handleReply}
      >
        {content}
      </TouchableRipple>
    </View>
  );
};

const ThreadScreen = ({
  route: {
    params: { id },
  },
}: NativeStackScreenProps<StatusStackParams, 'view'>) => {
  const { bottom: bottomInset } = useSafeAreaInsets();
  const { colors } = useTheme();
  const { data: status } = useStatus(id);
  const contextQuery = useStatusContext(id);
  const thread = useThread(id);
  const glassEffect = useEnableLiquidGlass();

  return (
    <>
      <FlashList
        data={thread}
        renderItem={({ item }) => (
          <Status
            id={item}
            context='thread'
            withLink={item !== id}
            style={item === id ? { backgroundColor: colors.surfaceContainerLow } : undefined}
            detailed={item === id}
            isConnectedBottom={(status) => item !== id && status.replies_count > 0}
          />
        )}
        ItemSeparatorComponent={({ leadingItem }) =>
          leadingItem === id ? <Divider /> : <MaybeDivider statusId={leadingItem} />
        }
        initialScrollIndex={thread.indexOf(id)}
        ListFooterComponent={
          contextQuery.isPending && !status?.in_reply_to_id ? (
            <ActivityIndicator
              style={{
                marginVertical: 8,
                marginBottom: glassEffect ? 64 + bottomInset : undefined,
              }}
            />
          ) : glassEffect ? (
            <View style={{ height: 56 + bottomInset }} />
          ) : undefined
        }
        ListHeaderComponent={
          contextQuery.isPending && status?.in_reply_to_id ? (
            <ActivityIndicator style={{ marginVertical: 8 }} />
          ) : undefined
        }
        onRefresh={contextQuery.refetch}
        refreshing={contextQuery.isRefetching}
      />
      <ReplyBox status={status} />
    </>
  );
};

interface IThreadExpandPostsButton {
  id: string;
}

const ThreadExpandPostsButton: React.FC<IThreadExpandPostsButton> = ({ id }) => {
  const intl = useIntl();
  const thread = useThread(id);

  const { expandStatusSpoiler, revealStatusMedia } = useStatusMetaActions();

  const handleExpand = () => {
    for (const statusId of thread) {
      expandStatusSpoiler(statusId);
      revealStatusMedia(statusId);
    }
  };

  return (
    <HeaderIconButton
      icon={EyeIcon}
      accessibilityLabel={intl.formatMessage(messages.expandAll)}
      onPress={handleExpand}
    />
  );
};

export { ThreadScreen, ThreadExpandPostsButton };
