import React, { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import Spinner from '@/components/ui/spinner';
import Widget from '@/components/ui/widget';
import { type AccountGalleryAttachment, useAccountGallery } from '@/hooks/use-account-gallery';
import { MediaItem } from '@/pages/accounts/account-gallery';
import { useModalsActions } from '@/stores/modals';

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

  const children = useMemo(() => {
    if (isLoading || !account) return <Spinner />;

    const publicVisibilities = ['public', 'unlisted'];

    const publicAttachments = attachments
      .filter((attachment) => publicVisibilities.includes(attachment.visibility))
      .slice(0, 9);

    if (publicAttachments.length) {
      return (
        <div className='⁂-media-panel__attachments'>
          {publicAttachments.map((attachment, index) => (
            <MediaItem
              key={`${attachment.status_id}+${attachment.id}`}
              attachment={attachment}
              onOpenMedia={handleOpenMedia}
              isLast={index === publicAttachments.length - 1}
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
  }, [isLoading, account?.id, attachments]);

  return (
    <Widget
      className='⁂-media-panel'
      title={<FormattedMessage id='media_panel.title' defaultMessage='Media' />}
    >
      {children}
    </Widget>
  );
};

export { ProfileMediaPanel as default };
