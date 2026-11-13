import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { create } from 'mutative';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { View } from 'react-native';

import {
  InteractionPolicyConfig,
  type Policy,
  type QuoteApprovalPolicy,
  type Rule,
  type Scope,
  type Visibility,
} from '@/components/interaction-policy-config';
import { GlassButton } from '@/components/ui/glass-button';
import { useTabBarProps } from '@/components/ui/tab-bar';
import { useClient, useFeatures } from '@/contexts/current-account-context';
import { useUpdateCredentials } from '@/queries/accounts/use-account-credentials';
import { useInteractionPolicies } from '@/queries/settings/use-interaction-policies';
import { toast } from '@/utils/toast';

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

const InteractionPoliciesTabs = createMaterialTopTabNavigator<Record<Visibility, undefined>>();

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
  const tabBarProps = useTabBarProps();

  const [quotePolicy, setQuotePolicy] = React.useState<QuoteApprovalPolicy>('public');
  const [interactionPolicies, setInteractionPolicies] = React.useState(initial);

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

  return (
    <InteractionPoliciesTabs.Navigator {...tabBarProps}>
      {VISIBILITIES.map((visibility) => (
        <InteractionPoliciesTabs.Screen
          key={visibility}
          name={visibility}
          options={{ title: intl.formatMessage(messages[visibility]) }}
        >
          {() => (
            <>
              <InteractionPolicyConfig
                interactionPolicy={interactionPolicies[visibility]}
                onChange={(...props) => {
                  handleChange(visibility, ...props);
                }}
                quotePolicy={quotePolicy}
                onQuotePolicyChange={setQuotePolicy}
                visibility={visibility}
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
        </InteractionPoliciesTabs.Screen>
      ))}
    </InteractionPoliciesTabs.Navigator>
  );
};

export { InteractionPoliciesScreen };
