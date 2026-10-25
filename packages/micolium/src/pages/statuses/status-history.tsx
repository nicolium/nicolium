import { ActivityIndicator, Divider, Text, useTheme } from '@mkljczk/react-native-paper';
import { FlashList } from '@shopify/flash-list';
import React from 'react';
import { FormattedDate, FormattedMessage } from 'react-intl';
import { View } from 'react-native';

import { StatusMedia } from '@/components/statuses/status-media';
import { Emojify } from '@/components/ui/emojify';
import { StyledHtml } from '@/components/ui/styled-html';
import { useStatus } from '@/queries/statuses/use-status';
import { useStatusHistory } from '@/queries/statuses/use-status-history';

import type { StatusStackParams } from '@/router/router';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const StatusHistoryScreen = ({
  route: {
    params: { id },
  },
}: NativeStackScreenProps<StatusStackParams, 'history'>) => {
  const { colors } = useTheme();
  const { data: status } = useStatus(id);
  const { data: versions, isPending } = useStatusHistory(id);

  return (
    <FlashList
      data={versions}
      keyExtractor={(version) => version.created_at}
      renderItem={({ item: version, index }) => (
        <View style={{ padding: 16, gap: 8 }}>
          <Text variant='labelLarge' style={{ color: colors.onSurfaceVariant }}>
            {versions && index === versions.length - 1 && (
              <>
                <FormattedMessage id='compare_history_modal.original' defaultMessage='Original' />
                {' · '}
              </>
            )}
            <FormattedDate
              value={new Date(version.created_at)}
              hour12
              year='numeric'
              month='short'
              day='2-digit'
              hour='numeric'
              minute='2-digit'
            />
          </Text>
          {version.spoiler_text.length > 0 && (
            <Text variant='titleSmall'>
              <Emojify text={version.spoiler_text} emojis={version.emojis} />
            </Text>
          )}
          <StyledHtml html={version.content} emojis={version.emojis} mentions={status?.mentions} />
          {version.poll && (
            <View style={{ gap: 8 }}>
              {version.poll.options.map((option) => (
                <View
                  key={option.title}
                  style={{
                    padding: 10,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    borderColor: colors.outlineVariant,
                    borderWidth: 1,
                  }}
                >
                  <Text numberOfLines={1}>
                    <Emojify text={option.title} emojis={version.emojis} />
                  </Text>
                </View>
              ))}
            </View>
          )}
          <StatusMedia status={version} compact />
        </View>
      )}
      ItemSeparatorComponent={Divider}
      ListFooterComponent={
        isPending ? <ActivityIndicator style={{ marginVertical: 8 }} size='large' /> : undefined
      }
    />
  );
};

export { StatusHistoryScreen };
