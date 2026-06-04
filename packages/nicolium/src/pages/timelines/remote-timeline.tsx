import iconChatCenteredText from '@phosphor-icons/core/regular/chat-centered-text.svg';
import iconDotsThreeVertical from '@phosphor-icons/core/regular/dots-three-vertical.svg';
import iconPushPinSlash from '@phosphor-icons/core/regular/push-pin-slash.svg';
import iconPushPin from '@phosphor-icons/core/regular/push-pin.svg';
import iconX from '@phosphor-icons/core/regular/x.svg';
import { useNavigate } from '@tanstack/react-router';
import React, { useMemo } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { changeSetting } from '@/actions/settings';
import { PublicTimelineColumn } from '@/columns/timeline';
import DropdownMenu from '@/components/dropdown-menu';
import { TimelinePicker } from '@/components/timeline-picker';
import { TimelineRefreshButton } from '@/components/timeline-refresh-button';
import Column from '@/components/ui/column';
import IconButton from '@/components/ui/icon-button';
import Text from '@/components/ui/text';
import { useTimelineFiltersOptions } from '@/hooks/use-timeline-filters-options';
import { remoteTimelineRoute } from '@/router';
import { useSettings } from '@/stores/settings';

const messages = defineMessages({
  close: { id: 'remote_timeline.close', defaultMessage: 'Close remote timeline' },
  pinHost: { id: 'remote_instance.pin_host', defaultMessage: 'Pin {host}' },
  unpinHost: { id: 'remote_instance.unpin_host', defaultMessage: 'Unpin {host}' },
});

/** View statuses from a remote instance. */
const RemoteTimelinePage: React.FC = () => {
  const { instance } = remoteTimelineRoute.useParams();

  const intl = useIntl();
  const navigate = useNavigate();

  const settings = useSettings();

  const {
    defaultTimeline,
    remote_timeline: { pinnedHosts },
  } = settings;
  const isPinned = pinnedHosts.includes(instance);

  const timelineFiltersOptions = useTimelineFiltersOptions(
    'public',
    isPinned ? `instance:${instance}` : undefined,
  );

  const handleCloseClick: React.MouseEventHandler = () => {
    navigate({ to: '/timeline/fediverse' });
  };

  const handlePinHost = () => {
    if (!isPinned) {
      changeSetting(
        ['remote_timeline', 'pinnedHosts'],
        [...settings.remote_timeline.pinnedHosts, instance],
      );
    } else {
      changeSetting(
        ['remote_timeline', 'pinnedHosts'],
        settings.remote_timeline.pinnedHosts.filter((value) => value !== instance),
      );
      if (defaultTimeline === `instance:${instance}`) {
        changeSetting(['defaultTimeline'], 'home');
      }
    }
  };

  const items = useMemo(
    () => [
      ...timelineFiltersOptions,
      null,
      {
        text: intl.formatMessage(isPinned ? messages.unpinHost : messages.pinHost, {
          host: instance,
        }),
        action: handlePinHost,
        icon: isPinned ? iconPushPinSlash : iconPushPin,
      },
    ],
    [timelineFiltersOptions, isPinned, instance],
  );

  return (
    <Column
      label={instance}
      title={<TimelinePicker active={`instance:${instance}`} />}
      truncateTitle={false}
      action={
        <>
          <TimelineRefreshButton timelineId={`public:remote:${instance}`} />
          <DropdownMenu items={items} src={iconDotsThreeVertical} forceDropdown />
        </>
      }
    >
      {!isPinned && (
        <div className='pinned-remote-timeline'>
          <IconButton
            src={iconX}
            onClick={handleCloseClick}
            title={intl.formatMessage(messages.close)}
          />
          <Text>
            <FormattedMessage
              id='remote_timeline.filter_message'
              defaultMessage='You are viewing the timeline of {instance}.'
              values={{ instance }}
            />
          </Text>
        </div>
      )}

      <PublicTimelineColumn
        emptyMessageText={
          <FormattedMessage
            id='empty_column.remote'
            defaultMessage='There is nothing here! Manually follow users from {instance} to fill it up.'
            values={{ instance }}
          />
        }
        emptyMessageIcon={iconChatCenteredText}
        instance={instance}
      />
    </Column>
  );
};

export { RemoteTimelinePage as default };
