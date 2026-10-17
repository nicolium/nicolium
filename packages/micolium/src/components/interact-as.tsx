import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { ActivityIndicator, Divider, Text, useTheme } from '@mkljczk/react-native-paper';
import React, { useEffect, useRef, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Platform, ScrollView, View } from 'react-native';

import { CurrentAccountProvider } from '@/contexts/current-account-context';
import { useEnableLiquidGlass } from '@/hooks/use-enable-liquid-glass';
import { useCredentialAccountId } from '@/queries/accounts/use-account-credentials';
import { useStatus } from '@/queries/statuses/use-status';
import { useAuthStore } from '@/stores/auth';
import { useInteractAs, useUiStoreActions } from '@/stores/ui';
import { resolveStatus } from '@/utils/resolve';

import { Account } from './accounts/account';
import { Status } from './statuses/status';
import { StatusActions } from './statuses/status-actions';

const messages = defineMessages({
  title: { id: 'interact_as_modal.title', defaultMessage: 'Interact from other accounts' },
  unavailable: {
    id: 'interact_as_modal.unavailable',
    defaultMessage: 'This post could not be found from this account.',
  },
});

interface IInteractAsAccount {
  scope: string;
  statusId: string;
  sourceScope: string;
}

const InteractAsAccount: React.FC<IInteractAsAccount> = ({ scope, statusId, sourceScope }) => {
  const intl = useIntl();
  const { colors } = useTheme();
  const { data: accountId } = useCredentialAccountId();

  const [resolvedId, setResolvedId] = useState<string | null | undefined>(undefined);

  const { data: status } = useStatus(resolvedId || undefined);

  useEffect(() => {
    resolveStatus(statusId, sourceScope, scope)
      .then((id) => setResolvedId(id ?? null))
      .catch(() => setResolvedId(null));
  }, [statusId, sourceScope, scope]);

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 8, gap: 4 }}>
      {accountId ? <Account id={accountId} displayFqn /> : <ActivityIndicator />}
      {resolvedId === undefined || (!status && resolvedId !== null) ? (
        <ActivityIndicator style={{ alignSelf: 'flex-start', margin: 8 }} />
      ) : resolvedId === null || !status ? (
        <Text variant='bodyMedium' style={{ color: colors.onSurfaceVariant }}>
          {intl.formatMessage(messages.unavailable)}
        </Text>
      ) : (
        <StatusActions status={status} fromInteractAs />
      )}
    </View>
  );
};

const InteractAsSheet: React.FC = () => {
  const intl = useIntl();
  const { colors } = useTheme();
  const glassEffect = useEnableLiquidGlass();
  const interactAs = useInteractAs();
  const { closeInteractAs } = useUiStoreActions();
  const sessions = useAuthStore((state) => state.sessions);

  const sheetRef = useRef<TrueSheet>(null);
  const scrollableRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (interactAs) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [interactAs]);

  const scopes = Object.keys(sessions).filter((scope) => scope !== interactAs?.sourceScope);

  return (
    <TrueSheet
      ref={sheetRef}
      detents={['auto']}
      scrollableRef={scrollableRef}
      onDidDismiss={closeInteractAs}
      style={{ paddingTop: Platform.OS === 'ios' ? 16 : 32 }}
      backgroundColor={glassEffect ? undefined : colors.surfaceContainer}
    >
      {interactAs && (
        <ScrollView ref={scrollableRef}>
          <Text
            variant='headlineSmallEmphasized'
            style={{ color: colors.onSurfaceVariant, marginHorizontal: 16 }}
          >
            {intl.formatMessage(messages.title)}
          </Text>
          <Status id={interactAs.statusId} compact withActions={false} textOnly />
          <Divider />
          {scopes.length ? (
            scopes.map((scope) => (
              <CurrentAccountProvider key={scope} value={scope}>
                <InteractAsAccount
                  scope={scope}
                  statusId={interactAs.statusId}
                  sourceScope={interactAs.sourceScope}
                />
              </CurrentAccountProvider>
            ))
          ) : (
            <Text variant='bodyMedium' style={{ margin: 16, marginBottom: 0 }}>
              <FormattedMessage
                id='interact_as_modal.no_accounts'
                defaultMessage='You are not logged in to any other accounts.'
              />
            </Text>
          )}
        </ScrollView>
      )}
    </TrueSheet>
  );
};

export { InteractAsSheet };
