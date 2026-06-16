import iconChatCenteredText from '@phosphor-icons/core/regular/chat-centered-text.svg';
import iconDotsThreeVertical from '@phosphor-icons/core/regular/dots-three-vertical.svg';
import React from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { HomeTimelineColumn } from '@/columns/timeline';
import DropdownMenu from '@/components/dropdown-menu';
import { Link } from '@/components/link';
import { TimelinePicker } from '@/components/timeline-picker';
import { TimelineRefreshButton } from '@/components/timeline-refresh-button';
import Column from '@/components/ui/column';
import { useFeatures } from '@/hooks/use-features';
import { useTimelineFiltersOptions } from '@/hooks/use-timeline-filters-options';
import { useInstance } from '@/stores/instance';
import { useSettings } from '@/stores/settings';
import { useUiStore } from '@/stores/ui';

const messages = defineMessages({
  title: { id: 'column.home', defaultMessage: 'Home' },
});

// TODO restore this
// const isPartial = useAppSelector((state) => state.timelines.home?.isPartial);

// // Mastodon generates the feed in Redis, and can return a partial timeline
// // (HTTP 206) for new users. Poll until we get a full page of results.
// const checkIfReloadNeeded = useCallback((isPartial: boolean) => {
//   if (isPartial) {
//     polling.current = setInterval(() => {
//       fetchHomeTimeline();
//     }, 3000);
//   } else if (polling.current) {
//     clearInterval(polling.current);
//     polling.current = null;
//   }

//   return () => {
//     if (polling.current) {
//       clearInterval(polling.current);
//       polling.current = null;
//     }
//   };
// }, []);

const HomeTimelinePage: React.FC = () => {
  const intl = useIntl();
  const features = useFeatures();
  const instance = useInstance();
  const { defaultTimeline } = useSettings();

  const items = useTimelineFiltersOptions('home', 'home');
  const { isSledzikRemoved } = useUiStore();

  if (isSledzikRemoved) return null;

  return (
    <Column
      className='home-timeline'
      label={intl.formatMessage(messages.title)}
      title={<TimelinePicker active='home' />}
      withBack={defaultTimeline !== 'home'}
      truncateTitle={false}
      action={
        <>
          <TimelineRefreshButton timelineId='home' />
          <DropdownMenu items={items} src={iconDotsThreeVertical} forceDropdown />
        </>
      }
    >
      <HomeTimelineColumn
        emptyMessageText={
          <div className='home-timeline__empty'>
            <h2>
              <FormattedMessage
                id='empty_column.home.title'
                defaultMessage='You’re not following anyone yet'
              />
            </h2>

            <p>
              <FormattedMessage
                id='empty_column.home.subtitle'
                defaultMessage='{siteTitle} gets more interesting once you follow other users.'
                values={{ siteTitle: instance.title }}
              />
            </p>

            {features.federating && (
              <p>
                <FormattedMessage
                  id='empty_column.home'
                  defaultMessage='Or you can visit {public} to get started and meet other users.'
                  values={{
                    public: (
                      <Link to='/timeline/local'>
                        <FormattedMessage
                          id='empty_column.home.local_tab'
                          defaultMessage='the Local tab'
                        />
                      </Link>
                    ),
                  }}
                />
              </p>
            )}
          </div>
        }
        emptyMessageIcon={iconChatCenteredText}
      />
    </Column>
  );
};

export { HomeTimelinePage as default };
