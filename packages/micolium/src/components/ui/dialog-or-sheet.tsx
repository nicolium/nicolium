import { Button as SwiftUIButton, Host, HStack } from '@expo/ui/swift-ui';
import { disabled } from '@expo/ui/swift-ui/modifiers';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { Button, Dialog as PaperDialog, Text, useTheme } from '@mkljczk/react-native-paper';
import { GlassView } from 'expo-glass-effect';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import React from 'react';
import { Platform, Pressable, ScrollView, useColorScheme, View } from 'react-native';

import { useEnableLiquidGlass } from '@/hooks/use-enable-liquid-glass';

type DialogOrSheetAction = {
  icon?: SFSymbol;
  label: string;
  onPress: () => void;
  destructive?: boolean;
  confirm?: boolean;
  disabled?: boolean;
  loading?: boolean;
};

const GlassButton: React.FC<DialogOrSheetAction> = ({
  icon,
  label,
  onPress,
  confirm,
  disabled,
}) => {
  const colorScheme = useColorScheme();
  const { colors } = useTheme();

  if (!icon) return null;

  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityLabel={label}>
      <GlassView
        glassEffectStyle='regular'
        isInteractive
        tintColor={
          // found the color values online, wouldn't surprise me if hallucinated? lol
          confirm && !disabled ? (colorScheme === 'dark' ? '#0A84FF' : '#007AFF') : undefined
        }
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <SymbolView
          name={icon}
          size={22}
          weight='semibold'
          tintColor={confirm && !disabled ? 'white' : colors.onSurfaceVariant}
        />
      </GlassView>
    </Pressable>
  );
};

interface IDialogOrSheet {
  children: React.ReactNode;
  title: React.JSX.Element;
  actions: Array<DialogOrSheetAction>;
  visible: boolean;
  handleDismiss?: () => void;
}

const Sheet: React.FC<IDialogOrSheet> = ({ children, title, actions, visible, handleDismiss }) => {
  const { colors } = useTheme();
  const glassEffect = useEnableLiquidGlass();

  const bottomSheetRef = React.useRef<TrueSheet>(null);
  const scrollableRef = React.useRef<ScrollView>(null);

  React.useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

  const [firstAction, secondAction] = actions.filter(({ icon }) => icon);
  const remainingActions = actions.filter(({ icon }) => !icon);

  return (
    <TrueSheet
      ref={bottomSheetRef}
      detents={['auto']}
      onDidDismiss={handleDismiss}
      scrollableRef={scrollableRef}
      style={{ flex: 1, padding: 16, paddingBottom: 0 }}
      backgroundColor={glassEffect ? undefined : colors.surfaceContainer}
      header={
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 8,
          }}
        >
          {firstAction && (
            <GlassButton
              icon={firstAction.icon}
              label={firstAction.label}
              onPress={firstAction.onPress}
              confirm={firstAction.confirm}
              disabled={firstAction.disabled}
            />
          )}
          <Text variant='titleMedium'>{title}</Text>
          {secondAction && (
            <GlassButton
              icon={secondAction.icon}
              label={secondAction.label}
              onPress={secondAction.onPress}
              confirm={secondAction.confirm}
              disabled={secondAction.disabled}
            />
          )}
        </View>
      }
      footer={
        remainingActions.length ? (
          <Host style={{ marginTop: 8, alignSelf: 'center', marginHorizontal: 16 }} matchContents>
            <HStack spacing={8}>
              {remainingActions.map((action, i) => (
                <SwiftUIButton
                  key={i}
                  label={action.label}
                  onPress={action.onPress}
                  modifiers={action.disabled ? [disabled()] : []}
                  role={action.destructive ? 'destructive' : 'default'}
                />
              ))}
            </HStack>
          </Host>
        ) : undefined
      }
    >
      <ScrollView ref={scrollableRef}>{children}</ScrollView>
    </TrueSheet>
  );
};

const Dialog: React.FC<IDialogOrSheet> = ({ children, title, actions, visible, handleDismiss }) => {
  const { colors } = useTheme();

  return (
    <PaperDialog visible={visible} onDismiss={handleDismiss}>
      <PaperDialog.Title>{title}</PaperDialog.Title>
      <PaperDialog.ScrollArea>
        <ScrollView>{children}</ScrollView>
      </PaperDialog.ScrollArea>
      {actions.length > 0 && (
        <PaperDialog.Actions>
          {actions.map((action, i) => (
            <React.Fragment key={i}>
              <Button
                onPress={action.onPress}
                loading={action.loading}
                disabled={action.disabled}
                textColor={action.destructive ? colors.error : undefined}
              >
                {action.label}
              </Button>
              {i === 0 && <View style={{ flex: 1 }} />}
            </React.Fragment>
          ))}
        </PaperDialog.Actions>
      )}
    </PaperDialog>
  );
};

const DialogOrSheet: React.FC<IDialogOrSheet> = (props) => {
  const glassEffect = useEnableLiquidGlass();

  if (glassEffect) return <Sheet {...props} />;
  return <Dialog {...props} />;
};

export { DialogOrSheet, GlassButton };
