import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { useFeatures } from '@/contexts/current-account-context';

import { List, type IList } from './ui/list';

import type { CreateStatusParams, InteractionPolicy } from 'pl-api';

type Visibility = 'public' | 'unlisted' | 'private';
type Policy = 'can_favourite' | 'can_reblog' | 'can_reply';
type Rule = 'automatic_approval' | 'manual_approval';
type Scope = 'followers' | 'following' | 'mentioned' | 'public';

type QuoteApprovalPolicy = CreateStatusParams['quote_approval_policy'];

const policies: Array<Policy> = ['can_favourite', 'can_reply', 'can_reblog'];

const messages = defineMessages({
  always: { id: 'interaction_policies.rule.always', defaultMessage: 'Always' },
  withApproval: {
    id: 'interaction_policies.rule.with_approval',
    defaultMessage: 'Require approval',
  },
  mentionedWarning: {
    id: 'interaction_policies.mentioned_warning',
    defaultMessage: 'Mentioned users can always reply.',
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

  const titles = titleMessages[singlePost ? 'single_post' : visibility];

  const getItems = (policy: Policy) =>
    options[visibility][policy].map((scope) => ({
      value: scope,
      label: intl.formatMessage(scopeMessages[scope]),
    }));

  const handleChange = (policy: Policy, rule: Rule) => (scope: Scope) => {
    const value = interactionPolicy[policy][rule] as Array<Scope>;

    onChange(
      policy,
      rule,
      value.includes(scope) ? value.filter((item) => item !== scope) : [...value, scope],
    );
  };

  const sections: IList['sections'] = [];

  if (features.interactionRequests) {
    for (const policy of policies) {
      const items = getItems(policy);

      if (!items.length) continue;

      sections.push({
        subheader: intl.formatMessage(titles[policy]),
        items: [
          {
            type: 'select',
            label: intl.formatMessage(messages.always),
            sublabel:
              policy === 'can_reply' ? intl.formatMessage(messages.mentionedWarning) : undefined,
            options: items,
            active: interactionPolicy[policy].automatic_approval,
            onChange: handleChange(policy, 'automatic_approval'),
            disabled,
          },
          {
            type: 'select',
            label: intl.formatMessage(messages.withApproval),
            options: items,
            active: interactionPolicy[policy].manual_approval,
            onChange: handleChange(policy, 'manual_approval'),
            disabled,
          },
        ],
      });
    }
  }

  if (features.quoteApprovalPolicies && visibility !== 'private') {
    sections.push({
      items: [
        {
          type: 'select',
          label: intl.formatMessage(titles.can_quote),
          options: [
            { value: 'public', label: intl.formatMessage(scopeMessages.public) },
            { value: 'followers', label: intl.formatMessage(scopeMessages.followers) },
            { value: 'nobody', label: intl.formatMessage(scopeMessages.nobody) },
          ],
          active: quotePolicy,
          onChange: (value: QuoteApprovalPolicy) => onQuotePolicyChange?.(value),
          disabled,
        },
      ],
    });
  }

  return <List sections={sections} />;
};

export {
  InteractionPolicyConfig,
  type Policy,
  type QuoteApprovalPolicy,
  type Rule,
  type Scope,
  type Visibility,
};
