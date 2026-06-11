import iconDotsThreeVertical from '@phosphor-icons/core/regular/dots-three-vertical.svg';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { HashtagTimelineColumn } from '@/columns/timeline';
import DropdownMenu from '@/components/dropdown-menu';
import { TimelineRefreshButton } from '@/components/timeline-refresh-button';
import Column from '@/components/ui/column';
import { useTimelineFiltersOptions } from '@/hooks/use-timeline-filters-options';
import { hashtagTimelineRoute } from '@/router';

import HashtagFollowToggle from './components/hashtag-follow-toggle';

const HashtagTimelinePage: React.FC = () => {
  const { hashtag } = hashtagTimelineRoute.useParams();

  const items = useTimelineFiltersOptions('hashtag');

  return (
    <Column
      label={`#${hashtag}`}
      action={
        <>
          <TimelineRefreshButton timelineId={`hashtag:${hashtag}`} />
          <DropdownMenu items={items} src={iconDotsThreeVertical} forceDropdown />
        </>
      }
    >
      <HashtagFollowToggle hashtag={hashtag} />

      <HashtagTimelineColumn
        hashtag={hashtag}
        emptyMessageText={
          <FormattedMessage
            id='empty_column.hashtag'
            defaultMessage='There is nothing in this hashtag yet.'
          />
        }
      />
    </Column>
  );
};

export { HashtagTimelinePage as default };
