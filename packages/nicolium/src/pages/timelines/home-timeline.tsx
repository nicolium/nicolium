import iconChatCenteredText from '@phosphor-icons/core/regular/chat-centered-text.svg';
import iconDotsThreeVertical from '@phosphor-icons/core/regular/dots-three-vertical.svg';
import React from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { HomeTimelineColumn } from '@/columns/timeline';
import DropdownMenu from '@/components/dropdown-menu';
import { Link } from '@/components/link';
import { TimelinePicker } from '@/components/timeline-picker';
import Column from '@/components/ui/column';
import Text from '@/components/ui/text';
import { useFeatures } from '@/hooks/use-features';
import { useTimelineFiltersOptions } from '@/hooks/use-timeline-filters-options';
import { useInstance } from '@/stores/instance';
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

  const items = useTimelineFiltersOptions('home');
  const { isSledzikRemoved } = useUiStore();

  if (isSledzikRemoved) return null;

  return (
    <Column
      className='py-0'
      label={intl.formatMessage(messages.title)}
      title={<TimelinePicker active='home' />}
      withBack={false}
      truncateTitle={false}
      action={<DropdownMenu items={items} src={iconDotsThreeVertical} />}
    >
      <HomeTimelineColumn
        emptyMessageText={
          <div className='flex flex-col gap-1'>
            <Text size='xl' weight='medium' align='center'>
              <FormattedMessage
                id='empty_column.home.title'
                defaultMessage="You're not following anyone yet"
              />
            </Text>

            <Text theme='muted' align='center'>
              <FormattedMessage
                id='empty_column.home.subtitle'
                defaultMessage='{siteTitle} gets more interesting once you follow other users.'
                values={{ siteTitle: instance.title }}
              />
            </Text>

            {features.federating && (
              <Text theme='muted' align='center'>
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
              </Text>
            )}
          </div>
        }
        emptyMessageIcon={iconChatCenteredText}
      />
    </Column>
  );
};

export { HomeTimelinePage as default };
