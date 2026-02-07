import { Link } from '@tanstack/react-router';
import React, { useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { changeSetting } from '@/actions/settings';
import { fetchPublicTimeline } from '@/actions/timelines';
import { usePublicStream } from '@/api/hooks/streaming/use-public-stream';
import PullToRefresh from '@/components/pull-to-refresh';
import Accordion from '@/components/ui/accordion';
import Column from '@/components/ui/column';
import PinnedHostsPicker from '@/features/remote-timeline/components/pinned-hosts-picker';
import Timeline from '@/features/ui/components/timeline';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useInstance } from '@/hooks/use-instance';
import { useSettings } from '@/stores/settings';

const messages = defineMessages({
  title: { id: 'column.public', defaultMessage: 'Fediverse timeline' },
  dismiss: { id: 'fediverse_tab.explanation_box.dismiss', defaultMessage: 'Don\'t show again' },
});

const PublicTimelinePage = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const instance = useInstance();
  const settings = useSettings();
  const onlyMedia = settings.timelines.public?.other.onlyMedia ?? false;

  const timelineId = 'public';

  const explanationBoxExpanded = settings.explanationBox;
  const showExplanationBox = settings.showExplanationBox;

  const dismissExplanationBox = () => {
    dispatch(changeSetting(['showExplanationBox'], false));
  };

  const toggleExplanationBox = (setting: boolean) => {
    dispatch(changeSetting(['explanationBox'], setting));
  };

  const handleLoadMore = () => {
    dispatch(fetchPublicTimeline({ onlyMedia }, true));
  };

  const handleRefresh = () => dispatch(fetchPublicTimeline({ onlyMedia }));

  usePublicStream({ onlyMedia });

  useEffect(() => {
    dispatch(fetchPublicTimeline({ onlyMedia }, true));
  }, [onlyMedia]);

  return (
    <Column className='-mt-3 sm:mt-0' label={intl.formatMessage(messages.title)}>
      <PinnedHostsPicker />

      {showExplanationBox && (
        <Accordion
          headline={<FormattedMessage id='fediverse_tab.explanation_box.title' defaultMessage='What is the Fediverse?' />}
          action={dismissExplanationBox}
          actionIcon={require('@phosphor-icons/core/regular/x.svg')}
          actionLabel={intl.formatMessage(messages.dismiss)}
          expanded={explanationBoxExpanded}
          onToggle={toggleExplanationBox}
        >
          <FormattedMessage
            id='fediverse_tab.explanation_box.explanation'
            defaultMessage={'{site_title} is part of the Fediverse, a social network made up of thousands of independent social media sites (aka "servers"). Here, you can see public posts from across the Fediverse, including other servers. Pay attention to the full username after the second @ symbol to know which server a post is from. To see only {site_title} posts, visit {local}.'}
            values={{
              site_title: instance.title,
              local: (
                <Link className='underline' to='/timeline/local'>
                  <FormattedMessage id='empty_column.home.local_tab' defaultMessage='the Local tab' />
                </Link>
              ),
            }}
          />
        </Accordion>
      )}
      <PullToRefresh onRefresh={handleRefresh}>
        <Timeline
          loadMoreClassName='sm:pb-4 black:sm:pb-0 black:sm:mx-4'
          scrollKey={`${timelineId}_timeline`}
          timelineId={`${timelineId}${onlyMedia ? ':media' : ''}`}
          prefix='home'
          onLoadMore={handleLoadMore}
          emptyMessageText={<FormattedMessage id='empty_column.public' defaultMessage='There is nothing here! Write something publicly, or manually follow users from other servers to fill it up' />}
          emptyMessageIcon={require('@phosphor-icons/core/regular/chat-centered-text.svg')}
        />
      </PullToRefresh>
    </Column>
  );
};

export { PublicTimelinePage as default };
