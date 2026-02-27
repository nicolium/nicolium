import { useNavigate } from '@tanstack/react-router';
import React, { useEffect, useRef } from 'react';

import { getTextDirection } from '@/utils/rtl';

import { ParsedContent } from '../statuses/parsed-content';

import type { Announcement, Mention as MentionEntity } from 'pl-api';

interface IAnnouncementContent {
  announcement: Announcement;
}

const AnnouncementContent: React.FC<IAnnouncementContent> = ({ announcement }) => {
  const navigate = useNavigate();

  const node = useRef<HTMLDivElement>(null);
  const direction = getTextDirection(announcement.content);

  useEffect(() => {
    updateLinks();
  });

  const onMentionClick = (mention: MentionEntity, e: MouseEvent) => {
    if (e.button === 0 && !(e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      e.stopPropagation();
      navigate({ to: '/@{$username}', params: { username: mention.acct } });
    }
  };

  const onHashtagClick = (hashtag: string, e: MouseEvent) => {
    hashtag = hashtag.replace(/^#/, '').toLowerCase();

    if (e.button === 0 && !(e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      e.stopPropagation();
      navigate({ to: '/tags/$id', params: { id: hashtag } });
    }
  };

  const onStatusClick = (statusId: string, e: MouseEvent) => {
    if (e.button === 0 && !(e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigate({
        to: '/@{$username}/posts/$statusId',
        params: { username: 'undefined', statusId },
      });
    }
  };

  const updateLinks = () => {
    if (!node.current) return;

    const links = node.current.querySelectorAll('a');

    links.forEach((link) => {
      // Skip already processed
      if (link.classList.contains('status-link')) return;

      // Add attributes
      link.classList.add('status-link');
      link.setAttribute('rel', 'nofollow noopener');
      link.setAttribute('target', '_blank');

      const mention = announcement.mentions.find((mention) => link.href === mention.url);

      // Add event listeners on mentions, hashtags and statuses
      if (mention) {
        link.addEventListener('click', onMentionClick.bind(link, mention), false);
        link.setAttribute('title', mention.acct);
      } else if (
        link.textContent?.charAt(0) === '#' ||
        link.previousSibling?.textContent?.charAt(link.previousSibling.textContent.length - 1) ===
          '#'
      ) {
        link.addEventListener('click', onHashtagClick.bind(link, link.text), false);
      } else {
        const status = announcement.statuses[link.href];
        if (status) {
          link.addEventListener('click', onStatusClick.bind(this, status), false);
        }
        link.setAttribute('title', link.href);
        link.classList.add('unhandled-link');
      }
    });
  };

  return (
    <div dir={direction} className='text-sm ltr:ml-0 rtl:mr-0' data-markup ref={node}>
      <ParsedContent html={announcement.content} emojis={announcement.emojis} />
    </div>
  );
};

export { AnnouncementContent as default };
