import clsx from 'clsx';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import ReactSwipeableViews from '@/components/react-swipeable-views';
import Card from '@/components/ui/card';
import Widget from '@/components/ui/widget';
import { useAnnouncements } from '@/queries/announcements/use-announcements';
import { useCustomEmojis } from '@/queries/instance/use-custom-emojis';

import Announcement from './announcement';

import type { CustomEmoji } from 'pl-api';

const makeCustomEmojiMap = (items: Array<CustomEmoji>) =>
  items.reduce<Record<string, CustomEmoji>>(
    (map, emoji) => ((map[emoji.shortcode] = emoji), map),
    {},
  );

const AnnouncementsPanel = () => {
  const { data: emojiMap = {} } = useCustomEmojis(makeCustomEmojiMap);
  const [index, setIndex] = useState(0);

  const { data: announcements } = useAnnouncements();

  if (!announcements || announcements.length === 0) return null;

  const handleChangeIndex = (index: number) => {
    setIndex(index % announcements.length);
  };

  return (
    <Widget title={<FormattedMessage id='announcements.title' defaultMessage='Announcements' />}>
      <Card
        className='relative black:rounded-xl black:border black:border-gray-800'
        size='md'
        variant='rounded'
      >
        <ReactSwipeableViews animateHeight index={index} onChangeIndex={handleChangeIndex}>
          {announcements
            .map((announcement) => (
              <Announcement key={announcement.id} announcement={announcement} emojiMap={emojiMap} />
            ))
            .toReversed()}
        </ReactSwipeableViews>
        {announcements.length > 1 && (
          <div className='relative flex items-center justify-center gap-2'>
            {announcements.map((_, i) => (
              <button
                key={i}
                tabIndex={0}
                onClick={() => {
                  setIndex(i);
                }}
                className={clsx({
                  'h-2 w-2 rounded-full focus:ring-2 focus:ring-primary-600 focus:ring-offset-2': true,
                  'bg-gray-200 hover:bg-gray-300': i !== index,
                  'bg-primary-600': i === index,
                })}
              />
            ))}
          </div>
        )}
      </Card>
    </Widget>
  );
};

export { AnnouncementsPanel as default };
