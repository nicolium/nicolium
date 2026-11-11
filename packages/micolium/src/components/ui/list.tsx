import {
  ColorPicker as SwiftUIColorPicker,
  Host as SwiftUIHost,
  Toggle as SwiftUIToggle,
} from '@expo/ui/swift-ui';
import { labelsHidden } from '@expo/ui/swift-ui/modifiers';
import { Icon, List as PaperList, Switch, Text, useTheme } from '@mkljczk/react-native-paper';
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight';
import { CaretUpDownIcon } from 'phosphor-react-native/src/icons/CaretUpDown';
import React from 'react';
import { useIntl } from 'react-intl';
import { Pressable, type StyleProp, View, type ViewStyle } from 'react-native';

import { iconHelper } from '@/components/ui/icon';
import { useEnableLiquidGlass } from '@/hooks/use-enable-liquid-glass';
import { getSegmentedMenuStyles } from '@/utils/themes';

import { DateTimePicker } from './date-time-picker';
import { DropdownMenu } from './dropdown-menu';

import type { Icon as PhosphorIcon } from 'phosphor-react-native';

interface ISelectItem<T> {
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
          type: 'button';
          onPress: () => void;
          label: string;
          sublabel?: string;
          role?: 'destructive';
          icon?: PhosphorIcon;
        }
      | {
          type: 'toggle';
          active: boolean;
          onPress: () => void;
          label: string;
          sublabel?: string;
          disabled?: boolean;
        }
      | {
          type: 'color-picker';
          value: string;
          onChange: (color: string) => void;
          label: string;
          sublabel?: string;
          disabled?: boolean;
        }
      | {
          type: 'date-picker';
          value: Date;
          onChange: (date: Date) => void;
          label: string;
          sublabel?: string;
          // disabled?: boolean;
          withTime?: boolean;
          rangeStart?: Date;
          rangeEnd?: Date;
        }
      | {
          type: 'text';
          onPress?: () => void;
          label: string;
          sublabel?: string;
          disabled?: boolean;
        }
      | ISelectItem<any>
    >;
  }>;
  style?: StyleProp<ViewStyle>;
}

type IListSections = IList['sections'];

const List: React.FC<IList> = ({ sections, style }) => {
  const glassEffect = useEnableLiquidGlass();
  const theme = useTheme();
  const intl = useIntl();

  if (!sections.length) return null;

  return sections.map((section, index) => (
    <PaperList.Section
      key={index}
      style={[index === 0 && !section.subheader ? { marginTop: 16 } : undefined, style]}
    >
      {section.subheader && <PaperList.Subheader>{section.subheader}</PaperList.Subheader>}
      <View style={{ gap: 2 }}>
        {section.items.map((item, index) => {
          const styles = [
            getSegmentedMenuStyles(theme, false, index, section.items.length),
            { marginHorizontal: 16 },
          ];

          switch (item.type) {
            case 'button': {
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
                            icon={(props) => (
                              <Icon
                                {...props}
                                color={theme.colors.onPrimaryFixed}
                                strokeWidth={1.75}
                              />
                            )}
                            style={{
                              ...props.style,
                              backgroundColor: theme.colors.inversePrimary,
                              padding: 8,
                              borderRadius: 24,
                            }}
                          />
                        )
                      : undefined
                  }
                  titleStyle={
                    item.role === 'destructive' ? { color: theme.colors.error } : undefined
                  }
                  titleNumberOfLines={0}
                  descriptionNumberOfLines={0}
                />
              );
            }
            case 'toggle':
              return (
                <PaperList.Item
                  key={index}
                  title={item.label}
                  description={item.sublabel}
                  style={styles}
                  onPress={item.onPress}
                  disabled={item.disabled}
                  titleNumberOfLines={0}
                  descriptionNumberOfLines={0}
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
            case 'select':
              return (
                <DropdownMenu
                  key={index}
                  fullWidth
                  trigger={
                    <PaperList.Item
                      title={item.label}
                      description={item.sublabel}
                      style={styles}
                      right={() => (
                        <View style={{ gap: 2, alignItems: 'center', flexDirection: 'row' }}>
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
                          <Icon source={CaretUpDownIcon} size={16} />
                        </View>
                      )}
                      containerStyle={{ alignItems: 'center' }}
                      onPress={() => {}}
                      titleNumberOfLines={0}
                      descriptionNumberOfLines={0}
                    />
                  }
                  items={[
                    {
                      key: 'options',
                      type: 'section',
                      label: item.label,
                      children: item.options.map((option) => ({
                        key: option.value.toString(),
                        type: 'button',
                        label: option.label,
                        checked: Array.isArray(item.active)
                          ? item.active.includes(option.value)
                          : option.value === item.active,
                        onPress: () => item.onChange(option.value),
                      })),
                    },
                  ]}
                />
              );
            case 'color-picker':
              return (
                <PaperList.Item
                  key={index}
                  title={item.label}
                  description={item.sublabel}
                  style={styles}
                  disabled={item.disabled}
                  titleNumberOfLines={0}
                  descriptionNumberOfLines={0}
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
            case 'date-picker':
              return (
                <DateTimePicker
                  key={index}
                  title={item.label}
                  description={item.sublabel}
                  listItemStyle={styles}
                  initialDate={item.value}
                  onSelect={item.onChange}
                  withTime={item.withTime}
                  rangeStart={item.rangeStart}
                  rangeEnd={item.rangeEnd}
                />
              );
            case 'text':
              return (
                <PaperList.Item
                  key={index}
                  title={item.label}
                  description={item.sublabel}
                  style={styles}
                  disabled={item.disabled}
                  titleNumberOfLines={0}
                  descriptionNumberOfLines={0}
                  right={
                    item.onPress
                      ? (props) => <PaperList.Icon icon={iconHelper(CaretRightIcon)} {...props} />
                      : undefined
                  }
                  onPress={item.onPress}
                  containerStyle={{ gap: 4, alignItems: 'center' }}
                />
              );
            default:
              console.error(`Unimplemented item type: ${item}`);
              return null;
          }
        })}
      </View>
    </PaperList.Section>
  ));
};

export { List, type IList, type IListSections };
