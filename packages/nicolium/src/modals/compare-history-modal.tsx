import React from 'react';
import { FormattedDate, FormattedMessage } from 'react-intl';

import AttachmentThumbs from '@/components/media/attachment-thumbs';
import { ParsedContent } from '@/components/statuses/parsed-content';
import Modal from '@/components/ui/modal';
import Spinner from '@/components/ui/spinner';
import Text from '@/components/ui/text';
import Emojify from '@/features/emoji/emojify';
import { useAccount } from '@/queries/accounts/use-account';
import { useMinimalStatus } from '@/queries/statuses/use-status';
import { useStatusHistory } from '@/queries/statuses/use-status-history';

import type { BaseModalProps } from '@/features/ui/components/modal-root';

interface CompareHistoryModalProps {
  statusId: string;
}

const CompareHistoryModal: React.FC<BaseModalProps & CompareHistoryModalProps> = ({
  onClose,
  statusId,
}) => {
  const { data: versions, isLoading } = useStatusHistory(statusId);

  const { data: status } = useMinimalStatus(statusId);
  const { data: statusAccount } = useAccount(status?.account_id ?? '');

  const onClickClose = () => {
    onClose('COMPARE_HISTORY');
  };

  let body;

  if (isLoading) {
    body = <Spinner />;
  } else {
    body = (
      <div className='status-list'>
        {versions?.map((version) => {
          const content = (
            <ParsedContent
              html={version.content}
              mentions={status?.mentions}
              hasQuote={!!status?.quote_id}
              emojis={version.emojis}
              speakAsCat={statusAccount?.speak_as_cat}
            />
          );

          const poll = typeof version.poll !== 'string' && version.poll;

          return (
            <div className='flex flex-col gap-2 py-2 first:pt-0 last:pb-0' key={version.created_at}>
              {version.spoiler_text.length > 0 && (
                <>
                  <span>
                    <Emojify text={version.spoiler_text} emojis={version.emojis} />
                  </span>
                  <hr />
                </>
              )}

              <div data-markup>{content}</div>

              {poll && (
                <div className='flex flex-col'>
                  {poll.options.map((option) => (
                    <div
                      className='flex items-center p-1 text-gray-900 dark:text-gray-300'
                      key={option.title}
                    >
                      <span
                        className='mr-2.5 inline-block size-4 flex-none rounded-full border border-solid border-primary-600'
                        aria-hidden
                      />

                      <span>
                        <ParsedContent
                          html={option.title}
                          emojis={version.emojis}
                          speakAsCat={statusAccount?.speak_as_cat}
                        />
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {version.media_attachments.length > 0 && <AttachmentThumbs status={version} />}

              <Text align='right' tag='span' theme='muted' size='sm'>
                <FormattedDate
                  value={new Date(version.created_at)}
                  hour12
                  year='numeric'
                  month='short'
                  day='2-digit'
                  hour='numeric'
                  minute='2-digit'
                />
              </Text>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Modal
      title={<FormattedMessage id='compare_history_modal.header' defaultMessage='Edit history' />}
      onClose={onClickClose}
    >
      {body}
    </Modal>
  );
};

export { type CompareHistoryModalProps, CompareHistoryModal as default };
