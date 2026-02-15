import { useNavigate } from '@tanstack/react-router';
import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { fetchPublicTimeline } from '@/actions/timelines';
import { useRemoteStream } from '@/api/hooks/streaming/use-remote-stream';
import Column from '@/components/ui/column';
import HStack from '@/components/ui/hstack';
import IconButton from '@/components/ui/icon-button';
import Text from '@/components/ui/text';
import PinnedHostsPicker from '@/features/remote-timeline/components/pinned-hosts-picker';
import Timeline from '@/features/ui/components/timeline';
import { remoteTimelineRoute } from '@/features/ui/router';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useSettings } from '@/stores/settings';

/** View statuses from a remote instance. */
const RemoteTimelinePage: React.FC = () => {
  const { instance } = remoteTimelineRoute.useParams();

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const settings = useSettings();

  const timelineId = 'remote';
  const onlyMedia = settings.timelines.remote?.other.onlyMedia ?? false;

  const pinned = settings.remote_timeline.pinnedHosts.includes(instance);

  const handleCloseClick: React.MouseEventHandler = () => {
    navigate({ to: '/timeline/fediverse' });
  };

  const handleLoadMore = () => {
    dispatch(fetchPublicTimeline({ onlyMedia, instance }, true));
  };

  useRemoteStream({ instance, onlyMedia });

  useEffect(() => {
    dispatch(fetchPublicTimeline({ onlyMedia, instance }));
  }, [onlyMedia]);

  return (
    <Column label={instance}>
      {instance && <PinnedHostsPicker host={instance} />}

      {!pinned && (
        <HStack className='mb-4 px-2' space={2}>
          <IconButton
            className='text-gray-400 hover:text-gray-600'
            iconClassName='h-5 w-5'
            src={require('@phosphor-icons/core/regular/x.svg')}
            onClick={handleCloseClick}
          />
          <Text>
            <FormattedMessage
              id='remote_timeline.filter_message'
              defaultMessage='You are viewing the timeline of {instance}.'
              values={{ instance }}
            />
          </Text>
        </HStack>
      )}

      <Timeline
        loadMoreClassName='sm:pb-4 black:sm:pb-0 black:sm:mx-4'
        scrollKey={`${timelineId}_${instance}_timeline`}
        timelineId={`${timelineId}${onlyMedia ? ':media' : ''}:${instance}`}
        onLoadMore={handleLoadMore}
        emptyMessageText={
          <FormattedMessage
            id='empty_column.remote'
            defaultMessage='There is nothing here! Manually follow users from {instance} to fill it up.'
            values={{ instance }}
          />
        }
        emptyMessageIcon={require('@phosphor-icons/core/regular/chat-centered-text.svg')}
      />
    </Column>
  );
};

export { RemoteTimelinePage as default };
