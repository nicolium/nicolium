import { Card, Icon, Text, TouchableRipple } from '@mkljczk/react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { LinkSimpleIcon } from 'phosphor-react-native';
import React from 'react';
import { View } from 'react-native';

import { iconHelper } from './ui/icon';

import type { TrendsLink as TrendsLinkEntity } from 'pl-api';

interface ITrendsLink {
  link: TrendsLinkEntity;
}

const TrendsLink: React.FC<ITrendsLink> = ({ link }) => {
  const navigation = useNavigation();

  return (
    <TouchableRipple
      onPress={() => {
        navigation.navigate('links', { url: link.url });
      }}
    >
      <Card>
        {link.image && (
          <Card.Cover
            source={{ uri: link.image }}
            accessibilityLabel={link.image_description || undefined}
          />
        )}
        <Card.Content style={{ gap: 4 }}>
          <Text variant='titleMedium' numberOfLines={2}>{link.title}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon source={iconHelper(LinkSimpleIcon)} size={20} />
            <Text variant='bodyMedium'>{link.provider_name}</Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableRipple>
  );
};

export { TrendsLink };
