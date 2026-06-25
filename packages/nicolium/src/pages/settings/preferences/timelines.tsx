import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { changeSetting } from '@/actions/settings';
import List, { ListItem } from '@/components/list';
import { CardTitle } from '@/components/ui/card';
import Column from '@/components/ui/column';
import Form from '@/components/ui/form';
import { SelectDropdown } from '@/components/ui/select-dropdown';
import Toggle from '@/components/ui/toggle';
import { useTimelineFiltersOptions } from '@/hooks/use-timeline-filters-options';
import { useSettings } from '@/stores/settings';

const HOUR = 1000 * 60 * 60;
const DAY = 24 * HOUR;

const HIDE_FOLLOWED_REPOSTS_OPTIONS = [
  { value: 1 * HOUR, type: 'hours', count: 1 },
  { value: 6 * HOUR, type: 'hours', count: 6 },
  { value: 12 * HOUR, type: 'hours', count: 12 },
  { value: 1 * DAY, type: 'days', count: 1 },
  { value: 3 * DAY, type: 'days', count: 3 },
  { value: 7 * DAY, type: 'week', count: 1 },
] as const;

const messages = defineMessages({
  heading: { id: 'preferences.heading.timelines', defaultMessage: 'Timelines settings' },
  hideFollowedReposts: {
    id: 'timeline_filters.hide_followed_reposts.label',
    defaultMessage: 'Hide recent reposts of followed accounts',
  },
  hideFollowedRepostsOff: {
    id: 'timeline_filters.hide_followed_reposts.off',
    defaultMessage: 'Don’t hide',
  },
  hideFollowedRepostsHours: {
    id: 'timeline_filters.hide_followed_reposts.hours',
    defaultMessage: '{count, plural, one {# hour} other {# hours}}',
  },
  hideFollowedRepostsDays: {
    id: 'timeline_filters.hide_followed_reposts.days',
    defaultMessage: '{count, plural, one {# day} other {# days}}',
  },
  hideFollowedRepostsWeek: {
    id: 'timeline_filters.hide_followed_reposts.week',
    defaultMessage: '1 week',
  },
});

interface ITimelineFilters {
  timeline: Parameters<typeof useTimelineFiltersOptions>[0];
}

const TimelineFilters: React.FC<ITimelineFilters> = ({ timeline }) => {
  const intl = useIntl();
  const items = useTimelineFiltersOptions(timeline);
  const { timelines } = useSettings();

  const hideFollowedReposts = timelines[timeline]?.hideFollowedReposts ?? null;

  const hideFollowedRepostsItems = React.useMemo(() => {
    const result: Record<string, string> = {
      off: intl.formatMessage(messages.hideFollowedRepostsOff),
    };

    for (const option of HIDE_FOLLOWED_REPOSTS_OPTIONS) {
      result[String(option.value)] = intl.formatMessage(
        messages[
          option.type === 'week'
            ? 'hideFollowedRepostsWeek'
            : option.type === 'days'
              ? 'hideFollowedRepostsDays'
              : 'hideFollowedRepostsHours'
        ],
        { count: option.count },
      );
    }

    return result;
  }, [intl.locale]);

  const onHideFollowedRepostsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;

    changeSetting(['timelines', timeline], (previous: (typeof timelines)[typeof timeline]) => ({
      ...previous,
      hideFollowedReposts: value === 'off' ? null : Number(value),
    }));
  };

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
      {timeline === 'home' && (
        <ListItem label={intl.formatMessage(messages.hideFollowedReposts)}>
          <SelectDropdown
            className='settings-select'
            items={hideFollowedRepostsItems}
            value={hideFollowedReposts === null ? 'off' : String(hideFollowedReposts)}
            onChange={onHideFollowedRepostsChange}
          />
        </ListItem>
      )}
    </List>
  );
};

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
