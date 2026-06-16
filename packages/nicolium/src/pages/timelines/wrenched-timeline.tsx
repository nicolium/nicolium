import iconDotsThreeVertical from '@phosphor-icons/core/regular/dots-three-vertical.svg';
import iconWrench from '@phosphor-icons/core/regular/wrench.svg';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { WrenchedTimelineColumn } from '@/columns/timeline';
import DropdownMenu from '@/components/dropdown-menu';
import { TimelinePicker } from '@/components/timeline-picker';
import { TimelineRefreshButton } from '@/components/timeline-refresh-button';
import Column from '@/components/ui/column';
import { useTimelineFiltersOptions } from '@/hooks/use-timeline-filters-options';
import { useSettings } from '@/stores/settings';

const messages = defineMessages({
  title: { id: 'column.wrenched', defaultMessage: 'Recent wrenches timeline' },
});

const WrenchedTimelinePage = () => {
  const intl = useIntl();
  const items = useTimelineFiltersOptions('wrenched', 'wrenched');
  const { defaultTimeline } = useSettings();

  return (
    <Column
      className='timeline-column'
      label={intl.formatMessage(messages.title)}
      title={<TimelinePicker active='wrenched' />}
      truncateTitle={false}
      action={
        <>
          <TimelineRefreshButton timelineId='wrenched' />
          <DropdownMenu items={items} src={iconDotsThreeVertical} forceDropdown />
        </>
      }
      withBack={defaultTimeline !== 'wrenched'}
    >
      <WrenchedTimelineColumn
        emptyMessageText={
          <FormattedMessage
            id='empty_column.wrenched'
            defaultMessage='There is nothing here! 🔧 a public post to fill it up'
          />
        }
        emptyMessageIcon={iconWrench}
      />
    </Column>
  );
};

export { WrenchedTimelinePage as default };
