import { useTheme } from '@mkljczk/react-native-paper';
import React from 'react';
import { View } from 'react-native';

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
}) => {
  const theme = useTheme();

  const status = (
    <View style={{ flexDirection: 'column', gap: 8, flex: 1 }}>
      <StyledHtml
        html={content}
        emojis={emojis}
        mentions={mentions}
        sizeMultiplier={detailed ? 1.25 : 1}
      />
      {/* source={{ html: content }}
        baseStyle={{
          color: theme.colors.onSecondaryContainer,
        }}
        tagsStyles={{
          p: {
            marginVertical: 0,
          },
          a: {
            color: theme.colors.primary,
            textDecorationColor: theme.colors.primary,
          },
        }}
      /> */}
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
              marginBottom: -16,
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
