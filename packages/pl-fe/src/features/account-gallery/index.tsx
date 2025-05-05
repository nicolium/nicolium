import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';

import { useAccountLookup } from 'pl-fe/api/hooks/accounts/use-account-lookup';
import LoadMore from 'pl-fe/components/load-more';
import MissingIndicator from 'pl-fe/components/missing-indicator';
import Column from 'pl-fe/components/ui/column';
import Spinner from 'pl-fe/components/ui/spinner';
import { type AccountGalleryAttachment, useAccountGallery } from 'pl-fe/hooks/use-account-gallery';
import { useModalsStore } from 'pl-fe/stores/modals';

import MediaItem from './components/media-item';

const AccountGallery = () => {
  const { username } = useParams<{ username: string }>();
  const { openModal } = useModalsStore();

  const {
    account,
    isLoading: accountLoading,
    isUnavailable,
  } = useAccountLookup(username, { withRelationship: true });

  const { data: attachments, isFetching, isLoading, hasNextPage: hasMore, fetchNextPage } = useAccountGallery(account?.id!);

  const handleScrollToBottom = () => {
    if (hasMore) {
      handleLoadMore();
    }
  };

  const handleLoadMore = () => {
    fetchNextPage({ cancelRefetch: false });
  };

  const handleLoadOlder: React.MouseEventHandler = e => {
    e.preventDefault();
    handleScrollToBottom();
  };

  const handleOpenMedia = (attachment: AccountGalleryAttachment) => {
    if (attachment.type === 'video') {
      openModal('VIDEO', { media: attachment, statusId: attachment.status_id });
    } else {
      openModal('MEDIA', { index: attachment.index, statusId: attachment.status_id });
    }
  };

  if (accountLoading || isLoading) {
    return (
      <Column>
        <Spinner />
      </Column>
    );
  }

  if (!account) {
    return (
      <MissingIndicator />
    );
  }

  let loadOlder = null;

  if (hasMore && !(isFetching && attachments.length === 0)) {
    loadOlder = <LoadMore className='my-auto mt-4' visible={!isFetching} onClick={handleLoadOlder} />;
  }

  if (isUnavailable) {
    return (
      <Column>
        <div className='empty-column-indicator'>
          <FormattedMessage id='empty_column.account_unavailable' defaultMessage='Profile unavailable' />
        </div>
      </Column>
    );
  }

  return (
    <Column label={`@${account.acct}`} transparent withHeader={false}>
      <div role='feed' className='grid grid-cols-2 gap-1 overflow-hidden rounded-md sm:grid-cols-3'>
        {attachments.map((attachment, index) => (
          <MediaItem
            key={`${attachment.status_id}+${attachment.id}`}
            attachment={attachment}
            onOpenMedia={handleOpenMedia}
            isLast={index === attachments.length - 1}
          />
        ))}

        {!isLoading && attachments.length === 0 && (
          <div className='empty-column-indicator col-span-2 sm:col-span-3'>
            <FormattedMessage id='account_gallery.none' defaultMessage='No media to show.' />
          </div>
        )}
      </div>

      {loadOlder}

      {isFetching && attachments.length === 0 && (
        <div className='relative flex-auto px-8 py-4'>
          <Spinner />
        </div>
      )}
    </Column>
  );
};

export { AccountGallery as default };
