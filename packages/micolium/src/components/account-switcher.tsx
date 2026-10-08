import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { ActivityIndicator, List, RadioButton, useTheme } from '@mkljczk/react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { PlusIcon } from 'phosphor-react-native';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CurrentAccountProvider, useCurrentAccount } from '@/contexts/current-account-context';
import { useCredentialAccountId } from '@/queries/accounts/use-account-credentials';
import { useAuthStore, useAuthStoreActions } from '@/stores/auth';
import { useIsAccountSwitcherOpen, useUiStoreActions } from '@/stores/ui';
import { BottomSheetBackdrop } from '@/utils/themes';

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
  const { colors } = useTheme();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const isAccountSwitcherOpen = useIsAccountSwitcherOpen();
  const { closeAccountSwitcher } = useUiStoreActions();

  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);

  React.useEffect(() => {
    if (isAccountSwitcherOpen) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.close();
    }
  }, [isAccountSwitcherOpen]);

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      onDismiss={() => closeAccountSwitcher()}
      backgroundStyle={{ backgroundColor: colors.surfaceContainer }}
      handleIndicatorStyle={{ backgroundColor: colors.onSurface }}
      backdropComponent={BottomSheetBackdrop}
    >
      <BottomSheetView style={{ paddingBottom: bottomInset }}>
        <AccountSwitcher />
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export { AccountSwitcher, AccountSwitcherBottomSheet };
