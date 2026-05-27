import React from 'react';
import { FormattedMessage } from 'react-intl';

import Spinner from '@/components/ui/spinner';
import Widget from '@/components/ui/widget';
import { type AccountGalleryAttachment, useGroupGallery } from '@/hooks/use-account-gallery';
import { MediaItem } from '@/pages/accounts/account-gallery';
import { useModalsActions } from '@/stores/modals';

import type { Group } from 'pl-api';

interface IGroupMediaPanel {
  group: Group;
}

const GroupMediaPanel: React.FC<IGroupMediaPanel> = ({ group }) => {
  const { openModal } = useModalsActions();

  const { data: attachments, isLoading } = useGroupGallery(group.id);

  const handleOpenMedia = (attachment: AccountGalleryAttachment): void => {
    openModal('MEDIA', { index: attachment.index, statusId: attachment.status_id });
  };

  const renderAttachments = () => {
    const nineAttachments = attachments.slice(0, 9);

    if (nineAttachments.length) {
      return (
        <div className='media-panel__attachments'>
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
        <p className='media-panel__empty'>
          <FormattedMessage id='media_panel.empty_message' defaultMessage='No media found.' />
        </p>
      );
    }
  };

  return (
    <Widget
      className='media-panel'
      title={<FormattedMessage id='media_panel.title' defaultMessage='Media' />}
    >
      {isLoading ? <Spinner /> : renderAttachments()}
    </Widget>
  );
};

export { GroupMediaPanel as default };
