import {
  Box as JetpackBox,
  Host as JetpackHost,
  DropdownMenuGroup as JetpackDropdownMenuGroup,
  DropdownMenuPopup as JetpackDropdownMenuPopup,
  DropdownMenuItem as JetpackDropdownMenuItem,
  Icon as JetpackIcon,
  RNHostView as JetpackRNHostView,
  SelectableDropdownMenuItem as JetpackSelectableDropdownMenuItem,
  Spacer as JetpackSpacer,
  Text as JetpackText,
  type MenuShapePosition,
} from '@expo/ui/jetpack-compose';
import { height, padding } from '@expo/ui/jetpack-compose/modifiers';
import {
  Button as SwiftUIButton,
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
import { useTheme } from '@mkljczk/react-native-paper';
import React from 'react';
import { Platform, View } from 'react-native';

import type { SFSymbol } from 'expo-symbols';

type DropdownMenuItem = {
  key: string;
} & (
  | {
      type: 'button';
      onPress: () => void;
      label: string;
      sublabel?: string;
      appleIcon?: SFSymbol;
      androidIcon?: string;
      disabled?: boolean;
      checked?: boolean;
      destructive?: boolean;
    }
  | {
      type: 'section';
      children: Array<DropdownMenuItem>;
      label?: string;
      sublabel?: string;
      appleIcon?: SFSymbol;
      androidIcon?: string;
      disabled?: boolean;
    }
  | {
      type: 'menu';
      children: Array<DropdownMenuItem>;
      label: string;
      sublabel?: string;
      appleIcon?: SFSymbol;
      androidIcon?: string;
      disabled?: boolean;
    }
);

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
      return (
        <React.Fragment key={item.key}>
          <SwiftUISection key={item.key} title={item.label}>
            {item.children.map((child, index, array) =>
              swiftUIRenderItem(child, array.length - 1 === index),
            )}
          </SwiftUISection>
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

const jetpackItemContent = (item: DropdownMenuItem) => (
  <>
    <JetpackDropdownMenuItem.Text>
      <JetpackText>{item.label}</JetpackText>
    </JetpackDropdownMenuItem.Text>
    {item.sublabel && (
      <JetpackDropdownMenuItem.SupportingText>
        <JetpackText>{item.sublabel}</JetpackText>
      </JetpackDropdownMenuItem.SupportingText>
    )}
    {item.androidIcon && (
      <JetpackDropdownMenuItem.LeadingIcon>
        <JetpackIcon source={{ uri: item.androidIcon }} size={24} />
      </JetpackDropdownMenuItem.LeadingIcon>
    )}
  </>
);

interface IJetpackSubmenu {
  item: Extract<DropdownMenuItem, { type: 'menu' }>;
  shape: MenuShapePosition;
  onClose: () => void;
}

const JetpackSubmenu: React.FC<IJetpackSubmenu> = ({ item, shape, onClose }) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <JetpackBox>
      <JetpackDropdownMenuItem
        shape={shape}
        enabled={!item.disabled}
        onClick={() => setExpanded(true)}
      >
        {jetpackItemContent(item)}
        <JetpackDropdownMenuItem.TrailingIcon>
          <JetpackIcon source={{ uri: 'ph_caret_right' }} size={24} />
        </JetpackDropdownMenuItem.TrailingIcon>
      </JetpackDropdownMenuItem>
      <JetpackDropdownMenuPopup expanded={expanded} onDismissRequest={() => setExpanded(false)}>
        {jetpackRenderGroups(item.children, onClose)}
      </JetpackDropdownMenuPopup>
    </JetpackBox>
  );
};

interface IJetpackButton {
  item: Extract<DropdownMenuItem, { type: 'button' }>;
  shape: MenuShapePosition;
  onClose: () => void;
}

const JetpackButton: React.FC<IJetpackButton> = ({ item, shape, onClose }) => {
  const { colors } = useTheme();

  const onClick = () => {
    onClose();
    item.onPress();
  };

  if (item.checked !== undefined) {
    return (
      <JetpackSelectableDropdownMenuItem
        selected={item.checked}
        shapes={shape}
        enabled={!item.disabled}
        onClick={onClick}
        modifiers={[
          padding(0, shape.index === 0 ? 0 : 2, 0, shape.index === shape.count - 1 ? 0 : 2),
        ]}
      >
        {jetpackItemContent(item)}
        <JetpackSelectableDropdownMenuItem.SelectedLeadingIcon>
          <JetpackIcon source={{ uri: 'ph_check' }} size={24} />
        </JetpackSelectableDropdownMenuItem.SelectedLeadingIcon>
      </JetpackSelectableDropdownMenuItem>
    );
  }

  return (
    <JetpackDropdownMenuItem
      shape={shape}
      enabled={!item.disabled}
      onClick={onClick}
      elementColors={
        item.destructive ? { textColor: colors.error, leadingIconColor: colors.error } : undefined
      }
    >
      {jetpackItemContent(item)}
    </JetpackDropdownMenuItem>
  );
};

const jetpackRenderItem = (
  item: DropdownMenuItem,
  shape: MenuShapePosition,
  onClose: () => void,
) => {
  switch (item.type) {
    case 'button':
      return <JetpackButton key={item.key} item={item} shape={shape} onClose={onClose} />;
    case 'menu':
      return <JetpackSubmenu key={item.key} item={item} shape={shape} onClose={onClose} />;
    case 'section':
      return null;
  }
};

const jetpackRenderGroups = (items: Array<DropdownMenuItem>, onClose: () => void) => {
  const groups: Array<{
    key: string;
    label?: string;
    section?: boolean;
    items: Array<DropdownMenuItem>;
  }> = [];

  for (const item of items) {
    const lastGroup = groups.at(-1);
    if (item.type === 'section') {
      groups.push({ key: item.key, label: item.label, section: true, items: item.children });
    } else if (lastGroup && !lastGroup.section) {
      lastGroup.items.push(item);
    } else {
      groups.push({ key: item.key, items: [item] });
    }
  }

  return groups.map((group, index) => (
    <React.Fragment key={group.key}>
      {index > 0 && <JetpackSpacer modifiers={[height(2)]} />}
      <JetpackDropdownMenuGroup shapes={{ index, count: groups.length }}>
        {group.label && (
          <JetpackText style={{ typography: 'labelLarge' }} modifiers={[padding(12, 8, 12, 8)]}>
            {group.label}
          </JetpackText>
        )}
        {group.items.map((item, index, array) =>
          jetpackRenderItem(item, { index, count: array.length }, onClose),
        )}
      </JetpackDropdownMenuGroup>
    </React.Fragment>
  ));
};

type IDropdownMenu<T extends Array<unknown>> = {
  trigger: React.JSX.Element;
} & (
  | {
      items: Array<DropdownMenuItem>;
    }
  | {
      useItems: (...args: T) => Array<DropdownMenuItem>;
      hookArgs?: T;
    }
);

type IDropdownMenuItems<T extends Array<unknown>> = IDropdownMenu<T> & {
  onClose: () => void;
};

const SwiftUIDropdownMenuItems = <T extends Array<unknown>>(props: IDropdownMenu<T>) => {
  const items =
    'useItems' in props ? props.useItems(...(props.hookArgs || ([] as any as T))) : props.items;

  return items.map((item, index, array) => swiftUIRenderItem(item, array.length - 1 === index));
};

const JetpackDropdownMenuItems = <T extends Array<unknown>>(props: IDropdownMenuItems<T>) => {
  const items =
    'useItems' in props ? props.useItems(...(props.hookArgs || ([] as any as T))) : props.items;

  return jetpackRenderGroups(items, () => props.onClose());
};

const DropdownMenu: <T extends Array<unknown> = []>(props: IDropdownMenu<T>) => React.JSX.Element =
  Platform.OS === 'ios'
    ? (props) => (
        <View onStartShouldSetResponder={() => true}>
          <SwiftUIHost matchContents>
            <SwiftUIMenu
              label={
                <SwiftUIRNHostView matchContents>
                  <View>{props.trigger}</View>
                </SwiftUIRNHostView>
              }
            >
              <SwiftUIDropdownMenuItems {...props} />
            </SwiftUIMenu>
          </SwiftUIHost>
        </View>
      )
    : (props) => {
        const [expanded, setExpanded] = React.useState(false);

        return (
          <JetpackHost matchContents>
            <JetpackRNHostView matchContents>
              <View>{React.cloneElement(props.trigger, { onPress: () => setExpanded(true) })}</View>
            </JetpackRNHostView>
            <JetpackDropdownMenuPopup
              expanded={expanded}
              onDismissRequest={() => setExpanded(false)}
            >
              {expanded && (
                <JetpackDropdownMenuItems {...props} onClose={() => setExpanded(false)} />
              )}
            </JetpackDropdownMenuPopup>
          </JetpackHost>
        );
      };

export { DropdownMenu, type DropdownMenuItem };
