import iconX from '@phosphor-icons/core/regular/x.svg';
import { linkOptions, useNavigate, useRouter } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useMemo, type MouseEventHandler } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import AccountContainer from '@/components/accounts/account-container';
import { useStatusMeta, useStatusMetaActions } from '@/stores/status-meta';

import Text from '../ui/text';

import EventPreview from './events/event-preview';
import StatusContent from './status-content';
import StatusReplyMentions from './status-reply-mentions';

import type { FilterContextType } from '@/queries/settings/use-filters';
import type { SelectedStatus } from '@/queries/statuses/use-status';
import type { QuoteState } from 'pl-api';

const messages = defineMessages({
  cancel: { id: 'reply_indicator.cancel', defaultMessage: 'Cancel' },
});

interface IQuotedStatus {
  /** The quoted status entity. */
  status?: SelectedStatus;
  /** Callback when cancelled (during compose). */
  onCancel?: () => void;
  /** Whether the status is shown in the post composer. */
  compose?: boolean;
  /** The depth of quote nesting. */
  quoteDepth?: number;
  /** The state of the quote. */
  state?: QuoteState | null;
  contextType?: FilterContextType;
}

/** Status embedded in a quote post. */
const QuotedStatus: React.FC<IQuotedStatus> = ({
  status,
  onCancel,
  compose,
  quoteDepth = 0,
  state,
  contextType,
}) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const router = useRouter();
  const { unfilterStatus } = useStatusMetaActions();
  const statusMeta = useStatusMeta(status?.id || '');

  const handleExpandClick: MouseEventHandler<HTMLDivElement> = (e) => {
    if (!status) return;
    const account = status.account;

    if (!compose && e.button === 0) {
      const link = linkOptions({
        to: '/@{$username}/posts/$statusId',
        params: { username: account.acct, statusId: status.id },
      });
      if (!(e.ctrlKey || e.metaKey)) {
        navigate(link);
      } else {
        const url = router.buildLocation(link).href;
        window.open(url, '_blank');
      }
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const handleClose = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const filterResults = useMemo(() => {
    if (!contextType || !status) return [];

    return status.filtered
      .filter(
        ({ filter }) => filter.filter_action === 'warn' && filter.context.includes(contextType),
      )
      .reduce(
        (uniqueFilters, current) => {
          if (
            !uniqueFilters.some(({ filter: uniqueFilter }) => uniqueFilter.id === current.filter.id)
          ) {
            uniqueFilters.push(current);
          }
          return uniqueFilters;
        },
        [] as typeof status.filtered,
      );
  }, [status?.filtered, contextType]);
  const filtered = filterResults.length > 0;

  if (!status) {
    return null;
  }

  const handleUnfilter: MouseEventHandler<HTMLButtonElement> = (e) => {
    unfilterStatus(status.id);
    e.stopPropagation();
  };

  const account = status.account;

  let actions = {};
  if (onCancel) {
    actions = {
      onActionClick: handleClose,
      actionIcon: iconX,
      actionAlignment: 'top',
      actionTitle: intl.formatMessage(messages.cancel),
    };
  }

  const body =
    (['blocked_account', 'blocked_domain', 'muted_account'].includes(state!) || filtered) &&
    !statusMeta.showFiltered ? (
      <Text theme='muted'>
        <FormattedMessage id='status.filtered' defaultMessage='Filtered' />:{' '}
        {state === 'blocked_account' ? (
          <FormattedMessage
            id='status.filtered_blocked_account'
            defaultMessage='You have blocked @{acct}.'
            values={{ acct: account.acct }}
          />
        ) : state === 'blocked_domain' ? (
          <FormattedMessage
            id='status.filtered_blocked_domain'
            defaultMessage='You have blocked the domain {domain}.'
            values={{ domain: account.acct.split('@')[1] }}
          />
        ) : state === 'muted_account' ? (
          <FormattedMessage
            id='status.filtered_muted_account'
            defaultMessage='You have muted @{acct}.'
            values={{ acct: account.acct }}
          />
        ) : null}
        {filterResults.length > 0 && (
          <>{filterResults.map(({ filter }) => filter.title).join(', ')}.</>
        )}{' '}
        <button
          className='text-primary-600 hover:underline dark:text-primary-400'
          onClick={handleUnfilter}
        >
          <FormattedMessage id='status.show_filter_reason' defaultMessage='Show anyway' />
        </button>
      </Text>
    ) : (
      <>
        {account.id && (
          <AccountContainer
            {...actions}
            id={account.id}
            timestamp={status.created_at}
            withRelationship={false}
            showAccountHoverCard={!compose}
            withLinkToProfile={!compose}
            withLocked={false}
          />
        )}

        <StatusReplyMentions status={status} hoverable={false} />

        {status.event ? (
          <EventPreview status={status} hideAction />
        ) : (
          <div className='quoted-status__content'>
            <StatusContent
              status={status}
              collapsable
              isQuote
              quoteDepth={quoteDepth + 1}
              withMedia
              compose={compose}
              contextType={contextType}
            />
          </div>
        )}
      </>
    );

  return (
    <div
      data-testid='quoted-status'
      className={clsx('quoted-status', {
        'quoted-status--compose': compose,
      })}
      onClick={handleExpandClick}
    >
      {body}
    </div>
  );
};

export { QuotedStatus as default };
