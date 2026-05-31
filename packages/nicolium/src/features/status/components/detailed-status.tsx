import iconUsersThree from '@phosphor-icons/core/regular/users-three.svg';
import { Link } from '@tanstack/react-router';
import React, { useRef } from 'react';
import { defineMessages, FormattedDate, FormattedMessage, useIntl } from 'react-intl';

import Account from '@/components/accounts/account';
import RssFeedInfo from '@/components/statuses/rss-feed-info';
import StatusActionBar from '@/components/statuses/status-action-bar';
import StatusContent from '@/components/statuses/status-content';
import StatusInfo from '@/components/statuses/status-info';
import StatusLanguagePicker from '@/components/statuses/status-language-picker';
import StatusReactionsBar from '@/components/statuses/status-reactions-bar';
import StatusReplyMentions from '@/components/statuses/status-reply-mentions';
import Icon from '@/components/ui/icon';
import Emojify from '@/features/emoji/emojify';
import { useAccount } from '@/queries/accounts/use-account';
import { useGroupQuery } from '@/queries/groups/use-group';
import { useSettings } from '@/stores/settings';

import StatusInteractionBar from './status-interaction-bar';
import StatusTypeIcon from './status-type-icon';

import type { SelectedStatus } from '@/queries/statuses/use-status';

const messages = defineMessages({
  applicationName: { id: 'status.application_name', defaultMessage: 'Sent from {name}' },
});

interface IDetailedStatus {
  status: SelectedStatus;
  onOpenCompareHistoryModal: (status: Pick<SelectedStatus, 'id'>) => void;
  withMedia?: boolean;
}

const DetailedStatus: React.FC<IDetailedStatus> = ({
  status,
  onOpenCompareHistoryModal,
  withMedia,
}) => {
  const intl = useIntl();

  const node = useRef<HTMLDivElement>(null);

  const { data: group } = useGroupQuery(status.group_id ?? undefined);
  const { data: account } = useAccount(status.account_id);
  const { statusActionBarItems } = useSettings();

  const handleOpenCompareHistoryModal = () => {
    onOpenCompareHistoryModal(status);
  };

  const renderStatusInfo = () => {
    if (status.group_id) {
      return (
        <div className='detailed-status__group'>
          <StatusInfo
            className='detailed-status__group-info'
            avatarSize={42}
            icon={<Icon src={iconUsersThree} className='detailed-status__group-icon' aria-hidden />}
            text={
              group ? (
                <FormattedMessage
                  id='status.group'
                  defaultMessage='Posted in {group}'
                  values={{
                    group: (
                      <Link to='/groups/$groupId' params={{ groupId: status.group_id }}>
                        <bdi>
                          <strong>
                            <Emojify text={group.display_name} emojis={group.emojis} />
                          </strong>
                        </bdi>
                      </Link>
                    ),
                  }}
                />
              ) : (
                <FormattedMessage id='status.group.unknown' defaultMessage='Posted in a group' />
              )
            }
          />
        </div>
      );
    }
  };

  const actualStatus = status?.reblog || status;
  if (!actualStatus) return null;
  if (!account) return null;

  return (
    <div ref={node} className='detailed-status' tabIndex={-1}>
      {renderStatusInfo()}

      {actualStatus.rss_feed ? (
        <RssFeedInfo
          feed={actualStatus.rss_feed}
          timestamp={actualStatus.created_at}
          url={actualStatus.url}
        />
      ) : (
        <div className='detailed-status__header'>
          <Account
            key={account.id}
            account={account}
            avatarSize={42}
            hideActions
            action={
              statusActionBarItems.length === 0 ? (
                <div className='detailed-status__action-bar'>
                  <StatusActionBar status={status} />
                </div>
              ) : undefined
            }
            approvalStatus={actualStatus.approval_status}
            withLocked={false}
          />
        </div>
      )}

      <StatusReplyMentions status={actualStatus} hoverable={false} />

      <div className='detailed-status__body'>
        <StatusContent
          status={actualStatus}
          textSize='lg'
          translatable
          withMedia={withMedia}
          expandable
          contextType='thread'
        />
      </div>

      {!status.rss_feed && (
        <>
          <StatusReactionsBar status={actualStatus} />

          <div className='detailed-status__meta'>
            <StatusInteractionBar status={actualStatus} />

            <div className='detailed-status__meta__end'>
              <span className='detailed-status__meta__text'>
                <div className='detailed-status__meta__info'>
                  <a
                    href={actualStatus.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='detailed-status__meta__link'
                  >
                    <FormattedDate
                      value={new Date(actualStatus.created_at)}
                      hour12
                      year='numeric'
                      month='short'
                      day='2-digit'
                      hour='numeric'
                      minute='2-digit'
                    />
                  </a>

                  {actualStatus.application && (
                    <>
                      <span className='separator' />
                      <a
                        href={actualStatus.application.website ?? '#'}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='detailed-status__meta__link'
                        title={intl.formatMessage(messages.applicationName, {
                          name: actualStatus.application.name,
                        })}
                      >
                        {actualStatus.application.name}
                      </a>
                    </>
                  )}

                  {actualStatus.edited_at && (
                    <>
                      <span className='separator' />
                      <button
                        className='detailed-status__history'
                        onClick={handleOpenCompareHistoryModal}
                      >
                        <FormattedMessage
                          id='status.edited'
                          defaultMessage='Edited {date}'
                          values={{
                            date: intl.formatDate(new Date(actualStatus.edited_at), {
                              hour12: true,
                              month: 'short',
                              day: '2-digit',
                              hour: 'numeric',
                              minute: '2-digit',
                            }),
                          }}
                        />
                      </button>
                    </>
                  )}
                </div>
              </span>

              <StatusTypeIcon visibility={actualStatus.visibility} />

              <StatusLanguagePicker status={actualStatus} showLabel />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export { DetailedStatus as default };
