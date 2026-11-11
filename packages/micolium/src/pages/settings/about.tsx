import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { ScrollView, View } from 'react-native';

import Gayness from '@/assets/gayness.svg';
import Logo from '@/assets/images/icon.png';
import { List } from '@/components/ui/list';
import { useClient } from '@/contexts/current-account-context';
import { toast } from '@/utils/toast';
import { openUrl } from '@/utils/url';

import pkg from '../../../package.json';
import { EXTRA_GAYNESS_MODE } from '../login';

import type { SettingsStackParams } from '@/router/router';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const messages = defineMessages({
  versionLabel: { id: 'about.version.label', defaultMessage: 'Version' },
  licenseLabel: { id: 'about.license.label', defaultMessage: 'License' },
  licenseDescription: { id: 'about.license.agpl', defaultMessage: 'AGPL 3.0 or later' },
  developerLabel: { id: 'about.developer.label', defaultMessage: 'Developed by' },
  artistLabel: { id: 'about.artist.label', defaultMessage: 'Logo by' },
  sourceCodeLabel: { id: 'navigation.source_code', defaultMessage: 'Source code' },
  lookupFail: { id: 'about.lookup_fail', defaultMessage: 'Failed to lookup the account @{acct}' },
});

const AboutScreen = (_: NativeStackScreenProps<SettingsStackParams, 'about'>) => {
  const client = useClient();
  const intl = useIntl();
  const navigation = useNavigation();

  const navigateToAccount = (acct: string) => {
    client.accounts
      .lookupAccount(acct)
      .then((account) => {
        navigation.navigate('accounts', {
          screen: 'view',
          params: { id: account.id },
        });
      })
      .catch(() => {
        toast(intl.formatMessage(messages.lookupFail, { acct: acct }));
      });
  };

  return (
    <>
      <Gayness
        height={520}
        width={340}
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          opacity: EXTRA_GAYNESS_MODE ? 1 : 0.4,
        }}
        aria-hidden
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingVertical: 12,
        }}
      >
        <View style={{ alignItems: 'center' }}>
          <Image source={Logo} accessibilityLabel='Micolium' style={{ height: 80, width: 80 }} />
        </View>
        <List
          sections={[
            {
              items: [
                {
                  type: 'text',
                  label: intl.formatMessage(messages.versionLabel),
                  sublabel: pkg.version,
                },
                {
                  type: 'text',
                  label: intl.formatMessage(messages.licenseLabel),
                  sublabel: intl.formatMessage(messages.licenseDescription),
                },
                {
                  type: 'text',
                  label: intl.formatMessage(messages.sourceCodeLabel),
                  sublabel: pkg.repository.url,
                  onPress: () => openUrl(pkg.repository.url),
                },
              ],
            },
            {
              items: [
                {
                  type: 'text',
                  label: intl.formatMessage(messages.developerLabel),
                  sublabel: '@mkljczk@twojstary.gay',
                  onPress: () => navigateToAccount('mkljczk@twojstary.gay'),
                },
                {
                  type: 'text',
                  label: intl.formatMessage(messages.artistLabel),
                  sublabel: '@w@awawa.cat',
                  onPress: () => navigateToAccount('w@awawa.cat'),
                },
              ],
            },
          ]}
        />
      </ScrollView>
    </>
  );
};

export { AboutScreen };
