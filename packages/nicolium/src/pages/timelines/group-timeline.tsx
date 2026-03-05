import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useEffect, useRef } from 'react';
import { FormattedMessage } from 'react-intl';

import { fetchGroupTimeline } from '@/actions/timelines';
import { useGroupStream } from '@/api/hooks/streaming/use-group-stream';
import { GroupTimelineColumn } from '@/columns/timeline';
import Avatar from '@/components/ui/avatar';
import HStack from '@/components/ui/hstack';
import Stack from '@/components/ui/stack';
import Timeline from '@/features/ui/components/timeline';
import { groupTimelineRoute } from '@/features/ui/router';
import { ComposeForm } from '@/features/ui/util/async-components';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useDraggedFiles } from '@/hooks/use-dragged-files';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useGroupQuery } from '@/queries/groups/use-group';
import { useComposeActions, useUploadCompose } from '@/stores/compose';
import { useSettings } from '@/stores/settings';

interface IGroupTimeline {
  groupId: string;
}

const GroupTimeline: React.FC<IGroupTimeline> = ({ groupId }) => {
  const dispatch = useAppDispatch();

  const handleLoadMore = () => {
    dispatch(fetchGroupTimeline(groupId, {}, true));
  };

  useGroupStream(groupId);

  useEffect(() => {
    dispatch(fetchGroupTimeline(groupId, {}));
  }, [groupId]);

  return (
    <Timeline
      scrollKey='group_timeline'
      timelineId={`group:${groupId}`}
      onLoadMore={handleLoadMore}
      emptyMessageText={
        <FormattedMessage
          id='empty_column.group'
          defaultMessage='There are no posts in this group yet.'
        />
      }
      emptyMessageIcon={require('@phosphor-icons/core/regular/chat-centered-text.svg')}
      showGroup={false}
    />
  );
};

const GroupTimelinePage: React.FC = () => {
  const { groupId } = groupTimelineRoute.useParams();

  const composeId = `group:${groupId}`;

  const { data: account } = useOwnAccount();
  const { experimentalTimeline } = useSettings();
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
    <Stack space={2}>
      {canComposeGroupStatus && (
        <div className='border-b border-solid border-gray-200 py-6 dark:border-gray-800'>
          <HStack
            ref={composer}
            alignItems='start'
            space={2}
            className={clsx('relative rounded-xl transition', {
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
          </HStack>
        </div>
      )}

      {experimentalTimeline ? (
        <GroupTimelineColumn groupId={groupId} />
      ) : (
        <GroupTimeline groupId={groupId} />
      )}
    </Stack>
  );
};

export { GroupTimelinePage as default };
