import React from 'react';
import { FormattedMessage } from 'react-intl';

import { useGroup } from 'pl-fe/api/hooks/groups/use-group';
import LoadMore from 'pl-fe/components/load-more';
import MissingIndicator from 'pl-fe/components/missing-indicator';
import Column from 'pl-fe/components/ui/column';
import Spinner from 'pl-fe/components/ui/spinner';
import { groupGalleryRoute } from 'pl-fe/features/ui/router';
import { type AccountGalleryAttachment, useGroupGallery } from 'pl-fe/hooks/use-account-gallery';
import { MediaItem } from 'pl-fe/pages/accounts/account-gallery';
import { useModalsActions } from 'pl-fe/stores/modals';

const GroupGallery: React.FC = () => {
  const { groupId } = groupGalleryRoute.useParams();

  const { openModal } = useModalsActions();

  const { group, isLoading: groupIsLoading } = useGroup(groupId);

  const { data: attachments, isFetching, isLoading, hasNextPage, fetchNextPage } = useGroupGallery(groupId);

  const handleOpenMedia = (attachment: AccountGalleryAttachment) => {
    openModal('MEDIA', { index: attachment.index, statusId: attachment.status_id });
  };

  if (isLoading || groupIsLoading) {
    return (
      <Column transparent withHeader={false}>
        <div className='pt-6'>
          <Spinner />
        </div>
      </Column>
    );
  }

  if (!group) {
    return (
      <div className='pt-6'>
        <MissingIndicator nested />
      </div>
    );
  }

  return (
    <Column label={group.display_name} transparent withHeader={false}>
      <div role='feed' className='mt-4 grid grid-cols-2 gap-1 overflow-hidden rounded-md sm:grid-cols-3'>
        {attachments.map((attachment, index) => (
          <MediaItem
            key={`${attachment.status_id}+${attachment.id}`}
            attachment={attachment}
            onOpenMedia={handleOpenMedia}
            isLast={index === attachments.length - 1}
          />
        ))}

        {(!isLoading && attachments.length === 0) && (
          <div className='empty-column-indicator col-span-2 sm:col-span-3'>
            <FormattedMessage id='account_gallery.none' defaultMessage='No media to show.' />
          </div>
        )}
      </div>

      {hasNextPage && (
        <LoadMore className='mt-4' disabled={isFetching} onClick={() => fetchNextPage({ cancelRefetch: false })} />
      )}
    </Column>
  );
};

export { GroupGallery as default };
