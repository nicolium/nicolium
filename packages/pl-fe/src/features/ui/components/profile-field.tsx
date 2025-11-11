import clsx from 'clsx';
import React from 'react';
import { defineMessages, useIntl, type FormatDateOptions } from 'react-intl';

import AccountLocalTime from 'pl-fe/components/account-local-time';
import { ParsedContent } from 'pl-fe/components/parsed-content';
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
    <dl className={clsx('⁂-profile-field', { '⁂-profile-field--verified': field.verified_at })}>
      <dt title={field.name}>
        <span data-markup>
          <Emojify text={field.name} emojis={emojis} />
        </span>
      </dt>

      <dd title={unescapeHTML(field.value)}>
        <div className='⁂-profile-field__content'>
          {field.verified_at && (
            <span className='flex-none' title={intl.formatMessage(messages.linkVerifiedOn, { date: intl.formatDate(field.verified_at, dateFormatOptions) })}>
              <Icon src={require('@phosphor-icons/core/regular/check.svg')} />
            </span>
          )}

          <span data-markup>
            <ParsedContent html={field.value} emojis={emojis} />
          </span>
        </div>

        {isTimezoneLabel(field.name) && (
          <AccountLocalTime accountId={accountId} field={field} />
        )}
      </dd>
    </dl>
  );
};

export { ProfileField as default, isTimezoneLabel };
