import iconUsersThree from '@phosphor-icons/core/regular/users-three.svg';
import { Link } from '@tanstack/react-router';
import React, { useRef } from 'react';
import { defineMessages, FormattedDate, FormattedMessage, useIntl } from 'react-intl';

import Account from '@/components/accounts/account';
import RssFeedInfo from '@/components/statuses/rss-feed-info';
import StatusContent from '@/components/statuses/status-content';
import StatusInfo from '@/components/statuses/status-info';
import StatusLanguagePicker from '@/components/statuses/status-language-picker';
import StatusReactionsBar from '@/components/statuses/status-reactions-bar';
import StatusReplyMentions from '@/components/statuses/status-reply-mentions';
import Icon from '@/components/ui/icon';
import Text from '@/components/ui/text';
import Emojify from '@/features/emoji/emojify';
import { useAccount } from '@/queries/accounts/use-account';
import { useGroupQuery } from '@/queries/groups/use-group';

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

  const handleOpenCompareHistoryModal = () => {
    onOpenCompareHistoryModal(status);
  };

  const renderStatusInfo = () => {
    if (status.group_id) {
      return (
        <div className='mb-4'>
          <StatusInfo
            className='-mb-1'
            avatarSize={42}
            icon={
              <Icon
                src={iconUsersThree}
                className='size-4 text-primary-600 dark:text-primary-400'
                aria-hidden
              />
            }
            text={
              group ? (
                <FormattedMessage
                  id='status.group'
                  defaultMessage='Posted in {group}'
                  values={{
                    group: (
                      <Link
                        to='/groups/$groupId'
                        params={{ groupId: status.group_id }}
                        className='hover:underline'
                      >
                        <bdi className='truncate'>
                          <strong className='text-gray-800 dark:text-gray-200'>
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
    <div ref={node} className='⁂-detailed-status' tabIndex={-1}>
      {renderStatusInfo()}

      {actualStatus.rss_feed ? (
        <RssFeedInfo feed={actualStatus.rss_feed} timestamp={actualStatus.created_at} />
      ) : (
        <div className='mb-4'>
          <Account
            key={account.id}
            account={account}
            avatarSize={42}
            hideActions
            approvalStatus={actualStatus.approval_status}
            withLocked={false}
          />
        </div>
      )}

      <StatusReplyMentions status={actualStatus} />

      <div className='relative z-0 flex flex-col gap-4'>
        <StatusContent
          status={actualStatus}
          textSize='lg'
          translatable
          withMedia={withMedia}
          expandable
        />
      </div>

      {!status.rss_feed && (
        <>
          <StatusReactionsBar status={actualStatus} />

          <div className='flex flex-wrap items-center justify-between gap-2 py-3'>
            <StatusInteractionBar status={actualStatus} />

            <div className='flex items-center gap-1'>
              <span>
                <Text tag='span' theme='muted' size='sm'>
                  <div className='flex flex-wrap items-center gap-1'>
                    <a
                      href={actualStatus.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='hover:underline'
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
                        <span className='⁂-separator' />
                        <a
                          href={actualStatus.application.website ?? '#'}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='hover:underline'
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
                        <span className='⁂-separator' />
                        <button
                          className='inline hover:underline'
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
                </Text>
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
