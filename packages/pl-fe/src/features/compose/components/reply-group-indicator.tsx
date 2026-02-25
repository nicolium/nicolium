import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';

import Link from '@/components/link';
import Text from '@/components/ui/text';
import Emojify from '@/features/emoji/emojify';
import { useAppSelector } from '@/hooks/use-app-selector';
import { useGroupQuery } from '@/queries/groups/use-group';
import { makeGetStatus } from '@/selectors';
import { useCompose } from '@/stores/compose';

interface IReplyGroupIndicator {
  composeId: string;
}

const ReplyGroupIndicator = (props: IReplyGroupIndicator) => {
  const { composeId } = props;

  const getStatus = useCallback(makeGetStatus(), []);
  const { inReplyToId } = useCompose(composeId);

  const status = useAppSelector((state) => getStatus(state, { id: inReplyToId! }));

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
