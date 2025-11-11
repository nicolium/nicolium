import React from 'react';
import { FormattedMessage } from 'react-intl';

import Spinner from 'pl-fe/components/ui/spinner';
import Widget from 'pl-fe/components/ui/widget';
import { type AccountGalleryAttachment, useAccountGallery } from 'pl-fe/hooks/use-account-gallery';
import { MediaItem } from 'pl-fe/pages/accounts/account-gallery';
import { useModalsActions } from 'pl-fe/stores/modals';

import type { Account } from 'pl-api';

interface IProfileMediaPanel {
  account?: Account;
}

const ProfileMediaPanel: React.FC<IProfileMediaPanel> = ({ account }) => {
  const { openModal } = useModalsActions();

  const { data: attachments, isLoading } = useAccountGallery(account?.id!);

  const handleOpenMedia = (attachment: AccountGalleryAttachment): void => {
    openModal('MEDIA', { index: attachment.index, statusId: attachment.status_id });
  };

  const renderAttachments = () => {
    const publicAttachments = attachments.filter(attachment => attachment.visibility === 'public');
    const nineAttachments = publicAttachments.slice(0, 9);

    if (nineAttachments.length) {
      return (
        <div className='⁂-media-panel__attachments'>
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
        <p className='⁂-media-panel__empty'>
          <FormattedMessage id='media_panel.empty_message' defaultMessage='No media found.' />
        </p>
      );
    }
  };

  return (
    <Widget className='⁂-media-panel' title={<FormattedMessage id='media_panel.title' defaultMessage='Media' />}>
      {isLoading || !account ? (
        <Spinner />
      ) : (
        renderAttachments()
      )}
    </Widget>
  );
};

export { ProfileMediaPanel as default };
