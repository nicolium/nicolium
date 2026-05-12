import iconBookmarksFill from '@phosphor-icons/core/fill/bookmarks-fill.svg';
import iconBroadcastFill from '@phosphor-icons/core/fill/broadcast-fill.svg';
import iconCircleFill from '@phosphor-icons/core/fill/circle-fill.svg';
import iconHashFill from '@phosphor-icons/core/fill/hash-fill.svg';
import iconListDashesFill from '@phosphor-icons/core/fill/list-dashes-fill.svg';
import iconPlanetFill from '@phosphor-icons/core/fill/planet-fill.svg';
import iconBookmarks from '@phosphor-icons/core/regular/bookmarks.svg';
import iconBroadcast from '@phosphor-icons/core/regular/broadcast.svg';
import iconCircle from '@phosphor-icons/core/regular/circle.svg';
import iconHash from '@phosphor-icons/core/regular/hash.svg';
import iconListDashes from '@phosphor-icons/core/regular/list-dashes.svg';
import iconPlanet from '@phosphor-icons/core/regular/planet.svg';

import { useAntenna } from '@/queries/accounts/use-antennas';
import { useCircle } from '@/queries/accounts/use-circles';
import { useList } from '@/queries/accounts/use-lists';
import { useBookmarkFolder } from '@/queries/statuses/use-bookmark-folders';

import type { NavigationItemsMenuItem } from '@/hooks/use-navigation-items';
import type { LinkOptions } from '@tanstack/react-router';

type DynamicContentLinkItem = Extract<NavigationItemsMenuItem, { type: 'dynamic-content-link' }>;

type DynamicContentLink = {
  text: string;
  icon: string;
  activeIcon: string;
} & LinkOptions;

const useDynamicContentLink = (item: DynamicContentLinkItem | null): DynamicContentLink | null => {
  const contentType = item?.contentType;
  const id = item?.id ?? '';

  const { data: list } = useList(contentType === 'list' ? id : undefined);
  const { data: circle } = useCircle(contentType === 'circle' ? id : undefined);
  const { data: antenna } = useAntenna(contentType === 'antenna' ? id : undefined);
  const { data: bookmarkFolder } = useBookmarkFolder(
    contentType === 'bookmark_folder' ? id : undefined,
  );

  switch (contentType) {
    case 'list':
      return list
        ? {
            to: '/list/$listId',
            params: { listId: id },
            text: list.title,
            icon: iconListDashes,
            activeIcon: iconListDashesFill,
          }
        : null;
    case 'circle':
      return circle
        ? {
            to: '/circles/$circleId',
            params: { circleId: id },
            text: circle.title,
            icon: iconCircle,
            activeIcon: iconCircleFill,
          }
        : null;
    case 'antenna':
      return antenna
        ? {
            to: '/antennas/$antennaId',
            params: { antennaId: id },
            text: antenna.title,
            icon: iconBroadcast,
            activeIcon: iconBroadcastFill,
          }
        : null;
    case 'instance':
      return {
        to: '/timeline/$instance',
        params: { instance: id },
        text: id,
        icon: iconPlanet,
        activeIcon: iconPlanetFill,
      };
    case 'hashtag':
      return {
        to: '/tags/$hashtag',
        params: { hashtag: id.replace(/^#/, '') },
        text: `#${id.replace(/^#/, '')}`,
        icon: iconHash,
        activeIcon: iconHashFill,
      };
    case 'bookmark_folder':
      return bookmarkFolder
        ? {
            to: '/bookmarks/$folderId',
            params: { folderId: id },
            text: bookmarkFolder.name,
            icon: iconBookmarks,
            activeIcon: iconBookmarksFill,
          }
        : null;
  }

  return null;
};

export { useDynamicContentLink, type DynamicContentLinkItem };
