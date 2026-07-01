import iconArrowLeft from '@phosphor-icons/core/regular/arrow-left.svg';
import iconArrowRight from '@phosphor-icons/core/regular/arrow-right.svg';
import iconBell from '@phosphor-icons/core/regular/bell.svg';
import iconBookmarks from '@phosphor-icons/core/regular/bookmarks.svg';
import iconBroadcast from '@phosphor-icons/core/regular/broadcast.svg';
import iconCirclesThree from '@phosphor-icons/core/regular/circles-three.svg';
import iconDotsThreeVertical from '@phosphor-icons/core/regular/dots-three-vertical.svg';
import iconFediverseLogo from '@phosphor-icons/core/regular/fediverse-logo.svg';
import iconFrameCorners from '@phosphor-icons/core/regular/frame-corners.svg';
import iconGlobeSimple from '@phosphor-icons/core/regular/globe-simple.svg';
import iconGraph from '@phosphor-icons/core/regular/graph.svg';
import iconHash from '@phosphor-icons/core/regular/hash.svg';
import iconHouse from '@phosphor-icons/core/regular/house.svg';
import iconListDashes from '@phosphor-icons/core/regular/list-dashes.svg';
import iconMagnifyingGlass from '@phosphor-icons/core/regular/magnifying-glass.svg';
import iconPlanet from '@phosphor-icons/core/regular/planet.svg';
import iconTrash from '@phosphor-icons/core/regular/trash.svg';
import iconUser from '@phosphor-icons/core/regular/user.svg';
import iconWrench from '@phosphor-icons/core/regular/wrench.svg';
import iconChevronsLeftRight from 'lucide-static/icons/chevrons-left-right.svg';
import iconChevronsRightLeft from 'lucide-static/icons/chevrons-right-left.svg';
import iconTimeline from 'lucide-static/icons/timeline.svg';
import React, { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { changeSetting } from '@/actions/settings';
import DropdownMenu, { type Menu } from '@/components/dropdown-menu';
import { useTimelineHeading } from '@/components/timeline-picker';
import { CardHeader, CardTitle } from '@/components/ui/card';
import Emoji from '@/components/ui/emoji';
import Icon from '@/components/ui/icon';
import { useFeatures } from '@/hooks/use-features';
import { useOwnAccount } from '@/hooks/use-own-account';
import { defaultFiltersSettings } from '@/hooks/use-timeline-filters-options';
import { useAccount } from '@/queries/accounts/use-account';
import { useList } from '@/queries/accounts/use-lists';
import { useBookmarkFolder } from '@/queries/statuses/use-bookmark-folders';
import { useSettings } from '@/stores/settings';
import { hasActiveFilters } from '@/utils/timeline-filter';

import { deckMessages as messages } from '../utils/messages';

import { type IDeckColumn, WIDTHS } from './deck-column';
import { DeckColumnAccountButton } from './deck-column-account';
import { updateDeckColumn, useColumnIcon, useColumnTitle } from './deck-column-config';

import type { ITimelinePicker } from '@/components/timeline-picker';
import type { DeckColumn, Settings, TimelineFilters } from '@/schemas/frontend-settings';

type IDeckColumnHeaderInner = IDeckColumnHeader & {
  icon: string;
  emoji?: string;
  emojiUrl?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  items?: Menu;
};

const DeckColumHeaderInner: React.FC<IDeckColumnHeaderInner> = ({
  column,
  index,
  columns,
  onRemove,
  onChangeWidth,
  onChangeIndex,
  onChangeFill,
  icon,
  emoji,
  emojiUrl,
  title,
  subtitle,
  items,
}) => {
  const intl = useIntl();

  const allItems = useMemo(() => {
    const handleWiden = () => {
      const newWidth = WIDTHS[WIDTHS.indexOf(column.columnWidth) + 1];
      if (!newWidth) return;
      onChangeWidth(column.id, newWidth);
    };

    const handleShrink = () => {
      const newWidth = WIDTHS[WIDTHS.indexOf(column.columnWidth) - 1];
      if (!newWidth) return;
      onChangeWidth(column.id, newWidth);
    };

    const handleChangeFill = (value: boolean) => {
      onChangeFill(column.id, value);
    };

    const handleMoveLeft = () => {
      if (index === 0) return;
      onChangeIndex(column.id, index - 1);
    };

    const handleMoveRight = () => {
      if (index === columns - 1) return;
      onChangeIndex(column.id, index + 1);
    };

    const menu: Menu = [
      {
        text: intl.formatMessage(messages.widen),
        icon: iconChevronsLeftRight,
        action: handleWiden,
        disabled: column.columnWidth === 'xl',
      },
      {
        text: intl.formatMessage(messages.shrink),
        icon: iconChevronsRightLeft,
        action: handleShrink,
        disabled: column.columnWidth === 'xs',
      },
      {
        text: intl.formatMessage(messages.fill),
        icon: iconFrameCorners,
        onChange: (value) => handleChangeFill(value),
        type: 'toggle',
        checked: column.fillAvailableWidth,
      },
      {
        text: intl.formatMessage(messages.moveLeft),
        icon: iconArrowLeft,
        action: handleMoveLeft,
        disabled: index === 0,
      },
      {
        text: intl.formatMessage(messages.moveRight),
        icon: iconArrowRight,
        action: handleMoveRight,
        disabled: index === columns - 1,
      },
      null,
      {
        text: intl.formatMessage(messages.remove),
        icon: iconTrash,
        action: () => onRemove(column.id),
        destructive: true,
      },
    ];

    if (items) {
      menu.unshift(...items);
    }

    return menu;
  }, [intl, index, columns, column, items]);

  return (
    <CardHeader className='deck__column__header'>
      <div className='deck__column__header__title'>
        <DeckColumnAccountButton column={column} />
        {emoji ? (
          <Emoji emoji={emoji} src={emojiUrl} className='deck__column__header__icon' />
        ) : (
          <Icon className='deck__column__header__icon' src={icon} />
        )}
        <div className='deck__column__header__title__text'>
          <CardTitle title={title} truncate={false} />
          {subtitle && <p className='deck__column__header__subtitle'>{subtitle}</p>}
        </div>
      </div>
      <div className='deck__column__actions'>
        <DropdownMenu items={allItems} src={iconDotsThreeVertical} />
      </div>
    </CardHeader>
  );
};

const getTimelineIcon = (timeline: ITimelinePicker['active']) => {
  switch (timeline.split(':')[0]) {
    case 'home':
      return iconHouse;
    case 'local':
      return iconPlanet;
    case 'bubble':
      return iconGraph;
    case 'federated':
      return iconFediverseLogo;
    case 'wrenched':
      return iconWrench;
    case 'list':
      return iconListDashes;
    case 'circle':
      return iconCirclesThree;
    case 'antenna':
      return iconBroadcast;
    case 'instance':
      return iconGlobeSimple;
    default:
      return iconTimeline;
  }
};

const TIMELINE_SUBTITLES = {
  list: <FormattedMessage id='column.list' defaultMessage='List timeline' />,
  circle: <FormattedMessage id='column.circle' defaultMessage='Circle timeline' />,
  antenna: <FormattedMessage id='column.antenna' defaultMessage='Antenna timeline' />,
  instance: <FormattedMessage id='column.instance' defaultMessage='Instance timeline' />,
} as const;

const useTimelineFiltersOptions = (
  column: Extract<DeckColumn, { type: 'timeline' | 'hashtag' }>,
) => {
  const intl = useIntl();
  const features = useFeatures();

  let timelineType = column.type === 'hashtag' ? 'hashtag' : column.timeline.split(':')[0];
  if (timelineType === 'federated' || timelineType === 'instance') timelineType = 'public';

  const defaultFilters = useSettings().timelines[timelineType as keyof Settings['timelines']];
  const filters = column.filters ?? defaultFilters ?? defaultFiltersSettings;

  return useMemo(() => {
    const items: Menu = [];

    const handleOnChecked =
      (
        key: Exclude<keyof Exclude<TimelineFilters, undefined>, 'hideFollowedReposts'>,
        inverse: boolean = false,
      ) =>
      (checked: boolean) =>
        changeSetting(['deck', 'columns'], (columns: Array<DeckColumn>) => {
          const updatedColumn = columns.find(({ id }) => column.id === id);

          if (
            !updatedColumn ||
            (updatedColumn.type !== 'timeline' && updatedColumn.type !== 'hashtag')
          )
            return columns;

          if (!updatedColumn.filters) updatedColumn.filters = { ...filters! };

          updatedColumn.filters[key] = inverse ? !checked : checked;

          return [...columns];
        });

    if (['home', 'list', 'antenna'].includes(timelineType)) {
      items.push({
        text: intl.formatMessage(messages.showReblogs),
        type: 'toggle',
        checked: filters?.showReblogs,
        onChange: handleOnChecked('showReblogs'),
      });
      items.push({
        text: intl.formatMessage(messages.showSelfReblogs),
        type: 'toggle',
        checked: filters?.showSelfReblogs,
        disabled: !filters?.showReblogs,
        onChange: handleOnChecked('showSelfReblogs'),
      });
    }

    items.push({
      text: intl.formatMessage(messages.showReplies),
      type: 'toggle',
      checked: filters?.showReplies,
      onChange: handleOnChecked('showReplies'),
    });

    if (features.quotePosts) {
      items.push({
        text: intl.formatMessage(messages.showQuotes),
        type: 'toggle',
        checked: filters?.showQuotes,
        onChange: handleOnChecked('showQuotes'),
      });
    }

    if (timelineType === 'home') {
      items.push({
        text: intl.formatMessage(messages.showDirect),
        type: 'toggle',
        checked: filters?.showDirect,
        onChange: handleOnChecked('showDirect'),
      });
    }

    items.push({
      text: intl.formatMessage(messages.hideNonMedia),
      type: 'toggle',
      checked: !filters?.showNonMedia,
      onChange: handleOnChecked('showNonMedia', true),
    });

    items.push({
      text: intl.formatMessage(messages.showMediaWithoutAltText),
      type: 'toggle',
      checked: filters?.showMediaWithoutAltText,
      onChange: handleOnChecked('showMediaWithoutAltText'),
    });

    items.push(null);

    return items;
  }, [timelineType, filters]);
};

const useTimelineFiltersList = (column: Extract<DeckColumn, { type: 'timeline' | 'hashtag' }>) => {
  const intl = useIntl();
  const filters = column.filters;

  if (!filters || !hasActiveFilters(filters)) return null;

  const list: Array<string> = [];

  if (!filters.showReblogs) list.push(intl.formatMessage(messages.filterReblogs));
  if (filters.showReblogs && !filters.showSelfReblogs)
    list.push(intl.formatMessage(messages.filterSelfReblogs));
  if (!filters.showReplies) list.push(intl.formatMessage(messages.filterReplies));
  if (!filters.showQuotes) list.push(intl.formatMessage(messages.filterQuotes));
  if (!filters.showDirect) list.push(intl.formatMessage(messages.filterDirect));
  if (!filters.showNonMedia) list.push(intl.formatMessage(messages.filterNonMedia));
  if (!filters.showMediaWithoutAltText)
    list.push(intl.formatMessage(messages.filterMediaWithoutAltText));

  return intl.formatList(list);
};

type ExtractedDeckTimelineColumnHeader<T> = IDeckColumnHeader & {
  column: Extract<DeckColumn, { type: T }>;
};

const DeckTimelineColumnHeader: React.FC<ExtractedDeckTimelineColumnHeader<'timeline'>> = ({
  column,
  ...props
}) => {
  const title = useTimelineHeading(column.timeline);
  const icon = getTimelineIcon(column.timeline);
  const items = useTimelineFiltersOptions(column);
  const filtersList = useTimelineFiltersList(column);

  const { data: list } = useList(
    column.timeline.startsWith('list:') ? column.timeline.split(':')[1] : undefined,
  );

  return (
    <DeckColumHeaderInner
      column={column}
      {...props}
      icon={icon}
      emoji={list?.emoji || undefined}
      emojiUrl={list?.emoji_url || undefined}
      title={title}
      subtitle={
        TIMELINE_SUBTITLES[column.timeline.split(':')[0] as keyof typeof TIMELINE_SUBTITLES] ||
        (filtersList ? (
          <FormattedMessage
            id='column.deck.timeline.heading.filtered'
            defaultMessage='Hiding {filters}'
            values={{ filters: filtersList }}
          />
        ) : undefined)
      }
      items={items}
    />
  );
};

const NOTIFICATION_COLUMN_FILTER_TITLES = {
  all: (
    <FormattedMessage
      id='notifications.filter.all.description'
      defaultMessage='All notifications'
    />
  ),
  mention: <FormattedMessage id='notifications.filter.mentions' defaultMessage='Mentions' />,
  status: (
    <FormattedMessage
      id='notifications.filter.statuses'
      defaultMessage='Updates from people you follow'
    />
  ),
  favourite: <FormattedMessage id='notifications.filter.favourites' defaultMessage='Likes' />,
  reblog: <FormattedMessage id='notifications.filter.boosts' defaultMessage='Reposts' />,
  poll: <FormattedMessage id='notifications.filter.polls' defaultMessage='Poll results' />,
  events: <FormattedMessage id='notifications.filter.events' defaultMessage='Events' />,
  follow: <FormattedMessage id='notifications.filter.follows' defaultMessage='New followers' />,
} as const;

const DeckNotificationsColumnHeader: React.FC<
  ExtractedDeckTimelineColumnHeader<'notifications'>
> = ({ column, ...props }) => (
  <DeckColumHeaderInner
    column={column}
    {...props}
    icon={iconBell}
    title={<FormattedMessage id='column.notifications' defaultMessage='Notifications' />}
    subtitle={NOTIFICATION_COLUMN_FILTER_TITLES[column.filter]}
  />
);

const DeckAccountColumnHeader: React.FC<ExtractedDeckTimelineColumnHeader<'account'>> = ({
  column,
  ...props
}) => {
  const intl = useIntl();

  const { data: ownAccount } = useOwnAccount();
  const { data: otherAccount } = useAccount(column.accountId);

  const account = column.accountId === 'self' ? ownAccount : otherAccount;

  const title = account ? `@${account.acct}` : column.accountId;
  let subtitle;
  if (column.showPinned) {
    if (column.excludeReplies) {
      subtitle = (
        <FormattedMessage
          id='column.deck.account.heading.pinned'
          defaultMessage='With pinned posts, no replies'
        />
      );
    } else {
      subtitle = (
        <FormattedMessage
          id='column.deck.account.heading.pinned_with_replies'
          defaultMessage='With pinned posts and replies'
        />
      );
    }
  } else if (column.excludeReplies) {
    subtitle = (
      <FormattedMessage id='column.deck.account.heading' defaultMessage='Without replies' />
    );
  } else {
    subtitle = (
      <FormattedMessage
        id='column.deck.account.heading.with_replies'
        defaultMessage='With replies'
      />
    );
  }

  const items = useMemo(() => {
    if (column.type === 'account') {
      const menu: Menu = [
        {
          text: intl.formatMessage(messages.showReplies),
          type: 'toggle',
          checked: !column.excludeReplies,
          onChange: (value) => updateDeckColumn(column.id, { excludeReplies: !value }),
        },
        {
          text: intl.formatMessage(messages.showPinned),
          type: 'toggle',
          checked: column.showPinned,
          onChange: (value) => updateDeckColumn(column.id, { showPinned: value }),
        },
        null,
      ];

      return menu;
    }

    return undefined;
  }, [intl, column]);

  return (
    <DeckColumHeaderInner
      column={column}
      {...props}
      icon={iconUser}
      title={title}
      subtitle={subtitle}
      items={items}
    />
  );
};

const DeckSearchColumnHeader: React.FC<ExtractedDeckTimelineColumnHeader<'search'>> = ({
  column,
  ...props
}) => (
  <DeckColumHeaderInner
    column={column}
    {...props}
    icon={iconMagnifyingGlass}
    title={<FormattedMessage id='column.search' defaultMessage='Search' />}
    subtitle={
      column.searchType === 'accounts' ? (
        <FormattedMessage
          id='column.deck.search.heading.accounts'
          defaultMessage='Accounts matching "{term}"'
          values={{ term: column.query }}
        />
      ) : column.searchType === 'statuses' ? (
        <FormattedMessage
          id='column.deck.search.heading.statuses'
          defaultMessage='Posts matching "{term}"'
          values={{ term: column.query }}
        />
      ) : (
        <FormattedMessage
          id='column.deck.search.heading.hashtags'
          defaultMessage='Hashtags matching "{term}"'
          values={{ term: column.query }}
        />
      )
    }
  />
);

const DeckBookmarksColumnHeader: React.FC<ExtractedDeckTimelineColumnHeader<'bookmarks'>> = ({
  column,
  ...props
}) => {
  const { data: bookmarkFolder } = useBookmarkFolder(
    column.folderId !== 'all' ? column.folderId : undefined,
  );

  const title = bookmarkFolder?.name || (
    <FormattedMessage id='column.deck.bookmarks.heading.all' defaultMessage='All bookmarks' />
  );
  const subtitle = bookmarkFolder ? (
    <FormattedMessage id='column.deck.bookmarks.heading.folder' defaultMessage='Bookmark folder' />
  ) : undefined;

  return (
    <DeckColumHeaderInner
      column={column}
      {...props}
      icon={iconBookmarks}
      emoji={bookmarkFolder?.emoji || undefined}
      emojiUrl={bookmarkFolder?.emoji_url || undefined}
      subtitle={subtitle}
      title={title}
    />
  );
};

const DeckHashtagColumnHeader: React.FC<ExtractedDeckTimelineColumnHeader<'hashtag'>> = ({
  column,
  ...props
}) => {
  const items = useTimelineFiltersOptions(column);
  const filtersList = useTimelineFiltersList(column);

  return (
    <DeckColumHeaderInner
      column={column}
      {...props}
      icon={iconHash}
      title={`#${column.hashtag}`}
      subtitle={
        filtersList ? (
          <FormattedMessage
            id='column.deck.hashtag.heading.filtered'
            defaultMessage='Posts tagged "{hashtag}" without {filters}'
            values={{ hashtag: column.hashtag, filters: filtersList }}
          />
        ) : (
          <FormattedMessage
            id='column.deck.hashtag.heading'
            defaultMessage='Posts tagged "{hashtag}"'
            values={{ hashtag: column.hashtag }}
          />
        )
      }
      items={items}
    />
  );
};

const DeckFallbackColumnHeader: React.FC<IDeckColumnHeader> = ({ column, ...props }) => {
  const title = useColumnTitle(column);
  const icon = useColumnIcon(column);

  return <DeckColumHeaderInner column={column} {...props} icon={icon} title={title} />;
};

type IDeckColumnHeader = Omit<IDeckColumn, 'highlight'>;

const DeckColumnHeader: React.FC<IDeckColumnHeader> = ({ column, ...props }) => {
  switch (column.type) {
    case 'timeline':
      return <DeckTimelineColumnHeader column={column} {...props} />;
    case 'notifications':
      return <DeckNotificationsColumnHeader column={column} {...props} />;
    case 'account':
      return <DeckAccountColumnHeader column={column} {...props} />;
    case 'search':
      return <DeckSearchColumnHeader column={column} {...props} />;
    case 'bookmarks':
      return <DeckBookmarksColumnHeader column={column} {...props} />;
    case 'hashtag':
      return <DeckHashtagColumnHeader column={column} {...props} />;
    default:
      return <DeckFallbackColumnHeader column={column} {...props} />;
  }
};

export { DeckColumnHeader };
