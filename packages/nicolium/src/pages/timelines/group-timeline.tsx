import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useEffect, useRef } from 'react';
import { FormattedMessage } from 'react-intl';

import { GroupTimelineColumn } from '@/columns/timeline';
import Avatar from '@/components/ui/avatar';
import { groupTimelineRoute } from '@/features/ui/router';
import { ComposeForm } from '@/features/ui/util/async-components';
import { useDraggedFiles } from '@/hooks/use-dragged-files';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useGroupQuery } from '@/queries/groups/use-group';
import { useComposeActions, useUploadCompose } from '@/stores/compose';

const GroupTimelinePage: React.FC = () => {
  const { groupId } = groupTimelineRoute.useParams();

  const composeId = `group:${groupId}`;

  const { data: account } = useOwnAccount();
  const uploadCompose = useUploadCompose(composeId);
  const { updateCompose } = useComposeActions();
  const composer = useRef<HTMLDivElement>(null);

  const { data: group } = useGroupQuery(groupId);

  const canComposeGroupStatus = !!account && group?.relationship?.member;

  const { isDragging, isDraggedOver } = useDraggedFiles(composer, (files) => {
    uploadCompose(files);
  });

  useEffect(() => {
    updateCompose(composeId, (draft) => {
      draft.visibility = 'group';
      draft.groupId = groupId;
      draft.caretPosition = null;
    });
  }, [groupId]);

  if (!group) {
    return null;
  }

  return (
    <div className='flex flex-col gap-2'>
      {canComposeGroupStatus && (
        <div className='border-b border-solid border-gray-200 py-6 dark:border-gray-800'>
          <div
            ref={composer}
            className={clsx('relative flex items-start gap-2 rounded-xl transition', {
              'z-[99] border-2 border-dashed border-primary-600 p-4': isDragging,
              'ring-2 ring-primary-600 ring-offset-2': isDraggedOver,
            })}
          >
            <Link to='/@{$username}' params={{ username: account.acct }}>
              <Avatar
                src={account.avatar}
                alt={account.avatar_description}
                size={42}
                isCat={account.is_cat}
              />
            </Link>

            <ComposeForm id={composeId} shouldCondense group={groupId} withAvatar transparent />
          </div>
        </div>
      )}

      <GroupTimelineColumn
        groupId={groupId}
        emptyMessageText={
          <FormattedMessage
            id='empty_column.group'
            defaultMessage='There are no posts in this group yet.'
          />
        }
        emptyMessageIcon={require('@phosphor-icons/core/regular/chat-centered-text.svg')}
        // showGroup={falsse}
      />
    </div>
  );
};

export { GroupTimelinePage as default };
