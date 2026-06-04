import React from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import Announcement from '@/components/announcements/announcement';
import { makeCustomEmojiMap } from '@/components/announcements/announcements-panel';
import ScrollableList from '@/components/scrollable-list';
import Column from '@/components/ui/column';
import ColumnLoading from '@/features/ui/components/column-loading';
import { useAnnouncements } from '@/queries/announcements/use-announcements';
import { useCustomEmojis } from '@/queries/instance/use-custom-emojis';

const messages = defineMessages({
  heading: { id: 'announcements.title', defaultMessage: 'Announcements' },
});

const AnnouncementsPage = () => {
  const intl = useIntl();

  const { data: emojiMap = {} } = useCustomEmojis(makeCustomEmojiMap);
  const { data: announcements } = useAnnouncements();

  if (!announcements) {
    return <ColumnLoading />;
  }

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <ScrollableList
        emptyMessageText={
          <FormattedMessage
            id='announcements.empty'
            defaultMessage='There are no announcements at the moment.'
          />
        }
        listClassName='modal__list'
        itemClassName='announcement__container'
      >
        {announcements.map((announcement) => (
          <Announcement key={announcement.id} announcement={announcement} emojiMap={emojiMap} />
        ))}
      </ScrollableList>
    </Column>
  );
};

export { AnnouncementsPage as default };
