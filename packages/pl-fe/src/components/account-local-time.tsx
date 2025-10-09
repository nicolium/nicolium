import { Account } from 'pl-api';
import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { useLoggedIn } from 'pl-fe/hooks/use-logged-in';

import HStack from './ui/hstack';
import Icon from './ui/icon';
import Text from './ui/text';

const supportedTimeZones = Intl.supportedValuesOf('timeZone');
const UTC_REGEX = /(GMT|UTC)([+-])([0-9]{1,2})/i;

const getSupportedTimezone = (value: string): string | false => {
  let foundTimezone = supportedTimeZones.find((tz) => value.toLowerCase().startsWith(tz.toLowerCase()));
  if (!foundTimezone) {
    const match = value.match(UTC_REGEX);
    if (match) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, __, sign, hours] = match;
      foundTimezone = supportedTimeZones.find((tz) => tz.toLowerCase() === `etc/gmt${sign === '+' ? '-' : '+'}${+hours}`);
    }
  }
  return foundTimezone || false;
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
    <HStack className='mt-1' alignItems='center' space={0.5} title={intl.formatMessage(messages.timezone, { timezone: field.value })}>
      <Icon
        src={require('@phosphor-icons/core/regular/clock.svg')}
        className='size-4 text-gray-800 dark:text-gray-200'
      />
      <Text size='sm'>
        {localTime}
        {me !== accountId && isTimezoneEqual && (
          <span className='text-green-500'> <FormattedMessage id='account.timezone.equal' defaultMessage='(same as you)' /></span>
        )}
      </Text>
    </HStack>
  );
};

export { AccountLocalTime as default };
