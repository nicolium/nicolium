import React from 'react';
import { FormattedMessage } from 'react-intl';

import LoadMore from '@/components/load-more';
import MissingIndicator from '@/components/missing-indicator';
import Column from '@/components/ui/column';
import Spinner from '@/components/ui/spinner';
import { type AccountGalleryAttachment, useGroupGallery } from '@/hooks/use-account-gallery';
import { MediaItem } from '@/pages/accounts/account-gallery';
import { useGroupQuery } from '@/queries/groups/use-group';
import { groupGalleryRoute } from '@/router';
import { useModalsActions } from '@/stores/modals';

const GroupGallery: React.FC = () => {
  const { groupId } = groupGalleryRoute.useParams();

  const { openModal } = useModalsActions();

  const { data: group, isLoading: groupIsLoading } = useGroupQuery(groupId, true);

  const {
    data: attachments,
    isFetching,
    isLoading,
    hasNextPage,
    fetchNextPage,
  } = useGroupGallery(groupId);

  const handleOpenMedia = (attachment: AccountGalleryAttachment) => {
    openModal('MEDIA', { index: attachment.index, statusId: attachment.status_id });
  };

  if (isLoading || groupIsLoading) {
    return (
      <Column transparent withHeader={false}>
        <Spinner />
      </Column>
    );
  }

  if (!group) {
    return <MissingIndicator nested />;
  }

  return (
    <Column label={group.display_name} transparent withHeader={false}>
      <div role='feed' className='group-gallery__grid'>
        {attachments.map((attachment, index) => (
          <MediaItem
            key={`${attachment.status_id}+${attachment.id}`}
            attachment={attachment}
            onOpenMedia={handleOpenMedia}
            isLast={index === attachments.length - 1}
          />
        ))}

        {!isLoading && attachments.length === 0 && (
          <div className='empty-column-indicator group-gallery__empty'>
            <FormattedMessage id='account_gallery.none' defaultMessage='No media to show.' />
          </div>
        )}
      </div>

      {hasNextPage && (
        <LoadMore
          className='group-gallery__load-more'
          disabled={isFetching}
          onClick={() => fetchNextPage({ cancelRefetch: false })}
        />
      )}
    </Column>
  );
};

export { GroupGallery as default };
