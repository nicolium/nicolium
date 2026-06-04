import React from 'react';
import { FormattedMessage } from 'react-intl';

import Link from '@/components/link';
import Emojify from '@/features/emoji/emojify';
import { useGroupQuery } from '@/queries/groups/use-group';
import { useMinimalStatus } from '@/queries/statuses/use-status';
import { useCompose } from '@/stores/compose';

interface IReplyGroupIndicator {
  composeId: string;
}

const ReplyGroupIndicator: React.FC<IReplyGroupIndicator> = ({ composeId }) => {
  const { inReplyToId } = useCompose(composeId);

  const { data: status } = useMinimalStatus(inReplyToId ?? undefined);

  const { data: group } = useGroupQuery(status?.group_id ?? undefined);

  if (!group) {
    return null;
  }

  return (
    <p className='reply-group-indicator'>
      <FormattedMessage
        id='compose.reply_group_indicator.message'
        defaultMessage='Posting to {groupLink}'
        values={{
          groupLink: (
            <Link to='/groups/$groupId' params={{ groupId: group.id }}>
              <Emojify text={group.display_name} emojis={group.emojis} />
            </Link>
          ),
        }}
      />
    </p>
  );
};

export { ReplyGroupIndicator as default };
