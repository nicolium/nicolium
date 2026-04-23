import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import List, { ListItem } from '@/components/list';
import { CardTitle } from '@/components/ui/card';
import Column from '@/components/ui/column';
import Form from '@/components/ui/form';
import Toggle from '@/components/ui/toggle';
import { useTimelineFiltersOptions } from '@/hooks/use-timeline-filters-options';

interface ITimelineFilters {
  timeline: Parameters<typeof useTimelineFiltersOptions>[0];
}

const TimelineFilters: React.FC<ITimelineFilters> = ({ timeline }) => {
  const items = useTimelineFiltersOptions(timeline);

  return (
    <List>
      {items.map((item) =>
        item === null || item.icon || !item.onChange ? null : (
          <ListItem key={item.text} label={item.text}>
            <Toggle
              checked={item.checked}
              onChange={({ target }) => item.onChange!(target.checked)}
              disabled={item.disabled}
            />
          </ListItem>
        ),
      )}
    </List>
  );
};

const messages = defineMessages({
  heading: { id: 'preferences.heading.timelines', defaultMessage: 'Timelines settings' },
});

const TimelinesPreferences: React.FC = () => {
  const intl = useIntl();

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Form>
        <CardTitle
          title={
            <FormattedMessage id='home.column_settings.heading' defaultMessage='Home timeline' />
          }
        />

        <TimelineFilters timeline='home' />
      </Form>
    </Column>
  );
};

export { TimelinesPreferences as default };
