import React from 'react';
import { FormattedDate, FormattedMessage } from 'react-intl';

import AttachmentThumbs from '@/components/attachment-thumbs';
import { ParsedContent } from '@/components/parsed-content';
import HStack from '@/components/ui/hstack';
import Modal from '@/components/ui/modal';
import Spinner from '@/components/ui/spinner';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';
import Emojify from '@/features/emoji/emojify';
import { useAppSelector } from '@/hooks/use-app-selector';
import { useStatusHistory } from '@/queries/statuses/use-status-history';

import type { BaseModalProps } from '@/features/ui/components/modal-root';

interface CompareHistoryModalProps {
  statusId: string;
}

const CompareHistoryModal: React.FC<BaseModalProps & CompareHistoryModalProps> = ({ onClose, statusId }) => {
  const { data: versions, isLoading } = useStatusHistory(statusId);

  const status = useAppSelector(state => state.statuses[statusId]);

  const onClickClose = () => {
    onClose('COMPARE_HISTORY');
  };

  let body;

  if (isLoading) {
    body = <Spinner />;
  } else {
    body = (
      <div className='⁂-status-list'>
        {versions?.map((version) => {
          const content = <ParsedContent html={version.content} mentions={status?.mentions} hasQuote={!!status?.quote_id} emojis={version.emojis} speakAsCat={status.account.speak_as_cat} />;

          const poll = typeof version.poll !== 'string' && version.poll;

          return (
            <Stack space={2} className='py-2 first:pt-0 last:pb-0'>
              {version.spoiler_text.length > 0 && (
                <>
                  <span>
                    <Emojify text={version.spoiler_text} emojis={version.emojis} />
                  </span>
                  <hr />
                </>
              )}

              <div className='status__content'>
                {content}
              </div>

              {poll && (
                <div className='poll'>
                  <Stack>
                    {poll.options.map((option: any) => (
                      <HStack alignItems='center' className='p-1 text-gray-900 dark:text-gray-300'>
                        <span
                          className='mr-2.5 inline-block size-4 flex-none rounded-full border border-solid border-primary-600'
                          tabIndex={0}
                          role='radio'
                        />

                        <span>
                          <ParsedContent html={option.title} emojis={version.emojis} speakAsCat={status.account.speak_as_cat} />
                        </span>
                      </HStack>
                    ))}
                  </Stack>
                </div>
              )}

              {version.media_attachments.length > 0 && (
                <AttachmentThumbs status={version} />
              )}

              <Text align='right' tag='span' theme='muted' size='sm'>
                <FormattedDate value={new Date(version.created_at)} hour12 year='numeric' month='short' day='2-digit' hour='numeric' minute='2-digit' />
              </Text>
            </Stack>
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
