import clsx from 'clsx';
import React from 'react';
import { defineMessages, FormattedDate, FormattedMessage, useIntl } from 'react-intl';

import Badge from '@/components/badge';
import Card, { CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import Column from '@/components/ui/column';
import Icon from '@/components/ui/icon';
import Spinner from '@/components/ui/spinner';
import { useOauthTokensQuery, useRevokeOauthTokenMutation } from '@/queries/security/oauth-tokens';
import { useAuthStore } from '@/stores/auth';
import { useModalsActions } from '@/stores/modals';

import type { OauthToken } from 'pl-api';

const messages = defineMessages({
  header: { id: 'column.tokens', defaultMessage: 'Active sessions' },
  revokeSessionHeading: {
    id: 'confirmations.revoke_session.heading',
    defaultMessage: 'Revoke current session',
  },
});

interface IAuthToken {
  token: OauthToken;
  isCurrent: boolean;
}

const AuthToken: React.FC<IAuthToken> = ({ token, isCurrent }) => {
  const intl = useIntl();

  const revokeMutation = useRevokeOauthTokenMutation(token.id);

  const { openModal } = useModalsActions();

  const handleRevoke = () => {
    if (isCurrent)
      openModal('CONFIRM', {
        heading: intl.formatMessage(messages.revokeSessionHeading),
        message: (
          <FormattedMessage
            id='confirmations.revoke_session.message'
            defaultMessage='You are about to revoke your current session. You will be signed out.'
          />
        ),
        confirm: (
          <FormattedMessage id='confirmations.revoke_session.confirm' defaultMessage='Revoke' />
        ),
        onConfirm: () => {
          revokeMutation.mutate();
        },
      });
    else {
      revokeMutation.mutate();
    }
  };

  return (
    <div className={clsx('⁂-token', { '⁂-token--current': isCurrent })}>
      <div className='⁂-token__content'>
        <p className='⁂-token__name'>
          {token.app_name}
          {token.app_website && (
            <a href={token.app_website} target='_blank' rel='noopener noreferrer'>
              <Icon src={require('@phosphor-icons/core/regular/arrow-square-out.svg')} />
            </a>
          )}
        </p>
        {token.scopes?.length > 0 && (
          <div className='⁂-token__tokens'>
            <p>
              <FormattedMessage id='security.tokens.scopes' defaultMessage='Scopes:' />
            </p>
            {token.scopes.map((scope) => (
              <Badge title={scope} slug='opaque' key={scope} />
            ))}
          </div>
        )}
        {token.created_at && (
          <p className='⁂-token__detail'>
            <FormattedMessage
              id='security.tokens.created_at'
              defaultMessage='Created on {date}'
              values={{
                date: (
                  <FormattedDate
                    value={token.created_at}
                    hour12
                    year='numeric'
                    month='short'
                    day='2-digit'
                    hour='numeric'
                    minute='2-digit'
                  />
                ),
              }}
            />
          </p>
        )}
        {token.last_used && (
          <p className='⁂-token__detail'>
            <FormattedMessage
              id='security.tokens.last_used'
              defaultMessage='Last used on {date}'
              values={{
                date: (
                  <FormattedDate
                    value={token.last_used}
                    hour12
                    year='numeric'
                    month='short'
                    day='2-digit'
                    hour='numeric'
                    minute='2-digit'
                  />
                ),
              }}
            />
          </p>
        )}
        {token.valid_until && (
          <p className='⁂-token__detail'>
            <FormattedMessage
              id='security.tokens.valid_until'
              defaultMessage='Expires on {date}'
              values={{
                date: (
                  <FormattedDate
                    value={token.valid_until}
                    hour12
                    year='numeric'
                    month='short'
                    day='2-digit'
                    hour='numeric'
                    minute='2-digit'
                  />
                ),
              }}
            />
          </p>
        )}
      </div>
      <div className={clsx('⁂-token__actions')}>
        <button onClick={handleRevoke}>
          <FormattedMessage id='security.tokens.revoke' defaultMessage='Revoke' />
        </button>
      </div>
    </div>
  );
};

const AuthTokenListPage: React.FC = () => {
  const intl = useIntl();

  const { data: tokens } = useOauthTokensQuery();

  const currentTokenId = useAuthStore((state) => {
    const currentToken = Object.values(state.tokens).find((token) => token.me === state.me);

    return currentToken?.id;
  });

  const body = tokens ? (
    <div className='⁂-tokens'>
      {tokens.map((token) => (
        <AuthToken
          key={token.id}
          token={token}
          isCurrent={token.is_current ?? String(token.id) === currentTokenId}
        />
      ))}
    </div>
  ) : (
    <Spinner />
  );

  return (
    <Column label={intl.formatMessage(messages.header)} transparent withHeader={false}>
      <Card variant='rounded'>
        <CardHeader backHref='/settings'>
          <CardTitle title={intl.formatMessage(messages.header)} />
        </CardHeader>

        <CardBody>{body}</CardBody>
      </Card>
    </Column>
  );
};

export { AuthTokenListPage as default };
