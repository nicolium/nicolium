import { Card, Icon, Text } from '@mkljczk/react-native-paper';
import { InfoIcon } from 'phosphor-react-native/src/icons/Info';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { View } from 'react-native';

import { iconHelper } from '../ui/icon';

interface IStatusFakeNewsAlert {
  publishedAt: string;
}

const StatusFakeNewsAlert: React.FC<IStatusFakeNewsAlert> = ({ publishedAt }) => {
  return (
    <Card mode='outlined'>
      <Card.Content style={{ gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Icon source={iconHelper(InfoIcon)} size={20} />
          <Text variant='titleMedium' numberOfLines={2}>
            <FormattedMessage id='status.fake_news.heading' defaultMessage='False information' />
          </Text>
        </View>
        <Text variant='bodyMedium'>
          <FormattedMessage
            id='status.fake_news.text'
            defaultMessage='This post has been marked as false information by a third-party fact-checker. {description}'
            values={{
              description: (
                <FormattedMessage
                  id='status.fake_news.description.published_at'
                  defaultMessage='The post was actually published on {hour}.'
                  values={{ hour: publishedAt }}
                />
              ),
            }}
          />
        </Text>
      </Card.Content>
    </Card>
  );
};

export { StatusFakeNewsAlert as default };
