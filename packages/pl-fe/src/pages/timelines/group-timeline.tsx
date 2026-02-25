import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useEffect, useRef } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { groupCompose, uploadCompose } from '@/actions/compose';
import { fetchGroupTimeline } from '@/actions/timelines';
import { useGroupStream } from '@/api/hooks/streaming/use-group-stream';
import Avatar from '@/components/ui/avatar';
import HStack from '@/components/ui/hstack';
import Stack from '@/components/ui/stack';
import Timeline from '@/features/ui/components/timeline';
import { groupTimelineRoute } from '@/features/ui/router';
import { ComposeForm } from '@/features/ui/util/async-components';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useAppSelector } from '@/hooks/use-app-selector';
import { useDraggedFiles } from '@/hooks/use-dragged-files';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useGroupQuery } from '@/queries/groups/use-group';
import { makeGetStatusIds } from '@/selectors';

const getStatusIds = makeGetStatusIds();

const GroupTimelinePage: React.FC = () => {
  const { groupId } = groupTimelineRoute.useParams();

  const intl = useIntl();
  const { data: account } = useOwnAccount();
  const dispatch = useAppDispatch();
  const composer = useRef<HTMLDivElement>(null);

  const { data: group } = useGroupQuery(groupId);

  const composeId = `group:${groupId}`;
  const canComposeGroupStatus = !!account && group?.relationship?.member;
  const featuredStatusIds = useAppSelector((state) =>
    getStatusIds(state, { type: `group:${group?.id}:pinned` }),
  );

  const { isDragging, isDraggedOver } = useDraggedFiles(composer, (files) => {
    dispatch(uploadCompose(composeId, files, intl));
  });

  const handleLoadMore = (maxId: string) => {
    dispatch(fetchGroupTimeline(groupId, {}, true));
  };

  useGroupStream(groupId);

  useEffect(() => {
    dispatch(fetchGroupTimeline(groupId, {}));
    // dispatch(fetchGroupTimeline(groupId, { pinned: true }));
    dispatch(groupCompose(composeId, groupId));
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

            <ComposeForm
              id={composeId}
              shouldCondense
              autoFocus={false}
              group={groupId}
              withAvatar
              transparent
            />
          </HStack>
        </div>
      )}

      <Timeline
        scrollKey='group_timeline'
        timelineId={composeId}
        onLoadMore={handleLoadMore}
        emptyMessageText={
          <FormattedMessage
            id='empty_column.group'
            defaultMessage='There are no posts in this group yet.'
          />
        }
        emptyMessageIcon={require('@phosphor-icons/core/regular/chat-centered-text.svg')}
        showGroup={false}
        featuredStatusIds={featuredStatusIds}
      />
    </Stack>
  );
};

export { GroupTimelinePage as default };
