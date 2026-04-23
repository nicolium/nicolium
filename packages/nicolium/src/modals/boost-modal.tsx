import iconCaretDown from '@phosphor-icons/core/regular/caret-down.svg';
import iconGlobe from '@phosphor-icons/core/regular/globe.svg';
import iconLock from '@phosphor-icons/core/regular/lock.svg';
import iconMoon from '@phosphor-icons/core/regular/moon.svg';
import iconRepeat from '@phosphor-icons/core/regular/repeat.svg';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import DropdownMenu from '@/components/dropdown-menu';
import Icon from '@/components/ui/icon';
import Modal from '@/components/ui/modal';
import Text from '@/components/ui/text';
import ReplyIndicator from '@/features/compose/components/reply-indicator';
import { useFeatures } from '@/hooks/use-features';
import { useMinimalStatus } from '@/queries/statuses/use-status';

import type { BaseModalProps } from '@/features/ui/components/modal-root';

const messages = defineMessages({
  public: { id: 'privacy.public.short', defaultMessage: 'Public' },
  unlisted: { id: 'privacy.unlisted.short', defaultMessage: 'Quiet public' },
  private: { id: 'privacy.private.short', defaultMessage: 'Followers-only' },
  changePrivacy: {
    id: 'boost_modal.change_visibility',
    defaultMessage: 'Adjust repost visibility',
  },
});

interface IPrivacyDropdown {
  visibility: string;
  onChange: (visibility: string) => void;
}

const PrivacyDropdown: React.FC<IPrivacyDropdown> = ({ visibility, onChange }) => {
  const intl = useIntl();

  const items = [
    {
      icon: iconGlobe,
      value: 'public',
      text: intl.formatMessage(messages.public),
      action: () => onChange('public'),
    },
    {
      icon: iconMoon,
      value: 'unlisted',
      text: intl.formatMessage(messages.unlisted),
      action: () => onChange('unlisted'),
    },
    {
      icon: iconLock,
      value: 'private',
      text: intl.formatMessage(messages.private),
      action: () => onChange('private'),
    },
  ];

  const valueOption = items.find((option) => option.value === visibility);

  const text = valueOption?.text || visibility;

  return (
    <div className='⁂-compose-form__select-buttons'>
      <DropdownMenu items={items} width='16rem'>
        <button type='button' title={intl.formatMessage(messages.changePrivacy)}>
          {valueOption?.icon && <Icon src={valueOption.icon} aria-hidden />}
          {text}
          <Icon src={iconCaretDown} aria-hidden />
        </button>
      </DropdownMenu>
    </div>
  );
};

interface BoostModalProps {
  statusId: string;
  onReblog: (selectedVisibility?: string) => void;
  visibility?: string;
}

const BoostModal: React.FC<BaseModalProps & BoostModalProps> = ({
  statusId,
  onReblog,
  visibility,
  onClose,
}) => {
  const features = useFeatures();

  const { data: status } = useMinimalStatus(statusId);

  const [selectedVisibility, setSelectedVisibility] = React.useState('public');

  const handleReblog = () => {
    onReblog(selectedVisibility);
    onClose('BOOST');
  };

  const buttonText = status?.reblogged ? (
    <FormattedMessage id='status.cancel_reblog_private' defaultMessage='Un-repost' />
  ) : (
    <FormattedMessage id='status.reblog' defaultMessage='Repost' />
  );

  return (
    <Modal
      title={
        status?.reblogged ? (
          <FormattedMessage id='boost_modal.title.unreblog' defaultMessage='Un-repost?' />
        ) : visibility === 'unlisted' ? (
          <FormattedMessage id='boost_modal.title.unlisted' defaultMessage='Repost unlisted?' />
        ) : visibility === 'private' ? (
          <FormattedMessage id='boost_modal.title.private' defaultMessage='Repost privately?' />
        ) : (
          <FormattedMessage id='boost_modal.title' defaultMessage='Repost?' />
        )
      }
      confirmationAction={handleReblog}
      confirmationText={buttonText}
      modalActionsBody={
        !status?.reblogged && features.reblogVisibility && !visibility ? (
          <PrivacyDropdown visibility={selectedVisibility} onChange={setSelectedVisibility} />
        ) : undefined
      }
    >
      <div className='flex flex-col gap-4'>
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
                    containerClassName='inline-block align-middle'
                    className='h-4 w-4'
                    src={iconRepeat}
                  />
                </span>
              ),
            }}
          />
        </Text>
      </div>
    </Modal>
  );
};

export { type BoostModalProps, BoostModal as default };
