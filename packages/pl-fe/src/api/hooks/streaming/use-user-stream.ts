import { useCallback } from 'react';

import { fetchFilters } from '@/actions/filters';
import { MARKER_FETCH_SUCCESS } from '@/actions/markers';
import { updateNotificationsQueue } from '@/actions/notifications';
import { getLocale } from '@/actions/settings';
import { updateStatus } from '@/actions/statuses';
import { deleteFromTimelines, processTimelineUpdate } from '@/actions/timelines';
import { useStatContext } from '@/contexts/stat-context';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useLoggedIn } from '@/hooks/use-logged-in';
import messages from '@/messages';
import { queryClient } from '@/queries/client';
import { updateConversations } from '@/queries/conversations/use-conversations';
import { useSettings } from '@/stores/settings';
import { getUnreadChatsCount, updateChatListItem } from '@/utils/chats';
import { play, soundCache } from '@/utils/sounds';

import { updateReactions } from '../../../queries/announcements/use-announcements';

import { useTimelineStream } from './use-timeline-stream';

import type { AppDispatch, RootState } from '@/store';
import type {
  Announcement,
  AnnouncementReaction,
  FollowRelationshipUpdate,
  Relationship,
  StreamingEvent,
} from 'pl-api';

const updateAnnouncementReactions = (reaction: AnnouncementReaction) => {
  queryClient.setQueryData(['announcements'], (prevResult: Announcement[]) =>
    prevResult.map((value) => {
      if (value.id !== reaction.announcement_id) return value;

      return {
        ...value,
        reactions: updateReactions(value.reactions, reaction.name, reaction.count, undefined, true),
      };
    }),
  );
};

const updateAnnouncement = (announcement: Announcement) =>
  queryClient.setQueryData(['announcements'], (prevResult: Announcement[]) => {
    let updated = false;

    const result = prevResult.map((value) =>
      value.id === announcement.id ? ((updated = true), announcement) : value,
    );

    if (!updated) return [announcement, ...result];
  });

const deleteAnnouncement = (announcementId: string) =>
  queryClient.setQueryData(['announcements'], (prevResult: Announcement[]) =>
    prevResult.filter((value) => value.id !== announcementId),
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
      queryClient.setQueryData<Relationship>(
        ['accountRelationships', update.following.id],
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
        messages[getLocale()]()
          .then((messages) => {
            dispatch(updateNotificationsQueue(event.payload, messages, getLocale()));
          })
          .catch((error) => {
            console.error(error);
          });
        break;
      case 'conversation':
        updateConversations(event.payload);
        break;
      case 'filters_changed':
        dispatch(fetchFilters());
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
        dispatch({ type: MARKER_FETCH_SUCCESS, marker: event.payload });
        break;
    }
  }, []);

  return useTimelineStream('user', {}, isLoggedIn, listener);
};

export { useUserStream };
