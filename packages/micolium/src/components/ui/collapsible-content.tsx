import { Button, useTheme } from '@mkljczk/react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { View } from 'react-native';

interface ICollapsibleContent {
  children: React.JSX.Element;
  maxHeight?: number;
  showExpand?: boolean;
}

const CollapsibleContent: React.FC<ICollapsibleContent> = ({
  children,
  maxHeight = 320,
  showExpand = true,
}) => {
  const { colors } = useTheme();

  const containerNode = React.useRef<View>(null);
  const [shouldCollapse, setShouldCollapse] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(true);

  React.useLayoutEffect(() => {
    if (!containerNode.current) return;

    setShouldCollapse(containerNode.current.clientHeight > maxHeight + 80);
  }, [containerNode]);

  const transparentBackground = colors.background.toString().slice(0, -2) + '0)';

  return (
    <View
      style={{
        maxHeight: shouldCollapse && collapsed ? maxHeight : undefined,
        overflow: shouldCollapse && collapsed ? 'hidden' : undefined,
      }}
      ref={containerNode}
    >
      {children}
      {shouldCollapse && collapsed && (
        <LinearGradient
          colors={[transparentBackground, colors.background]}
          style={{
            justifyContent: 'flex-end',
            alignItems: 'center',
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: Math.min(maxHeight, 160),
          }}
        >
          {showExpand && (
            <Button
              mode='contained-tonal'
              onPress={() => setCollapsed(false)}
              style={{
                position: 'absolute',
                width: 'auto',
                bottom: 4,
                marginHorizontal: 'auto',
              }}
            >
              <FormattedMessage id='status.show_more' defaultMessage='Show more' />
            </Button>
          )}
        </LinearGradient>
      )}
    </View>
  );
};

export { CollapsibleContent };
