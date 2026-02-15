import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import React from 'react';
import { defineMessages, FormattedDate, FormattedMessage, useIntl } from 'react-intl';

import Badge from '@/components/badge';
import Button from '@/components/ui/button';
import Card, { CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import Column from '@/components/ui/column';
import HStack from '@/components/ui/hstack';
import Icon from '@/components/ui/icon';
import Spinner from '@/components/ui/spinner';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';
import { useAppSelector } from '@/hooks/use-app-selector';
import {
  oauthTokensQueryOptions,
  revokeOauthTokenMutationOptions,
} from '@/queries/security/oauth-tokens';
import { useModalsActions } from '@/stores/modals';

import type { OauthToken } from 'pl-api';

const messages = defineMessages({
  header: { id: 'column.tokens', defaultMessage: 'Active sessions' },
  revoke: { id: 'security.tokens.revoke', defaultMessage: 'Revoke' },
  revokeSessionHeading: {
    id: 'confirmations.revoke_session.heading',
    defaultMessage: 'Revoke current session',
  },
  revokeSessionMessage: {
    id: 'confirmations.revoke_session.message',
    defaultMessage: 'You are about to revoke your current session. You will be signed out.',
  },
  revokeSessionConfirm: { id: 'confirmations.revoke_session.confirm', defaultMessage: 'Revoke' },
});

interface IAuthToken {
  token: OauthToken;
  isCurrent: boolean;
}

const AuthToken: React.FC<IAuthToken> = ({ token, isCurrent }) => {
  const intl = useIntl();

  const revokeMutation = useMutation(revokeOauthTokenMutationOptions(token.id));

  const { openModal } = useModalsActions();

  const handleRevoke = () => {
    if (isCurrent)
      openModal('CONFIRM', {
        heading: intl.formatMessage(messages.revokeSessionHeading),
        message: intl.formatMessage(messages.revokeSessionMessage),
        confirm: intl.formatMessage(messages.revokeSessionConfirm),
        onConfirm: () => {
          revokeMutation.mutate();
        },
      });
    else {
      revokeMutation.mutate();
    }
  };

  return (
    <div className='rounded-lg bg-gray-100 p-4 dark:bg-primary-800'>
      <Stack space={2} className='h-full justify-between'>
        <Stack space={1}>
          <Text size='md' weight='medium'>
            <HStack space={1} alignItems='center'>
              {token.app_name}
              {token.app_website && (
                <a href={token.app_website} target='_blank' rel='noopener'>
                  <Icon
                    src={require('@phosphor-icons/core/regular/arrow-square-out.svg')}
                    className='inline size-4 text-inherit'
                  />
                </a>
              )}
            </HStack>
          </Text>
          {token.scopes?.length > 0 && (
            <HStack space={2} alignItems='center' wrap>
              <Text size='sm' theme='muted'>
                <FormattedMessage id='security.tokens.scopes' defaultMessage='Scopes:' />
              </Text>
              {token.scopes.map((scope, index) => (
                <Badge title={scope} slug='opaque' key={scope} />
              ))}
            </HStack>
          )}
          {token.created_at && (
            <Text size='sm' theme='muted'>
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
            </Text>
          )}
          {token.last_used && (
            <Text size='sm' theme='muted'>
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
            </Text>
          )}
          {token.valid_until && (
            <Text size='sm' theme='muted'>
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
            </Text>
          )}
        </Stack>
        <HStack justifyContent='end'>
          <Button theme={isCurrent ? 'danger' : 'primary'} onClick={handleRevoke}>
            {intl.formatMessage(messages.revoke)}
          </Button>
        </HStack>
      </Stack>
    </div>
  );
};

const AuthTokenListPage: React.FC = () => {
  const intl = useIntl();

  const { data: tokens } = useInfiniteQuery(oauthTokensQueryOptions);

  const currentTokenId = useAppSelector((state) => {
    const currentToken = Object.values(state.auth.tokens).find(
      (token) => token.me === state.auth.me,
    );

    return currentToken?.id;
  });

  const body = tokens ? (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
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
