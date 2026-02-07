import { Link } from '@tanstack/react-router';
import React, { useRef } from 'react';
import { defineMessages, FormattedDate, FormattedMessage, useIntl } from 'react-intl';

import Account from '@/components/account';
import StatusContent from '@/components/status-content';
import StatusLanguagePicker from '@/components/status-language-picker';
import StatusReactionsBar from '@/components/status-reactions-bar';
import StatusReplyMentions from '@/components/status-reply-mentions';
import StatusInfo from '@/components/statuses/status-info';
import HStack from '@/components/ui/hstack';
import Icon from '@/components/ui/icon';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';
import Emojify from '@/features/emoji/emojify';

import StatusInteractionBar from './status-interaction-bar';
import StatusTypeIcon from './status-type-icon';

import type { SelectedStatus } from '@/selectors';

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

  const handleOpenCompareHistoryModal = () => {
    onOpenCompareHistoryModal(status);
  };

  const renderStatusInfo = () => {
    if (status.group) {
      return (
        <div className='mb-4'>
          <StatusInfo
            className='-mb-1'
            avatarSize={42}
            icon={
              <Icon
                src={require('@phosphor-icons/core/regular/users-three.svg')}
                className='size-4 text-primary-600 dark:text-primary-400'
              />
            }
            text={
              <FormattedMessage
                id='status.group'
                defaultMessage='Posted in {group}'
                values={{
                  group: (
                    <Link to='/groups/$groupId' params={{ groupId: status.group.id }} className='hover:underline'>
                      <bdi className='truncate'>
                        <strong className='text-gray-800 dark:text-gray-200'>
                          <Emojify text={status.account.display_name} emojis={status.account.emojis} />
                        </strong>
                      </bdi>
                    </Link>
                  ),
                }}
              />
            }
          />
        </div>
      );
    }
  };

  const actualStatus = status?.reblog || status;
  if (!actualStatus) return null;
  const { account } = actualStatus;
  if (!account || typeof account !== 'object') return null;

  return (
    <div className='border-box'>
      <div ref={node} className='detailed-actualStatus' tabIndex={-1}>
        {renderStatusInfo()}

        {account.id && (
          <div className='mb-4'>
            <Account
              key={account.id}
              account={account}
              avatarSize={42}
              hideActions
              approvalStatus={actualStatus.approval_status}
            />
          </div>
        )}

        <StatusReplyMentions status={actualStatus} />

        <Stack className='relative z-0'>
          <Stack space={4}>
            <StatusContent
              status={actualStatus}
              textSize='lg'
              translatable
              withMedia={withMedia}
            />
          </Stack>
        </Stack>

        <StatusReactionsBar status={actualStatus} />

        <HStack space={2} justifyContent='between' alignItems='center' className='py-3' wrap>
          <StatusInteractionBar status={actualStatus} />

          <HStack space={1} alignItems='center'>
            <span>
              <Text tag='span' theme='muted' size='sm'>
                <HStack space={1} alignItems='center' wrap>
                  <a href={actualStatus.url} target='_blank' rel='noopener' className='hover:underline'>
                    <FormattedDate value={new Date(actualStatus.created_at)} hour12 year='numeric' month='short' day='2-digit' hour='numeric' minute='2-digit' />
                  </a>

                  {actualStatus.application && (
                    <>
                      <span className='⁂-separator' />
                      <a
                        href={(actualStatus.application.website) ? actualStatus.application.website : '#'}
                        target='_blank'
                        rel='noopener'
                        className='hover:underline'
                        title={intl.formatMessage(messages.applicationName, { name: actualStatus.application.name })}
                      >
                        {actualStatus.application.name}
                      </a>
                    </>
                  )}

                  {actualStatus.edited_at && (
                    <>
                      <span className='⁂-separator' />
                      <div
                        className='inline hover:underline'
                        onClick={handleOpenCompareHistoryModal}
                        role='button'
                        tabIndex={0}
                      >
                        <FormattedMessage id='status.edited' defaultMessage='Edited {date}' values={{ date: intl.formatDate(new Date(actualStatus.edited_at), { hour12: true, month: 'short', day: '2-digit', hour: 'numeric', minute: '2-digit' }) }} />
                      </div>
                    </>
                  )}
                </HStack>
              </Text>
            </span>

            <StatusTypeIcon visibility={actualStatus.visibility} />

            <StatusLanguagePicker status={actualStatus} showLabel />
          </HStack>
        </HStack>
      </div>
    </div>
  );
};

export { DetailedStatus as default };
