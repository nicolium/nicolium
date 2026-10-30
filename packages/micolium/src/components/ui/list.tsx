import {
  ColorPicker as SwiftUIColorPicker,
  Host as SwiftUIHost,
  Toggle as SwiftUIToggle,
} from '@expo/ui/swift-ui';
import { labelsHidden } from '@expo/ui/swift-ui/modifiers';
import { List as PaperList, Switch, Text, useTheme } from '@mkljczk/react-native-paper';
import { create } from 'mutative';
import React from 'react';
import { useIntl } from 'react-intl';
import { Pressable, type StyleProp, View, type ViewStyle } from 'react-native';

import DropdownMenu from '@/components/ui/dropdown-menu';
import { iconHelper } from '@/components/ui/icon';
import { useEnableLiquidGlass } from '@/hooks/use-enable-liquid-glass';
import { getSegmentedMenuStyles } from '@/utils/themes';

import type { Icon as PhosphorIcon } from 'phosphor-react-native';

interface ISelectItem<T> {
  enabled?: boolean;
  type: 'select';
  active: T | Array<T>;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
  label: string;
  sublabel?: string;
  disabled?: boolean;
}

interface IList {
  sections: Array<{
    subheader?: string;
    items: Array<
      | {
          enabled?: boolean;
          type: 'button';
          onPress: () => void;
          label: string;
          sublabel?: string;
          role?: 'destructive';
          icon?: PhosphorIcon;
        }
      | {
          enabled?: boolean;
          type: 'toggle';
          active: boolean;
          onPress: () => void;
          label: string;
          sublabel?: string;
          disabled?: boolean;
        }
      | {
          enabled?: boolean;
          type: 'color-picker';
          value: string;
          onChange: (color: string) => void;
          label: string;
          sublabel?: string;
          disabled?: boolean;
        }
      | ISelectItem<any>
    >;
  }>;
  style?: StyleProp<ViewStyle>;
}

const List: React.FC<IList> = ({ sections, style }) => {
  const glassEffect = useEnableLiquidGlass();
  const theme = useTheme();
  const intl = useIntl();

  const filteredSections = React.useMemo(
    () =>
      create(sections, (draft) => {
        for (const section of draft) {
          section.items = section.items.filter(({ enabled }) => enabled !== false);
        }
      }),
    [sections],
  );

  return filteredSections.map((section, index) => (
    <PaperList.Section
      key={index}
      style={[index === 0 && !section.subheader ? { marginTop: 16 } : undefined, style]}
    >
      {section.subheader && <PaperList.Subheader>{section.subheader}</PaperList.Subheader>}
      <View style={{ gap: 2 }}>
        {section.items.map((item, index) => {
          if (item.enabled === false) return null;

          const styles = [
            getSegmentedMenuStyles(theme, false, index, section.items.length),
            { marginHorizontal: 16 },
          ];

          if (item.type === 'button') {
            const Icon = item.icon ? iconHelper(item.icon!) : undefined;

            return (
              <PaperList.Item
                key={index}
                title={item.label}
                description={item.sublabel}
                style={styles}
                containerStyle={{ marginLeft: Icon ? -8 : undefined }}
                onPress={item.onPress}
                left={
                  Icon
                    ? (props) => (
                        <PaperList.Icon
                          {...props}
                          icon={(props) => <Icon {...props} color={theme.colors.onPrimaryFixed} />}
                          style={{
                            ...props.style,
                            backgroundColor: theme.colors.primaryFixedDim,
                            padding: 8,
                            borderRadius: 24,
                          }}
                        />
                      )
                    : undefined
                }
                titleStyle={item.role === 'destructive' ? { color: theme.colors.error } : undefined}
              />
            );
          } else if (item.type === 'toggle') {
            return (
              <PaperList.Item
                key={index}
                title={item.label}
                description={item.sublabel}
                style={styles}
                onPress={item.onPress}
                disabled={item.disabled}
                titleNumberOfLines={0}
                right={() =>
                  glassEffect ? (
                    <Pressable onPress={() => {}}>
                      <SwiftUIHost matchContents style={{ width: 64 }}>
                        <SwiftUIToggle
                          isOn={item.active}
                          onIsOnChange={item.onPress}
                          label={item.label}
                          modifiers={[labelsHidden()]}
                        />
                      </SwiftUIHost>
                    </Pressable>
                  ) : (
                    <Switch
                      value={item.active}
                      onValueChange={item.onPress}
                      disabled={item.disabled}
                    />
                  )
                }
                containerStyle={{ gap: 4, alignItems: 'center' }}
              />
            );
          } else if (item.type === 'select') {
            return (
              <DropdownMenu.Root key={index}>
                <DropdownMenu.Trigger>
                  <PaperList.Item
                    title={item.label}
                    description={item.sublabel}
                    style={styles}
                    right={() => (
                      <Text>
                        {Array.isArray(item.active)
                          ? intl.formatList(
                              item.options
                                .filter((option) => item.active.includes(option.value))
                                .map((option) => option.label),
                              { type: 'conjunction' },
                            )
                          : item.options.find((option) => option.value === item.active)?.label}
                      </Text>
                    )}
                    containerStyle={{ alignItems: 'center' }}
                  />
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  <DropdownMenu.Label>{item.label}</DropdownMenu.Label>
                  {item.options.map((option) => (
                    <DropdownMenu.CheckboxItem
                      key={option.value.toString()}
                      value={
                        Array.isArray(item.active)
                          ? item.active.includes(option.value)
                          : option.value === item.active
                      }
                      onSelect={() => item.onChange(option.value)}
                    >
                      <DropdownMenu.ItemTitle>{option.label}</DropdownMenu.ItemTitle>
                    </DropdownMenu.CheckboxItem>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            );
          } else {
            return (
              <PaperList.Item
                key={index}
                title={item.label}
                description={item.sublabel}
                style={styles}
                disabled={item.disabled}
                titleNumberOfLines={0}
                right={() => (
                  <SwiftUIHost matchContents>
                    <SwiftUIColorPicker
                      selection={item.value}
                      onSelectionChange={item.onChange}
                      supportsOpacity={false}
                    />
                  </SwiftUIHost>
                )}
                containerStyle={{ gap: 4, alignItems: 'center' }}
              />
            );
          }
        })}
      </View>
    </PaperList.Section>
  ));
};

export { List, type IList };
