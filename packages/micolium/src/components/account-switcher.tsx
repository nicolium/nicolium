import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { ActivityIndicator, Badge, Button, List, useTheme } from '@mkljczk/react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { PlusIcon } from 'phosphor-react-native/src/icons/Plus';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Platform, ScrollView, View } from 'react-native';

import { CurrentAccountProvider, useCurrentAccount } from '@/contexts/current-account-context';
import { useEnableLiquidGlass } from '@/hooks/use-enable-liquid-glass';
import { useCredentialAccountId } from '@/queries/accounts/use-account-credentials';
import { useNotificationsUnreadCount } from '@/queries/notifications/use-notifications';
import { useAuthStore, useAuthStoreActions } from '@/stores/auth';
import { useIsAccountSwitcherOpen, useUiStoreActions } from '@/stores/ui';
import { getSegmentedMenuStyles } from '@/utils/themes';

import { Account } from './accounts/account';
import { iconHelper } from './ui/icon';

const CurrentAccount = () => {
  const { data: currentAccountId } = useCredentialAccountId();
  const unreadCount = useNotificationsUnreadCount();

  if (!currentAccountId) return <ActivityIndicator style={{ marginVertical: 10 }} />;

  return (
    <Account
      id={currentAccountId}
      badge={unreadCount > 0 ? <Badge>{unreadCount}</Badge> : undefined}
      displayFqn
    />
  );
};

const AccountSwitcher = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const currentAccount = useCurrentAccount();
  const accounts = useAuthStore((state) => state.sessions);
  const { toggleAccount } = useAuthStoreActions();
  const { closeAccountSwitcher } = useUiStoreActions();

  return (
    <ScrollView>
      <View style={{ gap: 2, marginHorizontal: 16, marginTop: 16 }}>
        {Object.keys(accounts).map((accountId, index, array) => {
          const onChange = () => {
            if (toggleAccount(accountId)) {
              navigation.reset({
                index: 0,
                routes: [{ name: 'app' }],
              });
            }
            closeAccountSwitcher();
          };

          return (
            <CurrentAccountProvider key={accountId} value={accountId}>
              <List.Item
                title={CurrentAccount}
                onPress={onChange}
                style={getSegmentedMenuStyles(
                  theme,
                  currentAccount === accountId,
                  index,
                  array.length,
                )}
              />
            </CurrentAccountProvider>
          );
        })}
        <Button
          style={{ margin: 'auto', marginTop: 8 }}
          icon={iconHelper(PlusIcon)}
          onPress={() => {
            navigation.navigate('login');
            closeAccountSwitcher();
          }}
        >
          <FormattedMessage id='account_swithcer.add_account' defaultMessage='Add account' />
        </Button>
      </View>
    </ScrollView>
  );
};

const AccountSwitcherBottomSheet = () => {
  const glassEffect = useEnableLiquidGlass();
  const { colors } = useTheme();

  const isAccountSwitcherOpen = useIsAccountSwitcherOpen();
  const { closeAccountSwitcher } = useUiStoreActions();

  const bottomSheetRef = React.useRef<TrueSheet>(null);

  React.useEffect(() => {
    if (isAccountSwitcherOpen) {
      bottomSheetRef.current?.present();
    } else if (bottomSheetRef.current) {
      bottomSheetRef.current?.dismiss();
    }
  }, [isAccountSwitcherOpen]);

  return (
    <TrueSheet
      ref={bottomSheetRef}
      detents={['auto']}
      onDidDismiss={() => closeAccountSwitcher()}
      style={{ paddingTop: Platform.OS === 'ios' ? 16 : 32 }}
      backgroundColor={glassEffect ? undefined : colors.surfaceContainer}
    >
      <AccountSwitcher />
    </TrueSheet>
  );
};

export { AccountSwitcher, AccountSwitcherBottomSheet };
