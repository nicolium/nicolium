import React, { useCallback } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Icon from '@/components/icon';
import Modal from '@/components/ui/modal';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';
import ReplyIndicator from '@/features/compose/components/reply-indicator';
import { useAppSelector } from '@/hooks/use-app-selector';
import { makeGetStatus } from '@/selectors';

import type { BaseModalProps } from '@/features/ui/components/modal-root';

const messages = defineMessages({
  cancel_reblog: { id: 'status.cancel_reblog_private', defaultMessage: 'Un-repost' },
  reblog: { id: 'status.reblog', defaultMessage: 'Repost' },
});

interface BoostModalProps {
  statusId: string;
  onReblog: () => void;
  visibility?: string;
}

const BoostModal: React.FC<BaseModalProps & BoostModalProps> = ({
  statusId,
  onReblog,
  visibility,
  onClose,
}) => {
  const getStatus = useCallback(makeGetStatus(), []);

  const intl = useIntl();
  const status = useAppSelector((state) => getStatus(state, { id: statusId }))!;

  const handleReblog = () => {
    onReblog();
    onClose('BOOST');
  };

  const buttonText = status.reblogged ? messages.cancel_reblog : messages.reblog;

  return (
    <Modal
      title={
        visibility === 'unlisted' ? (
          <FormattedMessage id='boost_modal.title.unlisted' defaultMessage='Repost unlisted?' />
        ) : visibility === 'private' ? (
          <FormattedMessage id='boost_modal.title.private' defaultMessage='Repost privately?' />
        ) : (
          <FormattedMessage id='boost_modal.title' defaultMessage='Repost?' />
        )
      }
      confirmationAction={handleReblog}
      confirmationText={intl.formatMessage(buttonText)}
    >
      <Stack space={4}>
        <ReplyIndicator status={status} hideActions />

        <Text>
          <FormattedMessage
            id='boost_modal.combo'
            defaultMessage='You can press {combo} to skip this next time'
            values={{
              combo: (
                <span>
                  Shift +{' '}
                  <Icon
                    className='inline-block align-middle'
                    src={require('@phosphor-icons/core/regular/repeat.svg')}
                  />
                </span>
              ),
            }}
          />
        </Text>
      </Stack>
    </Modal>
  );
};

export { type BoostModalProps, BoostModal as default };
