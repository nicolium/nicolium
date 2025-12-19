import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { useAccount } from 'pl-fe/api/hooks/accounts/use-account';
import { useAccountLookup } from 'pl-fe/api/hooks/accounts/use-account-lookup';
import Blurhash from 'pl-fe/components/blurhash';
import Icon from 'pl-fe/components/icon';
import LoadMore from 'pl-fe/components/load-more';
import MissingIndicator from 'pl-fe/components/missing-indicator';
import StillImage from 'pl-fe/components/still-image';
import Column from 'pl-fe/components/ui/column';
import Spinner from 'pl-fe/components/ui/spinner';
import { profileMediaRoute } from 'pl-fe/features/ui/router';
import { type AccountGalleryAttachment, useAccountGallery } from 'pl-fe/hooks/use-account-gallery';
import { isIOS } from 'pl-fe/is-mobile';
import { useModalsActions } from 'pl-fe/stores/modals';
import { useSettings } from 'pl-fe/stores/settings';

interface IMediaItem {
  attachment: AccountGalleryAttachment;
  onOpenMedia: (attachment: AccountGalleryAttachment) => void;
  isLast?: boolean;
}

const MediaItem: React.FC<IMediaItem> = ({ attachment, onOpenMedia, isLast }) => {
  const { autoPlayGif, displayMedia } = useSettings();
  const { account } = useAccount(attachment.account_id);
  const [visible, setVisible] = useState<boolean>(displayMedia !== 'hide_all' && !attachment.sensitive || displayMedia === 'show_all');

  const handleMouseEnter: React.MouseEventHandler<HTMLVideoElement> = e => {
    const video = e.target as HTMLVideoElement;
    if (hoverToPlay()) {
      video.play();
    }
  };

  const handleMouseLeave: React.MouseEventHandler<HTMLVideoElement> = e => {
    const video = e.target as HTMLVideoElement;
    if (hoverToPlay()) {
      video.pause();
      video.currentTime = 0;
    }
  };

  const hoverToPlay = () => !autoPlayGif && ['gifv', 'video'].includes(attachment.type);

  const handleClick: React.MouseEventHandler = e => {
    if (e.button === 0 && !(e.ctrlKey || e.metaKey)) {
      e.preventDefault();

      if (visible) {
        onOpenMedia(attachment);
      } else {
        setVisible(true);
      }
    }
  };

  const title = attachment.description;

  let thumbnail: React.ReactNode = '';
  let icon;

  if (attachment.type === 'unknown') {
    // Skip
  } else if (attachment.type === 'image') {
    const focusX = Number(attachment.meta?.focus?.x) || 0;
    const focusY = Number(attachment.meta?.focus?.y) || 0;
    const x = ((focusX /  2) + .5) * 100;
    const y = ((focusY / -2) + .5) * 100;

    thumbnail = (
      <StillImage
        src={attachment.preview_url}
        alt={attachment.description}
        style={{ objectPosition: `${x}% ${y}%` }}
        className={clsx('size-full overflow-hidden', { 'rounded-br-md': isLast })}
      />
    );
  } else if (['gifv', 'video'].indexOf(attachment.type) !== -1) {
    const conditionalAttributes: React.VideoHTMLAttributes<HTMLVideoElement> = {};
    if (isIOS()) {
      conditionalAttributes.playsInline = true;
    }
    if (autoPlayGif) {
      conditionalAttributes.autoPlay = true;
    }
    thumbnail = (
      <div className={clsx('⁂-media-gallery__gifv', { autoplay: autoPlayGif })}>
        <video
          className={clsx('⁂-media-gallery__item-gifv-thumbnail overflow-hidden', { 'rounded-br-md': isLast })}
          aria-label={attachment.description}
          title={attachment.description}
          role='application'
          src={attachment.url}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          loop
          muted
          {...conditionalAttributes}
        />

        <span className='⁂-media-gallery__gifv__label'>GIF</span>
      </div>
    );
  } else if (attachment.type === 'audio') {
    const remoteURL = attachment.remote_url || '';
    const fileExtensionLastIndex = remoteURL.lastIndexOf('.');
    const fileExtension = remoteURL.slice(fileExtensionLastIndex + 1).toUpperCase();
    thumbnail = (
      <div className={clsx('⁂-media-gallery__item-thumbnail', { 'rounded-br-md': isLast })}>
        <span className='⁂-media-gallery__item__icons'><Icon src={require('@phosphor-icons/core/regular/speaker-high.svg')} /></span>
        <span className='⁂-media-gallery__file-extension__label'>{fileExtension}</span>
      </div>
    );
  }

  if (!visible) {
    icon = (
      <span className='⁂-media-gallery__item__icons'>
        <Icon src={require('@phosphor-icons/core/regular/eye-slash.svg')} />
      </span>
    );
  }

  return (
    <div className='col-span-1'>
      <Link className='⁂-media-gallery__item-thumbnail aspect-1' to='/@{$username}/posts/$statusId' params={{ username: account?.acct || 'undefined', statusId: attachment.status_id }} onClick={handleClick} title={title}>
        <Blurhash
          hash={attachment.blurhash}
          className={clsx('⁂-media-gallery__preview', {
            'hidden': visible,
            'rounded-br-md': isLast,
          })}
        />
        {visible && thumbnail}
        {!visible && icon}
      </Link>
    </div>
  );
};

const AccountGalleryPage = () => {
  const { username } = profileMediaRoute.useParams();
  const { openModal } = useModalsActions();

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
    openModal('MEDIA', { index: attachment.index, statusId: attachment.status_id });
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

export { AccountGalleryPage as default, MediaItem };
