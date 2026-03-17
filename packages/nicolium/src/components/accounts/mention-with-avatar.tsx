import React from 'react';

import { useAccount } from '@/queries/accounts/use-account';

import Avatar from '../ui/avatar';

import HoverAccountWrapper from './hover-account-wrapper';

interface IMentionWithAvatar {
  id: string;
  username: string;
}

const MentionWithAvatar: React.FC<IMentionWithAvatar> = ({ id, username }) => {
  const { data: account } = useAccount(id);

  return (
    <HoverAccountWrapper accountId={id} element='span' className='⁂-mention-with-avatar'>
      <Avatar size={16} src={account?.avatar || ''} alt={account?.avatar_description} />
      <span>@{username}</span>
    </HoverAccountWrapper>
  );
};

export { MentionWithAvatar };
