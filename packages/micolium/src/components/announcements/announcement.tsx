import { Card, Text } from '@mkljczk/react-native-paper';
import React from 'react';
import { FormattedDate } from 'react-intl';
import { View } from 'react-native';

import { AnnouncementReactions } from '@/components/announcements/announcement-reactions';
import { CollapsibleContent } from '@/components/ui/collapsible-content';
import { StyledHtml } from '@/components/ui/styled-html';
import { useFeatures } from '@/contexts/current-account-context';

import type { Announcement as AnnouncementEntity } from 'pl-api';

interface IAnnouncement {
  announcement: AnnouncementEntity;
}

const Announcement: React.FC<IAnnouncement> = ({ announcement }) => {
  const features = useFeatures();

  const startsAt = announcement.starts_at && new Date(announcement.starts_at);
  const endsAt = announcement.ends_at && new Date(announcement.ends_at);
  const now = new Date();
  const hasTimeRange = startsAt && endsAt;
  const skipYear =
    hasTimeRange &&
    startsAt.getFullYear() === endsAt.getFullYear() &&
    endsAt.getFullYear() === now.getFullYear();
  const skipEndDate =
    hasTimeRange &&
    startsAt.getDate() === endsAt.getDate() &&
    startsAt.getMonth() === endsAt.getMonth() &&
    startsAt.getFullYear() === endsAt.getFullYear();
  const skipTime = announcement.all_day;

  return (
    <Card mode='outlined'>
      <Card.Content style={{ gap: 8 }}>
        <CollapsibleContent key={announcement.id}>
          <StyledHtml
            html={announcement.content}
            emojis={announcement.emojis}
            mentions={announcement.mentions}
          />
        </CollapsibleContent>
        {hasTimeRange && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text variant='labelMediumEmphasized'>
              <FormattedDate
                value={startsAt}
                hour12
                year={
                  skipYear || startsAt.getFullYear() === now.getFullYear() ? undefined : 'numeric'
                }
                month='short'
                day='2-digit'
                hour={skipTime ? undefined : 'numeric'}
                minute={skipTime ? undefined : '2-digit'}
              />{' '}
              -{' '}
              <FormattedDate
                value={endsAt}
                hour12
                year={
                  skipYear || endsAt.getFullYear() === now.getFullYear() ? undefined : 'numeric'
                }
                month={skipEndDate ? undefined : 'short'}
                day={skipEndDate ? undefined : '2-digit'}
                hour={skipTime ? undefined : 'numeric'}
                minute={skipTime ? undefined : '2-digit'}
              />
            </Text>
          </View>
        )}
        {features.announcementsReactions && <AnnouncementReactions announcement={announcement} />}
      </Card.Content>
    </Card>
  );
};

export { Announcement };
