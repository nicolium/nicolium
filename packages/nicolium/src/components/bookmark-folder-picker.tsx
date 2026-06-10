import iconBookmarks from '@phosphor-icons/core/regular/bookmarks.svg';
import iconCaretDown from '@phosphor-icons/core/regular/caret-down.svg';
import iconFolderSimple from '@phosphor-icons/core/regular/folder-simple.svg';
import React, { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { useFeatures } from '@/hooks/use-features';
import { useBookmarkFolders } from '@/queries/statuses/use-bookmark-folders';

import DropdownMenu, { type Menu } from './dropdown-menu';
import Icon from './ui/icon';

const messages = defineMessages({
  allBookmarks: { id: 'column.bookmarks.all', defaultMessage: 'All bookmarks' },
  bookmarks: { id: 'column.bookmarks', defaultMessage: 'Bookmarks' },
});

const useBookmarkFolderHeading = (active: IBookmarkFolderPicker['active']) => {
  const intl = useIntl();
  const features = useFeatures();

  const { data: folders } = useBookmarkFolders(active !== 'all');

  return useMemo(() => {
    if (active === 'all')
      return intl.formatMessage(
        features.bookmarkFolders ? messages.allBookmarks : messages.bookmarks,
      );

    const folder = folders?.find((folder) => folder.id === active);
    return folder?.name ?? '';
  }, [active, folders]);
};

interface IBookmarkFolderPicker {
  active: 'all' | string;
}

const BookmarkFolderPicker: React.FC<IBookmarkFolderPicker> = ({ active }) => {
  const intl = useIntl();
  const features = useFeatures();

  const { data: folders } = useBookmarkFolders();

  const heading = useBookmarkFolderHeading(active);

  const items = useMemo(() => {
    const items: Menu = [
      {
        to: '/bookmarks/$folderId',
        params: { folderId: 'all' },
        text: intl.formatMessage(
          features.bookmarkFolders ? messages.allBookmarks : messages.bookmarks,
        ),
        icon: iconBookmarks,
        active: active === 'all',
      },
    ];

    folders?.forEach((folder) => {
      items.push({
        to: '/bookmarks/$folderId',
        params: { folderId: folder.id },
        text: folder.name,
        icon: iconFolderSimple,
        emoji: folder.emoji ?? undefined,
        emojiUrl: folder.emoji_url ?? undefined,
        active: active === folder.id,
      });
    });

    return items;
  }, [active, folders]);

  if (items.length === 1) {
    return <div className='timeline-picker'>{heading}</div>;
  }

  return (
    <DropdownMenu items={items} width='16rem' placement='bottom-start' forceDropdown>
      <div className='timeline-picker' role='button' tabIndex={0}>
        {heading}
        <Icon src={iconCaretDown} aria-hidden />
      </div>
    </DropdownMenu>
  );
};

export { BookmarkFolderPicker, useBookmarkFolderHeading };
