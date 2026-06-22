import { useCallback } from 'react';

import { useCurrentAccountContext } from '@/contexts/current-account-context';
import { useStatContext } from '@/contexts/stat-context';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { updateReactions } from '@/queries/announcements/use-announcements';
import { queryClient } from '@/queries/client';
import { updateConversations } from '@/queries/conversations/use-conversations';
import { queryKeys } from '@/queries/keys';
import { useProcessStreamNotification } from '@/queries/notifications/use-notifications';
import { useImportEntities } from '@/queries/utils/import-entities';
import { backendUrl } from '@/stores/auth';
import { useSettings } from '@/stores/settings';
import { useTimelinesActions } from '@/stores/timelines';
import { getUnreadChatsCount, updateChatListItem } from '@/utils/chats';
import { play, soundCache } from '@/utils/sounds';

import { useTimelineStream } from './use-timeline-stream';

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

const updateFollowRelationships = (update: FollowRelationshipUpdate, me: string) => {
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
  const { isLoggedIn, me } = useLoggedIn();
  const statContext = useStatContext();
  const settings = useSettings();
  const processStreamNotification = useProcessStreamNotification();
  const { deleteStatus, receiveStreamingStatus } = useTimelinesActions();
  const importEntities = useImportEntities();
  const scopeUrl = useCurrentAccountContext().meUrl || backendUrl;

  const listener = useCallback((event: StreamingEvent) => {
    switch (event.event) {
      case 'update': {
        const timelineId = getTimelineFromStream(event.stream);
        importEntities({ statuses: [event.payload] });
        receiveStreamingStatus(timelineId, event.payload);
        break;
      }
      case 'status.update':
        importEntities({ statuses: [event.payload] });
        break;
      case 'delete':
        deleteStatus(event.payload);
        break;
      case 'notification':
        processStreamNotification(event.payload);
        break;
      case 'conversation':
        updateConversations(event.payload, scopeUrl);
        break;
      case 'filters_changed':
        queryClient.invalidateQueries({ queryKey: queryKeys.filters.all });
        break;
      case 'chat_update':
        {
          const chat = event.payload;
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
        }
        break;
      case 'follow_relationships_update':
        updateFollowRelationships(event.payload, me as string);
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
      case 'marker': {
        for (const timeline in event.payload) {
          queryClient.setQueryData(
            queryKeys.markers.timeline(timeline as 'home' | 'notifications'),
            event.payload[timeline] ?? null,
          );
        }

        break;
      }
    }
  }, []);

  return useTimelineStream('user', {}, isLoggedIn, listener);
};

export { useUserStream };
