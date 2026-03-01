import React from 'react';
import { FormattedMessage } from 'react-intl';

import Link from '@/components/link';
import Text from '@/components/ui/text';
import Emojify from '@/features/emoji/emojify';
import { useGroupQuery } from '@/queries/groups/use-group';
import { useMinimalStatus } from '@/queries/statuses/use-status';
import { useCompose } from '@/stores/compose';

interface IReplyGroupIndicator {
  composeId: string;
}

const ReplyGroupIndicator: React.FC<IReplyGroupIndicator> = (props) => {
  const { composeId } = props;

  const { inReplyToId } = useCompose(composeId);

  const { data: status } = useMinimalStatus(inReplyToId ?? undefined);

  const { data: group } = useGroupQuery(status?.group_id ?? undefined);

  if (!group) {
    return null;
  }

  return (
    <Text theme='muted' size='sm'>
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
    </Text>
  );
};

export { ReplyGroupIndicator as default };
