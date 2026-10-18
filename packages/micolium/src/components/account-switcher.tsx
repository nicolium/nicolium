import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { ActivityIndicator, List, RadioButton, useTheme } from '@mkljczk/react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { PlusIcon } from 'phosphor-react-native/src/icons/Plus';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Platform, ScrollView } from 'react-native';

import { CurrentAccountProvider, useCurrentAccount } from '@/contexts/current-account-context';
import { useEnableLiquidGlass } from '@/hooks/use-enable-liquid-glass';
import { useCredentialAccountId } from '@/queries/accounts/use-account-credentials';
import { useAuthStore, useAuthStoreActions } from '@/stores/auth';
import { useIsAccountSwitcherOpen, useUiStoreActions } from '@/stores/ui';

import { Account } from './accounts/account';

const CurrentAccount = () => {
  const { data: currentAccountId } = useCredentialAccountId();

  if (!currentAccountId) return <ActivityIndicator />;

  return <Account id={currentAccountId} displayFqn />;
};

const AccountSwitcher = () => {
  const navigation = useNavigation();
  const currentAccount = useCurrentAccount();
  const accounts = useAuthStore((state) => state.sessions);
  const { toggleAccount } = useAuthStoreActions();
  const { closeAccountSwitcher } = useUiStoreActions();

  return (
    <ScrollView>
      {Object.keys(accounts).map((accountId) => {
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
              right={() => (
                <RadioButton
                  status={currentAccount === accountId ? 'checked' : 'unchecked'}
                  onPress={onChange}
                  value={accountId}
                />
              )}
            />
          </CurrentAccountProvider>
        );
      })}
      <List.Item
        title={<FormattedMessage id='account_swithcer.add_account' defaultMessage='Add account' />}
        left={(props) => <List.Icon {...props} icon={PlusIcon} />}
        onPress={() => {
          navigation.navigate('login');
          closeAccountSwitcher();
        }}
      />
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
