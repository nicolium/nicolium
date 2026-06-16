import React, { useState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';

import ReactSwipeableViews from '@/components/react-swipeable-views';
import Widget from '@/components/ui/widget';
import { useAnnouncements } from '@/queries/announcements/use-announcements';
import { useCustomEmojis } from '@/queries/instance/use-custom-emojis';

import Announcement from './announcement';

import type { CustomEmoji } from 'pl-api';

const messages = {
  announcementDotTitle: {
    id: 'announcements.dot_title',
    defaultMessage: 'Announcement {number}',
  },
};

const makeCustomEmojiMap = (items: Array<CustomEmoji>) =>
  items.reduce<Record<string, CustomEmoji>>(
    (map, emoji) => ((map[emoji.shortcode] = emoji), map),
    {},
  );

const AnnouncementsPanel = () => {
  const intl = useIntl();
  const { data: emojiMap = {} } = useCustomEmojis(makeCustomEmojiMap);
  const [index, setIndex] = useState(0);

  const { data: announcements } = useAnnouncements();

  if (!announcements || announcements.length === 0) return null;

  const handleChangeIndex = (index: number) => {
    setIndex(index % announcements.length);
  };

  return (
    <Widget
      title={<FormattedMessage id='announcements.title' defaultMessage='Announcements' />}
      className='announcements-widget'
    >
      <ReactSwipeableViews animateHeight index={index} onChangeIndex={handleChangeIndex}>
        {announcements
          .map((announcement) => (
            <Announcement key={announcement.id} announcement={announcement} emojiMap={emojiMap} />
          ))
          .toReversed()}
      </ReactSwipeableViews>
      {announcements.length > 1 && (
        <div className='announcements-widget__dots'>
          {announcements.map((_, i) => (
            <button
              key={i}
              tabIndex={0}
              onClick={() => {
                setIndex(i);
              }}
              data-active={i === index}
              aria-label={intl.formatMessage(messages.announcementDotTitle, { number: i + 1 })}
            />
          ))}
        </div>
      )}
    </Widget>
  );
};

export { AnnouncementsPanel as default, makeCustomEmojiMap };
