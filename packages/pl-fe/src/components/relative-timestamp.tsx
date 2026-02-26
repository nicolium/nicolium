import React, { useCallback, useEffect, useRef, useState } from 'react';
import { defineMessages, useIntl, FormatDateOptions } from 'react-intl';

import Text, { IText } from './ui/text';

const messages = defineMessages({
  justNow: { id: 'relative_time.just_now', defaultMessage: 'now' },
  seconds: { id: 'relative_time.seconds', defaultMessage: '{number}s' },
  minutes: { id: 'relative_time.minutes', defaultMessage: '{number}m' },
  hours: { id: 'relative_time.hours', defaultMessage: '{number}h' },
  days: { id: 'relative_time.days', defaultMessage: '{number}d' },
  momentsRemaining: { id: 'time_remaining.moments', defaultMessage: 'Moments remaining' },
  secondsRemaining: {
    id: 'time_remaining.seconds',
    defaultMessage: '{number, plural, one {# second} other {# seconds}} left',
  },
  minutesRemaining: {
    id: 'time_remaining.minutes',
    defaultMessage: '{number, plural, one {# minute} other {# minutes}} left',
  },
  hoursRemaining: {
    id: 'time_remaining.hours',
    defaultMessage: '{number, plural, one {# hour} other {# hours}} left',
  },
  daysRemaining: {
    id: 'time_remaining.days',
    defaultMessage: '{number, plural, one {# day} other {# days}} left',
  },
});

const dateFormatOptions: FormatDateOptions = {
  hour12: true,
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  hour: 'numeric',
  minute: '2-digit',
};

const shortDateFormatOptions: FormatDateOptions = {
  month: 'short',
  day: 'numeric',
};

const SECOND = 1000;
const MINUTE = 1000 * 60;
const HOUR = 1000 * 60 * 60;
const DAY = 1000 * 60 * 60 * 24;

const MAX_DELAY = 2147483647;

const selectUnits = (delta: number) => {
  const absDelta = Math.abs(delta);

  if (absDelta < MINUTE) {
    return 'second';
  } else if (absDelta < HOUR) {
    return 'minute';
  } else if (absDelta < DAY) {
    return 'hour';
  }

  return 'day';
};

const getUnitDelay = (units: string) => {
  switch (units) {
    case 'second':
      return SECOND;
    case 'minute':
      return MINUTE;
    case 'hour':
      return HOUR;
    case 'day':
      return DAY;
    default:
      return MAX_DELAY;
  }
};

interface IRelativeTimestamp extends IText {
  timestamp: string;
  year?: number;
  futureDate?: boolean;
}

/** Displays a timestamp compared to the current time, eg "1m" for one minute ago. */
const RelativeTimestamp: React.FC<IRelativeTimestamp> = ({
  timestamp,
  year = new Date().getFullYear(),
  futureDate,
  theme = 'inherit',
  ...props
}) => {
  const intl = useIntl();
  const [now, setNow] = useState(Date.now);
  const timerRef = useRef<NodeJS.Timeout>(undefined);

  const scheduleNextUpdate = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const delta = new Date(timestamp).getTime() - now;
    const unitDelay = getUnitDelay(selectUnits(delta));
    const unitRemainder = Math.abs(delta % unitDelay);
    const updateInterval = 1000 * 10;
    const delay =
      delta < 0
        ? Math.max(updateInterval, unitDelay - unitRemainder)
        : Math.max(updateInterval, unitRemainder);

    timerRef.current = setTimeout(() => {
      setNow(Date.now());
    }, delay);
  }, [timestamp, now]);

  useEffect(() => {
    setNow(Date.now());
  }, [timestamp]);

  useEffect(() => {
    scheduleNextUpdate();
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [scheduleNextUpdate]);

  const date = new Date(timestamp);
  const delta = now - date.getTime();

  let relativeTime: string;
  if (futureDate) {
    const futureDelta = date.getTime() - now;

    if (futureDelta < 10 * SECOND) {
      relativeTime = intl.formatMessage(messages.momentsRemaining);
    } else if (futureDelta < MINUTE) {
      relativeTime = intl.formatMessage(messages.secondsRemaining, {
        number: Math.floor(futureDelta / SECOND),
      });
    } else if (futureDelta < HOUR) {
      relativeTime = intl.formatMessage(messages.minutesRemaining, {
        number: Math.floor(futureDelta / MINUTE),
      });
    } else if (futureDelta < DAY) {
      relativeTime = intl.formatMessage(messages.hoursRemaining, {
        number: Math.floor(futureDelta / HOUR),
      });
    } else {
      relativeTime = intl.formatMessage(messages.daysRemaining, {
        number: Math.floor(futureDelta / DAY),
      });
    }
  } else if (delta < 10 * SECOND) {
    relativeTime = intl.formatMessage(messages.justNow);
  } else if (delta < 7 * DAY) {
    if (delta < MINUTE) {
      relativeTime = intl.formatMessage(messages.seconds, { number: Math.floor(delta / SECOND) });
    } else if (delta < HOUR) {
      relativeTime = intl.formatMessage(messages.minutes, { number: Math.floor(delta / MINUTE) });
    } else if (delta < DAY) {
      relativeTime = intl.formatMessage(messages.hours, { number: Math.floor(delta / HOUR) });
    } else {
      relativeTime = intl.formatMessage(messages.days, { number: Math.floor(delta / DAY) });
    }
  } else if (date.getFullYear() === year) {
    relativeTime = intl.formatDate(date, shortDateFormatOptions);
  } else {
    relativeTime = intl.formatDate(date, { ...shortDateFormatOptions, year: 'numeric' });
  }

  return (
    <Text {...props} theme={theme} tag='time' title={intl.formatDate(date, dateFormatOptions)}>
      {relativeTime}
    </Text>
  );
};

export { dateFormatOptions, RelativeTimestamp as default };
