import { useTheme } from '@mkljczk/react-native-paper';
import React from 'react';
import { View } from 'react-native';

import { CollapsibleContent } from './collapsible-content';
import { StyledHtml } from './styled-html';

import type { CustomEmoji, Mention } from 'pl-api';

interface IUIStatus {
  account: React.JSX.Element;
  content: string;
  emojis?: Array<CustomEmoji>;
  mentions?: Array<Mention>;
  media?: React.JSX.Element;
  actions?: React.JSX.Element;
  isConnectedBottom?: boolean;
  chip?: React.JSX.Element;
  detailed?: boolean;
  compact?: boolean;
}

const UIStatus: React.FC<IUIStatus> = ({
  account,
  content,
  emojis,
  mentions,
  media,
  actions,
  isConnectedBottom,
  chip,
  detailed,
  compact,
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
    <View style={{ flexDirection: 'column', gap: 8, flex: 1 }}>
      {detailed ? (
        statusBody
      ) : (
        <CollapsibleContent maxHeight={compact ? 120 : undefined}>{statusBody}</CollapsibleContent>
      )}
      {media}
      {actions}
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
