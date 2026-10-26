import { Host as SwiftUIHost, Toggle as SwiftUIToggle } from '@expo/ui/swift-ui';
import { labelsHidden } from '@expo/ui/swift-ui/modifiers';
import { List as PaperList, Switch, Text, useTheme } from '@mkljczk/react-native-paper';
import { create } from 'mutative';
import React from 'react';
import { Pressable, type StyleProp, View, type ViewStyle } from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu';

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
      | ISelectItem<any>
    >;
  }>;
  style?: StyleProp<ViewStyle>;
}

const List: React.FC<IList> = ({ sections, style }) => {
  const glassEffect = useEnableLiquidGlass();
  const theme = useTheme();

  const filteredSections = React.useMemo(
    () =>
      create(sections, (draft) => {
        for (const section of draft) {
          section.items = section.items.filter(({ enabled }) => enabled !== false);
        }
      }),
    [sections],
  );

  // if (glassEffect)
  //   return (
  //     <SwiftUIList style={{ marginHorizontal: 0 }}>
  //       {sections.map((section, index) => (
  //         <SwiftUISection title={section.heading} key={section.heading || index}>
  //           {section.items.map(
  //             (item, index) =>
  //               item.type === 'button' && (
  //                 <SwiftUIButton
  //                   key={index}
  //                   modifiers={item.role !== 'destructive' ? [buttonStyle('plain')] : undefined}
  //                   role={item.role === 'destructive' ? 'destructive' : 'default'}
  //                   onPress={item.onPress}
  //                 >
  //                   {item.sublabel ? (
  //                     <>
  //                       <SwiftUIText>{item.label}</SwiftUIText>
  //                       <SwiftUIText>{item.sublabel}</SwiftUIText>
  //                     </>
  //                   ) : (
  //                     <SwiftUIText>{item.label}</SwiftUIText>
  //                   )}
  //                 </SwiftUIButton>
  //               ),
  //           )}
  //         </SwiftUISection>
  //       ))}
  //     </SwiftUIList>
  //   );

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
                onPress={item.onPress}
                left={
                  Icon
                    ? (props) => (
                        <PaperList.Icon
                          {...props}
                          color={item.role === 'destructive' ? theme.colors.error : undefined}
                          icon={(props) => <Icon {...props} />}
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
                          label=''
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
          } else {
            return (
              <DropdownMenu.Root key={index}>
                <DropdownMenu.Trigger>
                  <PaperList.Item
                    title={item.label}
                    description={item.sublabel}
                    style={styles}
                    right={() => (
                      <Text>
                        {item.options.find((option) => option.value === item.active)?.label}
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
          }
        })}
      </View>
    </PaperList.Section>
  ));
};

export { List, type IList };
