import { Card, Icon, Text } from '@mkljczk/react-native-paper';
import { LinkSimpleIcon } from 'phosphor-react-native/src/icons/LinkSimple';
import React from 'react';
import { Linking, View } from 'react-native';

import { iconHelper } from '../ui/icon';

import type { SelectedStatus } from '@/queries/statuses/use-status';

interface IStatusLinkPreview {
  status: SelectedStatus;
}

const StatusLinkPreview: React.FC<IStatusLinkPreview> = ({ status }) => {
  if (status.media_attachments.length || status.quote_id) return null;

  if (!status.card) return null;

  return (
    <Card
      onPress={() => {
        Linking.openURL(status.card!.url);
      }}
    >
      {status.card.image && (
        <Card.Cover
          source={{ uri: status.card.image }}
          accessibilityLabel={status.card.image_description}
        />
      )}
      <Card.Content style={{ gap: 4, paddingTop: status.card.image ? undefined : 16 }}>
        <Text variant='titleMedium' numberOfLines={2}>
          {status.card.title}
        </Text>
        {status.card.description && (
          <Text variant='bodyMedium' numberOfLines={2}>
            {status.card.description}
          </Text>
        )}
        {status.card.provider_name && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon source={iconHelper(LinkSimpleIcon)} size={20} />
            <Text variant='bodyMedium'>{status.card.provider_name}</Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

export { StatusLinkPreview };
