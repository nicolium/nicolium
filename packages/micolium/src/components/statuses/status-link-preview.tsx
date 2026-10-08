import { Card, Icon, Text, TouchableRipple } from '@mkljczk/react-native-paper';
import { LinkSimpleIcon } from 'phosphor-react-native';
import React from 'react';
import { Linking, View } from 'react-native';

import { type SelectedStatus } from '@/queries/statuses/use-status';

import { iconHelper } from '../ui/icon';

interface IStatusLinkPreview {
  status: SelectedStatus;
}

const StatusLinkPreview: React.FC<IStatusLinkPreview> = ({ status }) => {
  if (status.media_attachments.length || status.quote_id) return null;

  if (!status.card) return null;

  return (
    <TouchableRipple
      onPress={() => {
        Linking.openURL(status.card!.url);
      }}
    >
      <Card>
        {status.card.image && (
          <Card.Cover
            source={{ uri: status.card.image }}
            accessibilityLabel={status.card.image_description}
          />
        )}
        <Card.Content style={{ gap: 4, paddingTop: status.card.image ? undefined : 16 }}>
          <Text variant='titleMedium'>{status.card.title}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon source={iconHelper(LinkSimpleIcon)} size={20} />
            <Text variant='bodyMedium'>{status.card.provider_name}</Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableRipple>
  );
};

export { StatusLinkPreview };
