import { useNavigation } from '@react-navigation/native';
import { parseDocument } from 'htmlparser2';
import React from 'react';

import { useAccount } from '@/queries/accounts/use-account';

import { type IUIAccount, UIAccount } from '../ui/account';
import { nodesToText } from '../ui/styled-html';

import { ActionButton } from './action-button';

interface IAccount extends Pick<IUIAccount, 'action' | 'onPress' | 'style'> {
  id: string;
  timestamp?: string;
  futureDate?: boolean;
  withLink?: boolean;
  fullWidthPressable?: boolean;
  displayFqn?: boolean;
  withFollowButton?: boolean;
  actionType?: 'follow_request' | 'biting';
}

const Account: React.FC<IAccount> = ({
  id,
  withLink,
  displayFqn,
  withFollowButton,
  actionType,
  action,
  ...props
}) => {
  const navigation = useNavigation();

  const { data: account } = useAccount(id);

  const pronouns = React.useMemo(() => {
    if (!account) return;

    if (account.pronouns.length) return account.pronouns.join('/');

    const candidate = account.fields.find(({ name }) =>
      name.toLocaleLowerCase().includes('pronouns'),
    );

    if (!candidate) return;

    try {
      const parsedText = nodesToText(parseDocument(candidate.value).childNodes);
      if (parsedText.length < 25) return parsedText;
    } catch {}
  }, [account]);

  if (!account) return null;

  return (
    <UIAccount
      avatarSrc={account.avatar_default ? undefined : account.avatar}
      displayName={account.display_name}
      displayNameDetail={pronouns}
      emojis={account.emojis}
      acct={displayFqn ? account.fqn : account.acct}
      onPress={
        withLink
          ? () => navigation.navigate('accounts', { screen: 'view', params: { id } })
          : undefined
      }
      action={
        action ||
        (withFollowButton || actionType ? (
          <ActionButton id={id} actionType={actionType} />
        ) : undefined)
      }
      {...props}
    />
  );
};

export { Account, type IAccount };
