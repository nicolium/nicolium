import { useTheme } from '@mkljczk/react-native-paper';
import RenderHTML from '@native-html/render';
import React from 'react';
import { View } from 'react-native';

interface IUIStatus {
  account: React.JSX.Element;
  content: string;
  media?: React.JSX.Element;
  actions?: React.JSX.Element;
  isConnectedBottom?: boolean;
  chip?: React.JSX.Element;
}

const UIStatus: React.FC<IUIStatus> = ({
  account,
  content,
  media,
  actions,
  isConnectedBottom,
  chip,
}) => {
  const theme = useTheme();

  const status = (
    <View style={{ flexDirection: 'column', gap: 8, flex: 1 }}>
      <RenderHTML
        source={{ html: content }}
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
      />
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
