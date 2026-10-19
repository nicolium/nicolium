import { Host, List } from '@expo/ui/swift-ui';
import { scrollDisabled, useScrollGeometryChange } from '@expo/ui/swift-ui/modifiers';
import React from 'react';

interface ISwiftUIList {
  children: React.ReactNode;
}

const SwiftUIList: React.FC<ISwiftUIList> = ({ children }) => {
  const [listHeight, setListHeight] = React.useState(67);
  const listGeometryModifier = useScrollGeometryChange(({ contentHeight }) =>
    setListHeight(contentHeight),
  );

  return (
    <Host style={{ height: listHeight, marginHorizontal: -16, marginTop: -32 }}>
      <List modifiers={[scrollDisabled(), ...(listGeometryModifier ? [listGeometryModifier] : [])]}>
        {children}
      </List>
    </Host>
  );
};

export { SwiftUIList };
