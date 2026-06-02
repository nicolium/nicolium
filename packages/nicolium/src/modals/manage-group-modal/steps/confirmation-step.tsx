import iconExport from '@phosphor-icons/core/regular/export.svg';
import iconLinkSimple from '@phosphor-icons/core/regular/link-simple.svg';
import React from 'react';
import { FormattedMessage, defineMessages } from 'react-intl';

import { ParsedContent } from '@/components/statuses/parsed-content';
import Avatar from '@/components/ui/avatar';
import Divider from '@/components/ui/divider';
import Icon from '@/components/ui/icon';
import toast from '@/toast';
import copy from '@/utils/copy';

import type { Group } from 'pl-api';

interface IConfirmationStep {
  group: Group | null;
}

const messages = defineMessages({
  copied: { id: 'copy.success', defaultMessage: 'Copied to clipboard!' },
});

const ConfirmationStep: React.FC<IConfirmationStep> = ({ group }) => {
  const handleCopyLink = () => {
    copy(group?.url as string, () => {
      toast.success(messages.copied);
    });
  };

  const handleShare = () => {
    navigator
      .share({
        text: group?.display_name,
        url: group?.uri,
      })
      .catch((e) => {
        if (e.name !== 'AbortError') console.error(e);
      });
  };

  if (!group) {
    return null;
  }

  return (
    <div className='manage-group-modal__confirmation'>
      <div className='manage-group-modal__confirmation-preview'>
        <div className='manage-group-modal__group-image-stack'>
          <label className='manage-group-modal__group-header'>
            {group.header && (
              <img
                className='manage-group-modal__group-header-image'
                src={group.header}
                alt={group.header_description}
              />
            )}
          </label>

          <label className='manage-group-modal__group-avatar'>
            {group.avatar && <Avatar src={group.avatar} alt={group.avatar_description} size={80} />}
          </label>
        </div>

        <div className='manage-group-modal__group-summary'>
          <p className='manage-group-modal__group-name'>{group.display_name}</p>
          <p className='manage-group-modal__group-note'>
            <ParsedContent html={group.note} emojis={group.emojis} />
          </p>
        </div>
      </div>

      <Divider />

      <div className='manage-group-modal__confirmation-info'>
        <p className='manage-group-modal__confirmation-title'>
          <FormattedMessage id='manage_group.confirmation.title' defaultMessage='You’re all set!' />
        </p>

        <div className='manage-group-modal__confirmation-info-list'>
          <InfoListItem number={1}>
            <p className='manage-group-modal__info-text'>
              <FormattedMessage
                id='manage_group.confirmation.info_1'
                defaultMessage='As the owner of this group, you can assign staff, delete posts and much more.'
              />
            </p>
          </InfoListItem>

          <InfoListItem number={2}>
            <p className='manage-group-modal__info-text'>
              <FormattedMessage
                id='manage_group.confirmation.info_2'
                defaultMessage='Post the group’s first post and get the conversation started.'
              />
            </p>
          </InfoListItem>

          <InfoListItem number={3}>
            <p className='manage-group-modal__info-text'>
              <FormattedMessage
                id='manage_group.confirmation.info_3'
                defaultMessage='Share your new group with friends, family and followers to grow its membership.'
              />
            </p>
          </InfoListItem>
        </div>
      </div>

      <div className='manage-group-modal__confirmation-actions'>
        {'share' in navigator && (
          <button
            type='button'
            className='manage-group-modal__confirmation-button'
            onClick={handleShare}
            data-testid='button'
          >
            <Icon src={iconExport} />
            <span>
              <FormattedMessage
                id='manage_group.confirmation.share'
                defaultMessage='Share this group'
              />
            </span>
          </button>
        )}

        <button
          type='button'
          className='manage-group-modal__confirmation-button'
          onClick={handleCopyLink}
          data-testid='button'
        >
          <Icon src={iconLinkSimple} />
          <span>
            <FormattedMessage id='manage_group.confirmation.copy' defaultMessage='Copy link' />
          </span>
        </button>
      </div>
    </div>
  );
};

interface IInfoListNumber {
  number: number;
}

const InfoListNumber: React.FC<IInfoListNumber> = ({ number }) => (
  <div className='manage-group-modal__info-number'>
    <p className='manage-group-modal__info-number-text'>{number}</p>
  </div>
);

interface IInfoListItem {
  number: number;
  children: React.ReactNode;
}

const InfoListItem: React.FC<IInfoListItem> = ({ number, children }) => (
  <div className='manage-group-modal__info-item'>
    <InfoListNumber number={number} />
    <div className='manage-group-modal__info-item-content'>{children}</div>
  </div>
);

export { ConfirmationStep as default };
