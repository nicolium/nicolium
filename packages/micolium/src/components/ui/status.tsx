import { Button, Card, Text, useTheme } from '@mkljczk/react-native-paper';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { View } from 'react-native';

import { CollapsibleContent } from './collapsible-content';
import { Emojify } from './emojify';
import { StyledHtml } from './styled-html';

import type { CustomEmoji, FilterResult, Mention } from 'pl-api';

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
  filters?: Array<FilterResult>;
  showFiltered?: boolean;
  unfilterStatus?: () => void;
  contentKey?: string;
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
  filters,
  showFiltered,
  unfilterStatus,
  contentKey,
}) => {
  const theme = useTheme();

  let status;

  if (filters?.length && !showFiltered) {
    status = (
      <Card mode='contained' style={{ borderWidth: 1, borderColor: theme.colors.primary }}>
        <Card.Content style={{ paddingBottom: unfilterStatus ? 0 : 16 }}>
          <Text variant='titleSmall'>
            <FormattedMessage id='status.filtered' defaultMessage='Filtered' />:{' '}
            {filters.map((filter) => filter.filter.title).join(', ')}.
          </Text>
        </Card.Content>
        <Card.Actions>
          <Button onPress={unfilterStatus} mode='contained'>
            <FormattedMessage id='status.show_filter_reason' defaultMessage='Show anyway' />
          </Button>
        </Card.Actions>
      </Card>
    );
  } else {
    const statusBody = (
      <StyledHtml
        html={content}
        emojis={emojis}
        mentions={mentions}
        sizeMultiplier={detailed ? 1.2 : 1}
      />
    );

    status = (
      <View style={[{ flexDirection: 'column', gap: 8 }, isConnectedBottom && { flex: 1 }]}>
        {displayedMentions}
        {!textOnly && spoilerText && (
          <Card
            mode='contained'
            style={{ borderWidth: 1, borderColor: theme.colors.primary }}
            onPress={spoilerExpanded ? collapseStatusSpoiler : expandStatusSpoiler}
          >
            <Card.Content style={{ paddingBottom: expandStatusSpoiler ? 0 : 16 }}>
              <Text
                variant='titleSmall'
                numberOfLines={!(detailed || spoilerExpanded) ? 1 : undefined}
              >
                {emojis ? <Emojify text={spoilerText} emojis={emojis} /> : spoilerText}
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
        )}
        {(textOnly || !spoilerText || !expandStatusSpoiler || spoilerExpanded) && (
          <>
            {detailed ? (
              statusBody
            ) : (
              <CollapsibleContent
                maxHeight={textOnly ? 40 : compact ? 120 : undefined}
                showExpand={!textOnly}
                key={contentKey}
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
  }

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
