import iconArrowsClockwise from '@phosphor-icons/core/regular/arrows-clockwise.svg';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { useTimeline, useTimelinesActions } from '@/stores/timelines';
import { userTouching } from '@/utils/is-mobile';

import IconButton from './ui/icon-button';

const messages = defineMessages({
  refresh: { id: 'timeline.refresh', defaultMessage: 'Refresh timeline' },
});

interface ITimelineRefreshButton {
  timelineId: string;
}

const TimelineRefreshButton: React.FC<ITimelineRefreshButton> = ({ timelineId }) => {
  const intl = useIntl();
  const { resetTimeline } = useTimelinesActions();
  const timeline = useTimeline(timelineId);

  const handleClick = () => {
    resetTimeline(timelineId);
  };

  if (userTouching.matches) return null;

  return (
    <IconButton
      disabled={timeline.isPending}
      className='timeline-refresh-button'
      title={intl.formatMessage(messages.refresh)}
      src={iconArrowsClockwise}
      onClick={handleClick}
    />
  );
};

export { TimelineRefreshButton };
