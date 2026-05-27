import iconClock from '@phosphor-icons/core/regular/clock.svg';
import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { useLoggedIn } from '@/hooks/use-logged-in';

import Icon from '../ui/icon';

import type { Account } from 'pl-api';

const supportedTimeZones = Intl.supportedValuesOf('timeZone');
const UTC_REGEX = /(GMT|UTC)([+-])([0-9]{1,2})/i;

const getSupportedTimezone = (value: string): string | false => {
  let foundTimezone = supportedTimeZones.find((tz) =>
    value.toLowerCase().startsWith(tz.toLowerCase()),
  );
  if (!foundTimezone) {
    const match = value.match(UTC_REGEX);
    if (match) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, __, sign, hours] = match;
      foundTimezone = supportedTimeZones.find(
        (tz) => tz.toLowerCase() === `etc/gmt${sign === '+' ? '-' : '+'}${+hours}`,
      );
    }
  }
  return foundTimezone ?? false;
};

const messages = defineMessages({
  timezone: { id: 'account.timezone', defaultMessage: 'Timezone: {timezone}' },
});

interface IAccountLocalTime {
  accountId: string;
  field: Account['fields'][number];
}

const AccountLocalTime: React.FC<IAccountLocalTime> = ({ accountId, field }) => {
  const intl = useIntl();

  const { me } = useLoggedIn();
  const [localTime, setLocalTime] = useState<string | null>(null);
  const [isTimezoneEqual, setIsTimezoneEqual] = useState<boolean>(false);

  useEffect(() => {
    const timezone = getSupportedTimezone(field.value);
    if (!timezone) return;

    const format = Intl.DateTimeFormat(intl.locale, {
      timeZone: timezone,
      timeStyle: 'short',
    });

    {
      const dateNow = new Date();
      const yourTime = dateNow.toLocaleString(intl.locale, { timeStyle: 'short' });
      const userLocalTime = format.format(dateNow);
      setLocalTime(userLocalTime);
      setIsTimezoneEqual(userLocalTime === yourTime);
    }

    let timer: NodeJS.Timeout | null = null;
    const init = setInterval(() => {
      if (new Date().getSeconds() === 0) {
        clearInterval(init);
        timer = setInterval(() => {
          setLocalTime(format.format(new Date()));
        }, 60000);
      }
    }, 1000);

    return () => {
      if (timer) clearInterval(timer);
      clearInterval(init);
    };
  }, [field.name]);

  if (!localTime) return null;

  return (
    <div
      className='account-info__details__item'
      title={intl.formatMessage(messages.timezone, { timezone: field.value })}
    >
      <Icon src={iconClock} />
      <p>
        {localTime}
        {me !== accountId && isTimezoneEqual && (
          <strong>
            {' '}
            <FormattedMessage id='account.timezone.equal' defaultMessage='(same as you)' />
          </strong>
        )}
      </p>
    </div>
  );
};

export { AccountLocalTime as default };
