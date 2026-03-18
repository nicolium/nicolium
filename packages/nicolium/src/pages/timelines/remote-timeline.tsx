import { useNavigate } from '@tanstack/react-router';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { PublicTimelineColumn } from '@/columns/timeline';
import DropdownMenu from '@/components/dropdown-menu';
import { TimelinePicker } from '@/components/timeline-picker';
import Column from '@/components/ui/column';
import IconButton from '@/components/ui/icon-button';
import Text from '@/components/ui/text';
import { remoteTimelineRoute } from '@/features/ui/router';
import { useTimelineFiltersOptions } from '@/hooks/use-timeline-filters-options';
import { useSettings } from '@/stores/settings';

const messages = defineMessages({
  close: { id: 'remote_timeline.close', defaultMessage: 'Close remote timeline' },
});

/** View statuses from a remote instance. */
const RemoteTimelinePage: React.FC = () => {
  const { instance } = remoteTimelineRoute.useParams();
  const items = useTimelineFiltersOptions('public');

  const intl = useIntl();
  const navigate = useNavigate();

  const settings = useSettings();

  const pinned = settings.remote_timeline.pinnedHosts.includes(instance);

  const handleCloseClick: React.MouseEventHandler = () => {
    navigate({ to: '/timeline/fediverse' });
  };

  return (
    <Column
      label={instance}
      title={<TimelinePicker active={`instance:${instance}`} />}
      truncateTitle={false}
      action={
        <DropdownMenu
          items={items}
          src={require('@phosphor-icons/core/regular/dots-three-vertical.svg')}
        />
      }
    >
      {!pinned && (
        <div className='mb-4 flex gap-2 px-2'>
          <IconButton
            className='text-gray-400 hover:text-gray-600'
            iconClassName='h-5 w-5'
            src={require('@phosphor-icons/core/regular/x.svg')}
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
        emptyMessageIcon={require('@phosphor-icons/core/regular/chat-centered-text.svg')}
        instance={instance}
      />
    </Column>
  );
};

export { RemoteTimelinePage as default };
