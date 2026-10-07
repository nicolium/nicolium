import React from 'react';

import { useHashtag } from '@/queries/hashtags/use-hashtag';

import { UIHashtag } from './ui/hashtag';

interface IHashtag {
  tag: string;
}

const Hashtag: React.FC<IHashtag> = ({ tag }) => {
  const { data: hashtag } = useHashtag(tag);
  const accounts = Number(
    hashtag?.history?.slice(0, 2).reduce((prev, cur) => (prev += cur.accounts), 0),
  );

  return <UIHashtag tag={tag} accounts={accounts} />;
};

export { Hashtag };
