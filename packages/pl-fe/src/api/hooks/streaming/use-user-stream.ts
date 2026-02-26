import { useCallback } from 'react';

import { updateStatus } from '@/actions/statuses';
import { deleteFromTimelines, processTimelineUpdate } from '@/actions/timelines';
import { useStatContext } from '@/contexts/stat-context';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { updateReactions } from '@/queries/announcements/use-announcements';
import { queryClient } from '@/queries/client';
import { updateConversations } from '@/queries/conversations/use-conversations';
import { queryKeys } from '@/queries/keys';
import { useProcessStreamNotification } from '@/queries/notifications/use-notifications';
import { useSettings } from '@/stores/settings';
import { getUnreadChatsCount, updateChatListItem } from '@/utils/chats';
import { play, soundCache } from '@/utils/sounds';

import { useTimelineStream } from './use-timeline-stream';

import type { AppDispatch, RootState } from '@/store';
import type {
  Announcement,
  AnnouncementReaction,
  FollowRelationshipUpdate,
  StreamingEvent,
} from 'pl-api';

const updateAnnouncementReactions = (reaction: AnnouncementReaction) => {
  queryClient.setQueryData(queryKeys.announcements.all, (prevResult) =>
    prevResult?.map((value) => {
      if (value.id !== reaction.announcement_id) return value;

      return {
        ...value,
        reactions: updateReactions(value.reactions, reaction.name, reaction.count, undefined, true),
      };
    }),
  );
};

const updateAnnouncement = (announcement: Announcement) =>
  queryClient.setQueryData(queryKeys.announcements.all, (prevResult) => {
    if (!prevResult) return;

    let updated = false;

    const result = prevResult.map((value) =>
      value.id === announcement.id ? ((updated = true), announcement) : value,
    );

    if (!updated) return [announcement, ...result];
  });

const deleteAnnouncement = (announcementId: string) =>
  queryClient.setQueryData(queryKeys.announcements.all, (prevResult) =>
    prevResult?.filter((value) => value.id !== announcementId),
  );

const followStateToRelationship = (followState: FollowRelationshipUpdate['state']) => {
  switch (followState) {
    case 'follow_pending':
      return { following: false, requested: true };
    case 'follow_accept':
      return { following: true, requested: false };
    case 'follow_reject':
      return { following: false, requested: false };
    default:
      return {};
  }
};

const updateFollowRelationships =
  (update: FollowRelationshipUpdate) => (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    const me = state.me;

    if (update.follower.id === me) {
      queryClient.setQueryData(
        queryKeys.accountRelationships.show(update.following.id),
        (relationship) =>
          relationship
            ? {
                ...relationship,
                ...followStateToRelationship(update.state),
              }
            : undefined,
      );
    }
  };

const getTimelineFromStream = (stream: Array<string>) => {
  switch (stream[0]) {
    case 'user':
      return 'home';
    case 'hashtag':
    case 'hashtag:local':
    case 'list':
      return `${stream[0]}:${stream[1]}`;
    default:
      return stream[0];
  }
};

const useUserStream = () => {
  const { isLoggedIn } = useLoggedIn();
  const dispatch = useAppDispatch();
  const statContext = useStatContext();
  const settings = useSettings();
  const processStreamNotification = useProcessStreamNotification();

  const listener = useCallback((event: StreamingEvent) => {
    switch (event.event) {
      case 'update':
        dispatch(processTimelineUpdate(getTimelineFromStream(event.stream), event.payload));
        break;
      case 'status.update':
        dispatch(updateStatus(event.payload));
        break;
      case 'delete':
        dispatch(deleteFromTimelines(event.payload));
        break;
      case 'notification':
        processStreamNotification(event.payload);
        break;
      case 'conversation':
        updateConversations(event.payload);
        break;
      case 'filters_changed':
        queryClient.invalidateQueries({ queryKey: queryKeys.filters.all });
        break;
      case 'chat_update':
        dispatch((_dispatch, getState) => {
          const chat = event.payload;
          const me = getState().me;
          const messageOwned = chat.last_message?.account_id === me;

          // Don't update own messages from streaming
          if (!messageOwned) {
            updateChatListItem(chat);

            if (settings.chats.sound) {
              play(soundCache.chat);
            }

            // Increment unread counter
            statContext?.setUnreadChatsCount(getUnreadChatsCount());
          }
        });
        break;
      case 'follow_relationships_update':
        dispatch(updateFollowRelationships(event.payload));
        break;
      case 'announcement':
        updateAnnouncement(event.payload);
        break;
      case 'announcement.reaction':
        updateAnnouncementReactions(event.payload);
        break;
      case 'announcement.delete':
        deleteAnnouncement(event.payload);
        break;
      case 'marker':
        queryClient.setQueryData(
          queryKeys.markers.notifications,
          event.payload.notifications ?? null,
        );
        break;
    }
  }, []);

  return useTimelineStream('user', {}, isLoggedIn, listener);
};

export { useUserStream };
