import { create } from 'mutative';
import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import List, { ListItem } from '@/components/list';
import Column from '@/components/ui/column';
import Form from '@/components/ui/form';
import { InlineMultiselect } from '@/components/ui/inline-multiselect';
import { SelectDropdown } from '@/components/ui/select-dropdown';
import Tabs from '@/components/ui/tabs';
import Warning from '@/features/compose/components/warning';
import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useInteractionPolicies } from '@/queries/settings/use-interaction-policies';
import { useAuthActions } from '@/stores/auth';
import toast from '@/toast';

import type { CreateStatusParams, InteractionPolicy } from 'pl-api';

type Visibility = 'public' | 'unlisted' | 'private';
type Policy = 'can_favourite' | 'can_reblog' | 'can_reply';
type Rule = 'automatic_approval' | 'manual_approval';
type Scope = 'followers' | 'following' | 'mentioned' | 'public';

type QuoteApprovalPolicy = CreateStatusParams['quote_approval_policy'];

const policies: Array<Policy> = ['can_favourite', 'can_reply', 'can_reblog'];

const messages = defineMessages({
  heading: { id: 'column.interaction_policies', defaultMessage: 'Interaction policies' },
  public: { id: 'interaction_policies.tabs.public', defaultMessage: 'Public' },
  unlisted: { id: 'interaction_policies.tabs.unlisted', defaultMessage: 'Unlisted' },
  private: { id: 'interaction_policies.tabs.private', defaultMessage: 'Followers-only' },
  success: { id: 'interaction_policies.success', defaultMessage: 'Updated interaction policies' },
  fail: {
    id: 'interaction_policies.fail',
    defaultMessage: 'Failed to update interaction policies',
  },
});

const scopeMessages = defineMessages({
  followers: { id: 'interaction_policies.entry.followers', defaultMessage: 'Followers' },
  following: { id: 'interaction_policies.entry.following', defaultMessage: 'People I follow' },
  mentioned: { id: 'interaction_policies.entry.mentioned', defaultMessage: 'Mentioned' },
  public: { id: 'interaction_policies.entry.public', defaultMessage: 'Everyone' },
  nobody: { id: 'interaction_policies.entry.nobody', defaultMessage: 'Nobody' },
});

const titleMessages = {
  public: defineMessages({
    can_favourite: {
      id: 'interaction_policies.title.public.can_favourite',
      defaultMessage: 'Who can like your public posts?',
    },
    can_reply: {
      id: 'interaction_policies.title.public.can_reply',
      defaultMessage: 'Who can reply to your public posts?',
    },
    can_reblog: {
      id: 'interaction_policies.title.public.can_reblog',
      defaultMessage: 'Who can repost your public posts?',
    },
    can_quote: {
      id: 'interaction_policies.title.public.can_quote',
      defaultMessage: 'Who can quote your posts?',
    },
  }),
  unlisted: defineMessages({
    can_favourite: {
      id: 'interaction_policies.title.unlisted.can_favourite',
      defaultMessage: 'Who can like your unlisted posts?',
    },
    can_reply: {
      id: 'interaction_policies.title.unlisted.can_reply',
      defaultMessage: 'Who can reply to your unlisted posts?',
    },
    can_reblog: {
      id: 'interaction_policies.title.unlisted.can_reblog',
      defaultMessage: 'Who can repost your unlisted posts?',
    },
    can_quote: {
      id: 'interaction_policies.title.public.can_quote',
      defaultMessage: 'Who can quote your posts?',
    },
  }),
  private: defineMessages({
    can_favourite: {
      id: 'interaction_policies.title.private.can_favourite',
      defaultMessage: 'Who can like your followers-only post?',
    },
    can_reply: {
      id: 'interaction_policies.title.private.can_reply',
      defaultMessage: 'Who can reply to your followers-only post?',
    },
    can_reblog: {
      id: 'interaction_policies.title.private.can_reblog',
      defaultMessage: 'Who can repost your followers-only post?',
    },
    can_quote: {
      id: 'interaction_policies.title.public.can_quote',
      defaultMessage: 'Who can quote your posts?',
    },
  }),
  single_post: defineMessages({
    can_favourite: {
      id: 'interaction_policies.title.single_post.can_favourite',
      defaultMessage: 'Who can like this post?',
    },
    can_reply: {
      id: 'interaction_policies.title.single_post.can_reply',
      defaultMessage: 'Who can reply to this post?',
    },
    can_reblog: {
      id: 'interaction_policies.title.single_post.can_reblog',
      defaultMessage: 'Who can repost this post?',
    },
    can_quote: {
      id: 'interaction_policies.title.single_post.can_quote',
      defaultMessage: 'Who can quote this post?',
    },
  }),
};

const options: Record<Visibility, Record<Policy, Array<Scope>>> = {
  public: {
    can_favourite: ['followers', 'following', 'mentioned', 'public'],
    can_reblog: ['followers', 'following', 'mentioned', 'public'],
    can_reply: ['followers', 'following', 'public'],
  },
  unlisted: {
    can_favourite: ['followers', 'following', 'mentioned', 'public'],
    can_reblog: ['followers', 'following', 'mentioned', 'public'],
    can_reply: ['followers', 'following', 'public'],
  },
  private: {
    can_favourite: ['followers'],
    can_reblog: [],
    can_reply: ['followers'],
  },
};

interface IInteractionPolicyConfig {
  interactionPolicy: InteractionPolicy;
  onChange: (policy: Policy, rule: Rule, value: Scope[]) => void;
  quotePolicy?: QuoteApprovalPolicy;
  onQuotePolicyChange?: (value: QuoteApprovalPolicy) => void;
  visibility: Visibility;
  singlePost?: boolean;
  disabled?: boolean;
}

const InteractionPolicyConfig: React.FC<IInteractionPolicyConfig> = ({
  interactionPolicy,
  quotePolicy,
  visibility,
  onChange,
  onQuotePolicyChange,
  singlePost,
  disabled,
}) => {
  const features = useFeatures();
  const intl = useIntl();

  const getItems = (policy: Policy) =>
    Object.fromEntries(
      options[visibility][policy].map((scope) => [scope, intl.formatMessage(scopeMessages[scope])]),
    ) as Record<Scope, string>;

  const handleChange = (policy: Policy, rule: Rule) => (value: Scope[]) => {
    onChange(policy, rule, value);
  };

  return (
    <>
      {features.interactionRequests &&
        policies.map((policy) => {
          const items = getItems(policy);

          if (!Object.keys(items).length) return null;

          return (
            <React.Fragment key={policy}>
              <h3 className='interaction-policy-config__title'>
                {intl.formatMessage(titleMessages[singlePost ? 'single_post' : visibility][policy])}
              </h3>

              {policy === 'can_reply' && (
                <Warning
                  message={
                    <FormattedMessage
                      id='interaction_policies.mentioned_warning'
                      defaultMessage='Mentioned users can always reply.'
                    />
                  }
                />
              )}

              <List>
                <ListItem
                  label={
                    <FormattedMessage
                      id='interaction_policies.rule.always'
                      defaultMessage='Always'
                    />
                  }
                >
                  <InlineMultiselect<Scope>
                    items={items}
                    value={interactionPolicy[policy].automatic_approval as Array<Scope>}
                    onChange={handleChange(policy, 'automatic_approval')}
                    disabled={disabled}
                  />
                </ListItem>
                <ListItem
                  label={
                    <FormattedMessage
                      id='interaction_policies.rule.with_approval'
                      defaultMessage='Require approval'
                    />
                  }
                >
                  <InlineMultiselect
                    items={items}
                    value={interactionPolicy[policy].manual_approval as Array<Scope>}
                    onChange={handleChange(policy, 'manual_approval')}
                    disabled={disabled}
                  />
                </ListItem>
              </List>
            </React.Fragment>
          );
        })}
      {features.quoteApprovalPolicies && visibility !== 'private' && (
        <>
          <h3 className='interaction-policy-title'>
            {intl.formatMessage(titleMessages[singlePost ? 'single_post' : visibility].can_quote)}
          </h3>

          <SelectDropdown
            key={quotePolicy === undefined ? '1' : '0'}
            items={{
              public: intl.formatMessage(scopeMessages.public),
              followers: intl.formatMessage(scopeMessages.followers),
              nobody: intl.formatMessage(scopeMessages.nobody),
            }}
            defaultValue={quotePolicy}
            onChange={(event) => onQuotePolicyChange?.(event.target.value as QuoteApprovalPolicy)}
          />
        </>
      )}
    </>
  );
};

const InteractionPoliciesPage = () => {
  const client = useClient();
  const features = useFeatures();
  const { updateMe } = useAuthActions();

  const [quotePolicy, setQuotePolicy] = useState<QuoteApprovalPolicy>('public');

  const {
    interactionPolicies: initial,
    updateInteractionPolicies,
    isUpdating,
  } = useInteractionPolicies();
  const intl = useIntl();
  const [interactionPolicies, setInteractionPolicies] = useState(initial);
  const [visibility, setVisibility] = useState<Visibility>('public');

  useEffect(() => {
    setInteractionPolicies(initial);
  }, [initial]);

  useEffect(() => {
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
      promises.push(updateMe({ source: { quote_policy: quotePolicy } }));
    }

    Promise.all(promises)
      .then(() => {
        toast.success(messages.success);
      })
      .catch(() => {
        toast.error(intl.formatMessage(messages.fail));
      });
  };

  return (
    <Column label={intl.formatMessage(messages.heading)} backHref='/settings'>
      <Form onSubmit={handleSubmit}>
        <Tabs
          items={[
            {
              text: intl.formatMessage(messages.public),
              action: () => setVisibility('public'),
              name: 'public',
            },
            {
              text: intl.formatMessage(messages.unlisted),
              action: () => setVisibility('unlisted'),
              name: 'unlisted',
            },
            {
              text: intl.formatMessage(messages.private),
              action: () => setVisibility('private'),
              name: 'private',
            },
          ]}
          activeItem={visibility}
        />

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

        <div className='interaction-policies__actions form__actions'>
          <button type='submit' disabled={isUpdating}>
            <FormattedMessage id='interaction_policies.update' defaultMessage='Update' />
          </button>
        </div>
      </Form>
    </Column>
  );
};

export {
  InteractionPoliciesPage as default,
  InteractionPolicyConfig,
  type Policy,
  type Rule,
  type Scope,
};
