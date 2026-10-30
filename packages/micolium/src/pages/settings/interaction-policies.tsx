import { create } from 'mutative';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { View } from 'react-native';
import { TabView } from 'react-native-tab-view';
import { toast } from 'sonner-native';

import {
  InteractionPolicyConfig,
  type Policy,
  type QuoteApprovalPolicy,
  type Rule,
  type Scope,
  type Visibility,
} from '@/components/interaction-policy-config';
import { GlassButton } from '@/components/ui/glass-button';
import { TabBar } from '@/components/ui/tab-bar';
import { useClient, useFeatures } from '@/contexts/current-account-context';
import { useUpdateCredentials } from '@/queries/accounts/use-account-credentials';
import { useInteractionPolicies } from '@/queries/settings/use-interaction-policies';

import type { SettingsStackParams } from '@/router/router';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const VISIBILITIES = ['public', 'unlisted', 'private'] as const;

const messages = defineMessages({
  public: { id: 'interaction_policies.tabs.public', defaultMessage: 'Public' },
  unlisted: { id: 'interaction_policies.tabs.unlisted', defaultMessage: 'Unlisted' },
  private: { id: 'interaction_policies.tabs.private', defaultMessage: 'Followers-only' },
  success: { id: 'interaction_policies.success', defaultMessage: 'Updated interaction policies' },
  fail: {
    id: 'interaction_policies.fail',
    defaultMessage: 'Failed to update interaction policies',
  },
});

const InteractionPoliciesScreen = (
  _: NativeStackScreenProps<SettingsStackParams, 'interaction_policies'>,
) => {
  const intl = useIntl();
  const client = useClient();
  const features = useFeatures();
  const { mutateAsync: updateCredentials } = useUpdateCredentials();

  const {
    interactionPolicies: initial,
    updateInteractionPolicies,
    isUpdating,
  } = useInteractionPolicies();

  const [quotePolicy, setQuotePolicy] = React.useState<QuoteApprovalPolicy>('public');
  const [interactionPolicies, setInteractionPolicies] = React.useState(initial);
  const [visibility, setVisibility] = React.useState<Visibility>('public');

  React.useEffect(() => {
    setInteractionPolicies(initial);
  }, [initial]);

  React.useEffect(() => {
    client.settings
      .verifyCredentials()
      .then((credentialAccount) => {
        setQuotePolicy(credentialAccount.source?.quote_policy ?? 'public');
      })
      .catch(() => {});
  }, []);

  const handleChange = (
    visibility: Visibility,
    policy: Policy,
    rule: Rule,
    value: Array<Scope>,
  ) => {
    setInteractionPolicies((policies) =>
      create(policies, (draft) => {
        draft[visibility][policy][rule] = value;
        draft[visibility][policy][
          rule === 'automatic_approval' ? 'manual_approval' : 'automatic_approval'
        ] = draft[visibility][policy][
          rule === 'automatic_approval' ? 'manual_approval' : 'automatic_approval'
        ].filter((rule) => !value.includes(rule as any));
      }),
    );
  };

  const handleSubmit = () => {
    const promises = [];

    if (features.interactionRequests) {
      promises.push(
        new Promise<void>((resolve, reject) => {
          updateInteractionPolicies(interactionPolicies, {
            onSuccess: () => resolve(),
            onError: () => reject(),
          });
        }),
      );
    }

    if (features.quoteApprovalPolicies && !features.interactionRequests) {
      promises.push(updateCredentials({ source: { quote_policy: quotePolicy } }));
    }

    Promise.all(promises)
      .then(() => {
        toast.success(intl.formatMessage(messages.success));
      })
      .catch(() => {
        toast.error(intl.formatMessage(messages.fail));
      });
  };

  const routes: Array<{
    key: Visibility;
    title: string;
  }> = [
    { key: 'public', title: intl.formatMessage(messages.private) },
    { key: 'unlisted', title: intl.formatMessage(messages.unlisted) },
    { key: 'private', title: intl.formatMessage(messages.private) },
  ];

  return (
    <TabView
      navigationState={{ index: VISIBILITIES.indexOf(visibility), routes }}
      onIndexChange={(index) => setVisibility(VISIBILITIES[index])}
      renderScene={({ route }) => (
        <>
          <InteractionPolicyConfig
            interactionPolicy={interactionPolicies[route.key]}
            onChange={(...props) => {
              handleChange(route.key, ...props);
            }}
            quotePolicy={quotePolicy}
            onQuotePolicyChange={setQuotePolicy}
            visibility={route.key}
            disabled={isUpdating}
          />

          <View style={{ flexDirection: 'row', gap: 8, padding: 16 }}>
            <GlassButton
              mode='contained'
              onPress={handleSubmit}
              disabled={isUpdating}
              loading={isUpdating}
              containerStyle={{ marginLeft: 'auto' }}
              style={{ marginLeft: 'auto' }}
            >
              <FormattedMessage id='common.save' defaultMessage='Save' />
            </GlassButton>
          </View>
        </>
      )}
      renderTabBar={TabBar}
      lazy
    />
  );
};

export { InteractionPoliciesScreen };
