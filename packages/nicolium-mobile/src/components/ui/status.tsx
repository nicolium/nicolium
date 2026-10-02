import RenderHTML from '@native-html/render';
import React from 'react';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';

interface IUIStatus {
  account: React.JSX.Element;
  content: string;
  actions?: React.JSX.Element;
  isConnectedBottom?: boolean;
}

const UIStatus: React.FC<IUIStatus> = ({ account, content, actions, isConnectedBottom }) => {
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
      {actions}
    </View>
  );

  return (
    <View style={{ flexDirection: 'column', gap: 8, marginBottom: isConnectedBottom ? -16 : 0 }}>
      {account}
      {isConnectedBottom ? (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View
            style={{
              marginHorizontal: 19,
              width: 2,
              backgroundColor: theme.colors.surfaceDim,
              marginBottom: -8,
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
