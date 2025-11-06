import clsx from 'clsx';
import React from 'react';
import { defineMessages, useIntl, type FormatDateOptions } from 'react-intl';

import AccountLocalTime from 'pl-fe/components/account-local-time';
import Markup from 'pl-fe/components/markup';
import { ParsedContent } from 'pl-fe/components/parsed-content';
import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import CryptoAddress from 'pl-fe/features/crypto-donate/components/crypto-address';
import LightningAddress from 'pl-fe/features/crypto-donate/components/lightning-address';
import coinDB from 'pl-fe/features/crypto-donate/utils/manifest-map';
import Emojify from 'pl-fe/features/emoji/emojify';
import { unescapeHTML } from 'pl-fe/utils/html';

import type { Account } from 'pl-api';

const getTicker = (value: string): string => (value.match(/\$([a-zA-Z]*)/i) || [])[1];
const isTicker = (value: string): boolean => {
  const ticker = getTicker(value);
  return Boolean(ticker) && Boolean(coinDB[ticker.toLowerCase()]);
};
const isZapEmoji = (value: string) => /^\u26A1[\uFE00-\uFE0F]?$/.test(value);

const isTimezoneLabel = (value: string) => /^time( |)zone$/i.test(value);

const messages = defineMessages({
  linkVerifiedOn: { id: 'account.link_verified_on', defaultMessage: 'Ownership of this link was checked on {date}' },
});

const dateFormatOptions: FormatDateOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour12: true,
  hour: 'numeric',
  minute: '2-digit',
};

interface IProfileField {
  accountId: string;
  field: Account['fields'][number];
  emojis?: Account['emojis'];
}

/** Renders a single profile field. */
const ProfileField: React.FC<IProfileField> = ({ accountId, field, emojis }) => {
  const intl = useIntl();

  if (isTicker(field.name)) {
    return (
      <CryptoAddress
        ticker={getTicker(field.name).toLowerCase()}
        address={unescapeHTML(field.value)}
      />
    );
  } else if (isZapEmoji(field.name) && field.value.includes('@')) {
    return <LightningAddress address={unescapeHTML(field.value)} />;
  }

  return (
    <dl>
      <dt title={field.name}>
        <Markup weight='bold' tag='span'>
          <Emojify text={field.name} emojis={emojis} />
        </Markup>
      </dt>

      <dd
        className={clsx({ 'text-success-500': field.verified_at })}
        title={unescapeHTML(field.value)}
      >
        <HStack space={2} alignItems='center'>
          {field.verified_at && (
            <span className='flex-none' title={intl.formatMessage(messages.linkVerifiedOn, { date: intl.formatDate(field.verified_at, dateFormatOptions) })}>
              <Icon src={require('@phosphor-icons/core/regular/check.svg')} />
            </span>
          )}

          <Markup className='overflow-hidden break-words' tag='span'>
            <ParsedContent html={field.value} emojis={emojis} />
          </Markup>
        </HStack>
        {isTimezoneLabel(field.name) && (
          <AccountLocalTime accountId={accountId} field={field} />
        )}
      </dd>
    </dl>
  );
};

export { ProfileField as default, isTimezoneLabel };
