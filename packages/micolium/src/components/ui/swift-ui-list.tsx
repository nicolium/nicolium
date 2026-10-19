import { Host, List } from '@expo/ui/swift-ui';
import { scrollDisabled, useScrollGeometryChange } from '@expo/ui/swift-ui/modifiers';
import React from 'react';

import type { StyleProp, ViewStyle } from 'react-native';

interface ISwiftUIList {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const SwiftUIList: React.FC<ISwiftUIList> = ({ children, style }) => {
  const [listHeight, setListHeight] = React.useState(67);
  const listGeometryModifier = useScrollGeometryChange(({ contentHeight }) =>
    setListHeight(contentHeight),
  );

  return (
    <Host
      style={[
        {
          height: listHeight,
          marginHorizontal: -16,
          marginTop: -32,
          backgroundColor: 'transparent',
        },
        style,
      ]}
    >
      <List modifiers={[scrollDisabled(), ...(listGeometryModifier ? [listGeometryModifier] : [])]}>
        {children}
      </List>
    </Host>
  );
};

export { SwiftUIList };
