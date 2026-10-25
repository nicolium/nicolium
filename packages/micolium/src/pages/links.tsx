import { Appbar, Card, Icon, Text, useTheme } from '@mkljczk/react-native-paper';
import { ArrowSquareOutIcon } from 'phosphor-react-native/src/icons/ArrowSquareOut';
import { LinkSimpleIcon } from 'phosphor-react-native/src/icons/LinkSimple';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Linking, View } from 'react-native';

import { Timeline } from '@/components/timelines/timeline';
import { iconHelper } from '@/components/ui/icon';
import { useClient } from '@/contexts/current-account-context';
import { useTimeline } from '@/queries/timelines/use-timeline';
import { useTrendingLinks } from '@/queries/trends/use-trending-links';

import type { RootStackParams } from '@/router/router';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const messages = defineMessages({
  header: { id: 'column.link_timeline', defaultMessage: 'Posts linking to {url}' },
  openInBrowser: { id: 'link_timeline.open_in_browser', defaultMessage: 'Open link in browser' },
});

const LinksScreen = ({
  navigation,
  route: {
    params: { url },
  },
}: NativeStackScreenProps<RootStackParams, 'links'>) => {
  const intl = useIntl();
  const client = useClient();
  const { colors } = useTheme();

  const { data: trendingLinks } = useTrendingLinks();
  const link = trendingLinks?.find((link) => link.url === url);

  const timelineQuery = useTimeline(`link:${url}`, (paginationParams) =>
    client.timelines.linkTimeline(url, paginationParams),
  );

  const header = link ? (
    <Card style={{ margin: 16, marginBottom: 0 }} onPress={() => Linking.openURL(url)}>
      {link.image && (
        <Card.Cover
          source={{ uri: link.image }}
          accessibilityLabel={link.image_description || undefined}
        />
      )}
      <Card.Content style={{ gap: 4 }}>
        <Text variant='titleMedium'>{link.title || url}</Text>
        {link.description ? (
          <Text variant='bodyMedium' numberOfLines={3} style={{ color: colors.onSurfaceVariant }}>
            {link.description}
          </Text>
        ) : null}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Icon source={iconHelper(LinkSimpleIcon)} size={20} />
          <Text variant='bodyMedium'>{link.provider_name}</Text>
        </View>
      </Card.Content>
    </Card>
  ) : undefined;

  return (
    <>
      <Appbar.Header mode='small' style={{ backgroundColor: colors.surfaceContainer }}>
        <Appbar.BackAction onPress={navigation.goBack} />
        <Appbar.Content
          title={intl.formatMessage(messages.header, {
            url: url.replace(/^https?:\/\/(www\.)?/, ''),
          })}
        />
        <Appbar.Action
          icon={iconHelper(ArrowSquareOutIcon)}
          onPress={() => Linking.openURL(url)}
          accessibilityLabel={intl.formatMessage(messages.openInBrowser)}
        />
      </Appbar.Header>
      <Timeline
        query={timelineQuery}
        header={header}
        emptyMessageText={
          <FormattedMessage
            id='empty_column.link_timeline'
            defaultMessage='There are no posts with this link yet.'
          />
        }
      />
    </>
  );
};

export { LinksScreen };
