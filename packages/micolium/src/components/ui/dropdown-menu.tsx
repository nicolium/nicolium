import {
  Button as SwiftUIButton,
  ControlGroup as SwiftUIControlGroup,
  Divider as SwiftUIDivider,
  Host as SwiftUIHost,
  Label as SwiftUILabel,
  Menu as SwiftUIMenu,
  RNHostView as SwiftUIRNHostView,
  Section as SwiftUISection,
  Text as SwiftUIText,
  Toggle as SwiftUIToggle,
} from '@expo/ui/swift-ui';
import { disabled } from '@expo/ui/swift-ui/modifiers';
import React from 'react';
import { View } from 'react-native';

import type { DropdownMenuItem } from './dropdown-menu-types';

const swiftUILabel = (item: DropdownMenuItem) =>
  item.sublabel ? (
    <SwiftUILabel systemImage={item.appleIcon}>
      <SwiftUIText>{item.label}</SwiftUIText>
      <SwiftUIText>{item.sublabel}</SwiftUIText>
    </SwiftUILabel>
  ) : (
    <SwiftUILabel title={item.label} systemImage={item.appleIcon} />
  );

const swiftUIRenderItem = (item: DropdownMenuItem, isLast?: boolean) => {
  switch (item.type) {
    case 'button': {
      if (item.checked !== undefined) {
        return (
          <SwiftUIToggle
            key={item.key}
            isOn={item.checked}
            onIsOnChange={item.onPress}
            modifiers={[disabled(item.disabled ?? false)]}
          >
            {swiftUILabel(item)}
          </SwiftUIToggle>
        );
      }

      return (
        <SwiftUIButton
          key={item.key}
          role={item.destructive ? 'destructive' : undefined}
          onPress={item.onPress}
          modifiers={[disabled(item.disabled ?? false)]}
        >
          {swiftUILabel(item)}
        </SwiftUIButton>
      );
    }
    case 'section': {
      const Section = item.controlGroup ? SwiftUIControlGroup : SwiftUISection;

      return (
        <React.Fragment key={item.key}>
          <Section key={item.key} title={item.label}>
            {item.children.map((child, index, array) =>
              swiftUIRenderItem(child, array.length - 1 === index),
            )}
          </Section>
          {!isLast && <SwiftUIDivider />}
        </React.Fragment>
      );
    }
    case 'menu': {
      return (
        <SwiftUIMenu key={item.key} label={item.label} systemImage={item.appleIcon}>
          {item.children.map((child, index, array) =>
            swiftUIRenderItem(child, array.length - 1 === index),
          )}
        </SwiftUIMenu>
      );
    }
  }
};

type IDropdownMenu<T extends Array<unknown>> = {
  trigger: React.JSX.Element | ((onPress: () => void) => React.JSX.Element);
  fullWidth?: boolean;
} & (
  | {
      items: Array<DropdownMenuItem>;
    }
  | {
      useItems: (...args: T) => Array<DropdownMenuItem>;
      hookArgs?: T;
    }
);

const SwiftUIDropdownMenuItems = <T extends Array<unknown>>(props: IDropdownMenu<T>) => {
  const items =
    'useItems' in props ? props.useItems(...(props.hookArgs || ([] as any as T))) : props.items;

  return items.map((item, index, array) => swiftUIRenderItem(item, array.length - 1 === index));
};

const DropdownMenu: <T extends Array<unknown> = []>(
  props: IDropdownMenu<T>,
) => React.JSX.Element = (props) => {
  const [width, setWidth] = React.useState<number>();

  return (
    <View
      onStartShouldSetResponder={() => true}
      onLayout={props.fullWidth ? (event) => setWidth(event.nativeEvent.layout.width) : undefined}
    >
      <SwiftUIHost matchContents>
        <SwiftUIMenu
          label={
            <SwiftUIRNHostView matchContents>
              <View style={props.fullWidth ? { width } : undefined}>
                {typeof props.trigger === 'function' ? props.trigger(() => {}) : props.trigger}
              </View>
            </SwiftUIRNHostView>
          }
        >
          <SwiftUIDropdownMenuItems {...props} />
        </SwiftUIMenu>
      </SwiftUIHost>
    </View>
  );
};

export { DropdownMenu, type DropdownMenuItem };
