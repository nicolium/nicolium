import { Button, Card, Text, TouchableRipple, useTheme } from '@mkljczk/react-native-paper';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { View } from 'react-native';

import { CollapsibleContent } from './collapsible-content';
import { StyledHtml } from './styled-html';

import type { CustomEmoji, Mention } from 'pl-api';

interface IUIStatus {
  account: React.JSX.Element;
  displayedMentions?: React.JSX.Element;
  content: string;
  emojis?: Array<CustomEmoji>;
  mentions?: Array<Mention>;
  spoilerText?: string;
  media?: React.JSX.Element;
  actions?: React.JSX.Element;
  isConnectedBottom?: boolean;
  chip?: React.JSX.Element;
  detailed?: boolean;
  compact?: boolean;
  textOnly?: boolean;
  spoilerExpanded?: boolean;
  expandStatusSpoiler?: () => void;
  collapseStatusSpoiler?: () => void;
}

const UIStatus: React.FC<IUIStatus> = ({
  account,
  displayedMentions,
  content,
  spoilerText,
  emojis,
  mentions,
  media,
  actions,
  isConnectedBottom,
  chip,
  detailed,
  compact,
  textOnly,
  spoilerExpanded,
  expandStatusSpoiler,
  collapseStatusSpoiler,
}) => {
  const theme = useTheme();

  const statusBody = (
    <StyledHtml
      html={content}
      emojis={emojis}
      mentions={mentions}
      sizeMultiplier={detailed ? 1.2 : 1}
    />
  );

  const status = (
    <View style={[{ flexDirection: 'column', gap: 8 }, isConnectedBottom && { flex: 1 }]}>
      {displayedMentions}
      {!textOnly && spoilerText && (
        <TouchableRipple onPress={spoilerExpanded ? collapseStatusSpoiler : expandStatusSpoiler}>
          <Card mode='contained' style={{ borderWidth: 1, borderColor: theme.colors.primary }}>
            <Card.Content style={{ paddingBottom: expandStatusSpoiler ? 0 : 16 }}>
              <Text
                variant='titleSmall'
                numberOfLines={!(detailed || spoilerExpanded) ? 1 : undefined}
              >
                {spoilerText}
              </Text>
            </Card.Content>
            {expandStatusSpoiler && (
              <Card.Actions style={{ paddingTop: 0 }}>
                <Button
                  mode='text'
                  compact
                  onPress={spoilerExpanded ? collapseStatusSpoiler : expandStatusSpoiler}
                >
                  {spoilerExpanded ? (
                    <FormattedMessage id='status.collapse' defaultMessage='Collapse' />
                  ) : (
                    <FormattedMessage id='status.read_more' defaultMessage='Read more' />
                  )}
                </Button>
              </Card.Actions>
            )}
          </Card>
        </TouchableRipple>
      )}
      {(textOnly || !spoilerText || !expandStatusSpoiler || spoilerExpanded) && (
        <>
          {detailed ? (
            statusBody
          ) : (
            <CollapsibleContent
              maxHeight={textOnly ? 40 : compact ? 120 : undefined}
              showExpand={!textOnly}
            >
              {statusBody}
            </CollapsibleContent>
          )}
          {media}
        </>
      )}
      {!textOnly && actions}
    </View>
  );

  return (
    <View style={{ flexDirection: 'column', gap: 8, marginBottom: isConnectedBottom ? -16 : 0 }}>
      {chip && <View style={{ flexDirection: 'row' }}>{chip}</View>}
      {account}
      {isConnectedBottom ? (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View
            style={{
              marginHorizontal: 19,
              width: 2,
              backgroundColor: theme.colors.surfaceContainerHigh,
              marginBottom: -8,
              zIndex: 1,
            }}
          ></View>
          {status}
        </View>
      ) : (
        status
      )}
    </View>
  );
};

export { UIStatus };
