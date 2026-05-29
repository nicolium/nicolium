import iconChatCenteredText from '@phosphor-icons/core/regular/chat-centered-text.svg';
import clsx from 'clsx';
import React, { useEffect, useRef } from 'react';
import { FormattedMessage } from 'react-intl';

import { GroupTimelineColumn } from '@/columns/timeline';
import { AccountLink } from '@/components/accounts/account-link';
import Avatar from '@/components/ui/avatar';
import { ComposeForm } from '@/features/ui/util/async-components';
import { useDraggedFiles } from '@/hooks/use-dragged-files';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useGroupQuery } from '@/queries/groups/use-group';
import { groupTimelineRoute } from '@/router';
import { useComposeActions, useUploadCompose } from '@/stores/compose';
import { useSettings } from '@/stores/settings';

const GroupTimelinePage: React.FC = () => {
  const { groupId } = groupTimelineRoute.useParams();

  const composeId = `group:${groupId}`;
  const composeBlock = useRef<HTMLDivElement>(null);

  const { data: account } = useOwnAccount();
  const uploadCompose = useUploadCompose(composeId);
  const { updateCompose } = useComposeActions();
  const composer = useRef<HTMLDivElement>(null);
  const { disableUserProvidedMedia } = useSettings();

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
    <div className='group-timeline'>
      {canComposeGroupStatus && (
        <div className='group-timeline__compose'>
          <div
            className={clsx('compose-block', {
              'compose-block--dragging': isDragging,
              'compose-block--dragged-over': isDraggedOver,
            })}
            ref={composeBlock}
          >
            <div className='compose-block__body'>
              {!disableUserProvidedMedia && (
                <AccountLink className='compose-block__avatar' account={account}>
                  <Avatar
                    src={account.avatar}
                    alt={account.avatar_description}
                    isCat={account.is_cat}
                    size={42}
                    username={account.username}
                  />
                </AccountLink>
              )}

              <div className='compose-block__form'>
                <ComposeForm
                  id={composeId}
                  shouldCondense
                  group={groupId}
                  autoFocus={false}
                  clickableAreaRef={composeBlock}
                  withAvatar
                  transparent
                />
              </div>
            </div>
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
        emptyMessageIcon={iconChatCenteredText}
        // showGroup={false}
      />
    </div>
  );
};

export { GroupTimelinePage as default };
