import React from 'react';
import { FormattedMessage } from 'react-intl';

import Spinner from 'pl-fe/components/ui/spinner';
import Text from 'pl-fe/components/ui/text';
import Widget from 'pl-fe/components/ui/widget';
import { type AccountGalleryAttachment, useAccountGallery } from 'pl-fe/hooks/use-account-gallery';
import MediaItem from 'pl-fe/pages/accounts/account-gallery';
import { useModalsStore } from 'pl-fe/stores/modals';

import type { Account } from 'pl-fe/normalizers/account';

interface IProfileMediaPanel {
  account?: Account;
}

const ProfileMediaPanel: React.FC<IProfileMediaPanel> = ({ account }) => {
  const { openModal } = useModalsStore();

  const { data: attachments, isLoading } = useAccountGallery(account?.id!);

  const handleOpenMedia = (attachment: AccountGalleryAttachment): void => {
    if (attachment.type === 'video') {
      openModal('VIDEO', { media: attachment, statusId: attachment.status_id });
    } else {

      openModal('MEDIA', { index: attachment.index, statusId: attachment.status_id });
    }
  };

  const renderAttachments = () => {
    const publicAttachments = attachments.filter(attachment => attachment.visibility === 'public');
    const nineAttachments = publicAttachments.slice(0, 9);

    if (nineAttachments.length) {
      return (
        <div className='grid grid-cols-3 gap-0.5 overflow-hidden rounded-md'>
          {nineAttachments.map((attachment, index) => (
            <MediaItem
              key={`${attachment.status_id}+${attachment.id}`}
              attachment={attachment}
              onOpenMedia={handleOpenMedia}
              isLast={index === nineAttachments.length - 1}
            />
          ))}
        </div>
      );
    } else {
      return (
        <Text size='sm' theme='muted'>
          <FormattedMessage id='media_panel.empty_message' defaultMessage='No media found.' />
        </Text>
      );
    }
  };

  return (
    <Widget title={<FormattedMessage id='media_panel.title' defaultMessage='Media' />}>
      <div className='w-full'>
        {isLoading || !account ? (
          <Spinner />
        ) : (
          renderAttachments()
        )}
      </div>
    </Widget>
  );
};

export { ProfileMediaPanel as default };
