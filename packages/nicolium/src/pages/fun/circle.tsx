import { Link } from '@tanstack/react-router';
import React, { useRef, useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { processCircle } from '@/actions/circle';
import { uploadFile } from '@/actions/media';
import Account from '@/components/accounts/account';
import Accordion from '@/components/ui/accordion';
import Avatar from '@/components/ui/avatar';
import Button from '@/components/ui/button';
import Column from '@/components/ui/column';
import Form from '@/components/ui/form';
import FormActions from '@/components/ui/form-actions';
import ProgressBar from '@/components/ui/progress-bar';
import Text from '@/components/ui/text';
import { useClient } from '@/hooks/use-client';
import { useOwnAccount } from '@/hooks/use-own-account';
import { appendMedia, useComposeActions } from '@/stores/compose';
import { useModalsActions } from '@/stores/modals';
import toast from '@/toast';

const toRad = (x: number) => x * (Math.PI / 180);

import iconDownloadSimple from '@phosphor-icons/core/regular/download-simple.svg';
import iconNotePencil from '@phosphor-icons/core/regular/note-pencil.svg';
import clsx from 'clsx';

import avatarMissing from '@/assets/images/avatar-missing.png';
import List, { ListItem } from '@/components/list';
import Toggle from '@/components/ui/toggle';

const HEIGHT = 1000;
const WIDTH = 1000;

const messages = defineMessages({
  heading: { id: 'column.circle', defaultMessage: 'Interactions circle' },
  pending: { id: 'interactions_circle.state.pending', defaultMessage: 'Fetching interactions' },
  fetchingStatuses: {
    id: 'interactions_circle.state.fetching_statuses',
    defaultMessage: 'Fetching posts',
  },
  fetchingFavourites: {
    id: 'interactions_circle.state.fetching_favourites',
    defaultMessage: 'Fetching likes',
  },
  fetchingAvatars: {
    id: 'interactions_circle.state.fetching_avatars',
    defaultMessage: 'Fetching avatars',
  },
  drawing: { id: 'interactions_circle.state.drawing', defaultMessage: 'Drawing circle' },
  done: { id: 'interactions_circle.state.done', defaultMessage: 'Finalizing…' },
  imageLoadingError: {
    id: 'interactions_circle.error.image_loading',
    defaultMessage: 'Failed to load one of the avatars',
  },
  imageLoadingMultipleError: {
    id: 'interactions_circle.error.image_loading.multiple',
    defaultMessage: 'Failed to load some of the avatars',
  },
});

const CirclePage: React.FC = () => {
  const [{ state, progress }, setProgress] = useState<{
    state:
      | 'unrequested'
      | 'pending'
      | 'fetchingStatuses'
      | 'fetchingFavourites'
      | 'fetchingAvatars'
      | 'drawing'
      | 'done';
    progress: number;
  }>({ state: 'unrequested', progress: 0 });
  const [expanded, setExpanded] = useState(false);
  const [users, setUsers] =
    useState<Array<{ id: string; avatar?: string; avatar_description?: string; acct: string }>>();
  const [hasError, setHasError] = useState(false);
  const [showHtmlCircle, setShowHtmlCircle] = useState(false);
  const [imgElements, setImgElements] = useState<
    Array<{ src: string; size: string; left: string; right: string }>
  >([]);

  const intl = useIntl();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const client = useClient();
  const { openModal } = useModalsActions();
  const { resetCompose, updateCompose } = useComposeActions();
  const { data: account } = useOwnAccount();

  const onSave: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();

    const fileToDownload = document.createElement('a');
    fileToDownload.download = 'interactions_circle.png';
    fileToDownload.href = canvasRef.current!.toDataURL('image/png');
    fileToDownload.click();
  };

  const onCompose: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();

    resetCompose('compose-modal');

    canvasRef.current!.toBlob((blob) => {
      const file = new File([blob!], 'interactions_circle.png', { type: 'image/png' });

      uploadFile(client, file, intl, (data) => {
        updateCompose('compose-modal', (draft) => {
          appendMedia(draft, data);
        });
        openModal('COMPOSE');
      });
    }, 'image/png');
  };

  const handleRequest = () => {
    setProgress({ state: 'pending', progress: 0 });

    processCircle(client, account!.id, setProgress)()
      .then(async (users) => {
        setUsers(users);

        // Adapted from twitter-interaction-circles, licensed under MIT License
        // https://github.com/duiker101/twitter-interaction-circles
        const ctx = canvasRef.current?.getContext('2d')!;

        const ownAvatar = account?.avatar ?? avatarMissing;

        let imageLoadingErorrs = 0;

        const imgs: Array<{
          src: string;
          size: string;
          left: string;
          right: string;
        }> = [];

        for (const layer of [
          { index: 0, off: 0, distance: 0, count: 1, radius: 110, users: [{ avatar: ownAvatar }] },
          { index: 1, off: 1, distance: 200, count: 8, radius: 64, users: users.slice(0, 8) },
          { index: 2, off: 9, distance: 330, count: 15, radius: 58, users: users.slice(8, 23) },
          { index: 3, off: 24, distance: 450, count: 26, radius: 50, users: users.slice(23, 49) },
        ]) {
          const { index, off, count, radius, distance, users } = layer;

          const angleSize = 360 / count;

          for (let i = 0; i < count; i++) {
            setProgress({ state: 'drawing', progress: 90 + ((i + off) / users.length) * 10 });

            const offset = index * 30;

            const r = toRad(i * angleSize + offset);

            const centerX = Math.cos(r) * distance + WIDTH / 2;
            const centerY = Math.sin(r) * distance + HEIGHT / 2;

            if (!users[i]) break;

            const avatarUrl = users[i].avatar ?? avatarMissing;

            try {
              // eslint-disable-next-line no-loop-func
              await new Promise((resolve) => {
                imgs.push({
                  src: avatarUrl,
                  size: `${radius / 5}%`,
                  left: `${(centerX - radius) / 10}%`,
                  right: `${(centerY - radius) / 10}%`,
                });

                const img = new Image();

                img.onload = () => {
                  ctx.save();
                  ctx.beginPath();
                  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                  ctx.closePath();
                  ctx.clip();

                  ctx.drawImage(img, centerX - radius, centerY - radius, radius * 2, radius * 2);
                  ctx.restore();

                  resolve(null);
                };

                img.onerror = () => {
                  imageLoadingErorrs++;
                  resolve(null);
                };

                img.crossOrigin = 'anonymous';
                img.setAttribute('crossorigin', 'anonymous');
                img.src = avatarUrl;
              });
            } catch {}
          }
        }

        setImgElements(imgs);

        if (imageLoadingErorrs) {
          setHasError(true);
          toast.info(
            imageLoadingErorrs > 1
              ? messages.imageLoadingMultipleError
              : messages.imageLoadingError,
          );
        }

        setProgress({ state: 'done', progress: 100 });
      })
      .catch(() => {});
  };

  if (state === 'unrequested') {
    return (
      <Column label={intl.formatMessage(messages.heading)}>
        <Form onSubmit={handleRequest}>
          <Text size='xl' weight='semibold'>
            <FormattedMessage
              id='interactions_circle.confirmation_heading'
              defaultMessage='Do you want to generate an interaction circle for the user @{username}?'
              values={{ username: account?.acct }}
            />
          </Text>

          <div className='mx-auto max-w-md rounded-lg p-2 black:border black:border-gray-800'>
            {account && <Account account={account} withRelationship={false} disabled />}
          </div>

          <FormActions>
            <Button theme='primary' type='submit'>
              <FormattedMessage id='interactions_circle.start' defaultMessage='Generate' />
            </Button>
          </FormActions>
        </Form>
      </Column>
    );
  }

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <div className='flex flex-col items-center gap-4'>
        {state !== 'done' && (
          <div className='absolute inset-0 z-40 flex w-full flex-col items-center justify-center gap-4 bg-gray-800/75 p-4 backdrop-blur-lg'>
            <ProgressBar progress={progress / 100} size='md' />
            <Text theme='white' weight='semibold'>
              {intl.formatMessage(messages[state])}
            </Text>
          </div>
        )}

        {hasError && (
          <List>
            <ListItem
              label={
                <FormattedMessage
                  id='interactions_circle.html_mode'
                  defaultMessage='Use fallback mode'
                />
              }
              hint={
                <FormattedMessage
                  id='interactions_circle.html_mode.hint'
                  defaultMessage='Some avatars failed to load on the canvas. You can try to display them in fallback mode. You won’t be able to download the image directly.'
                />
              }
            >
              <Toggle
                checked={showHtmlCircle}
                onChange={({ target }) => setShowHtmlCircle(target.checked)}
              />
            </ListItem>
          </List>
        )}

        {showHtmlCircle && (
          <div className='relative aspect-1 w-full max-w-full'>
            {imgElements.map((img, index) => (
              <img
                key={index}
                src={img.src}
                alt=''
                className='pointer-events-none absolute rounded-full'
                style={{
                  width: img.size,
                  height: img.size,
                  left: img.left,
                  top: img.right,
                }}
              />
            ))}
          </div>
        )}

        <canvas
          className={clsx('max-w-full', showHtmlCircle && 'hidden')}
          ref={canvasRef}
          width={1000}
          height={1000}
        />

        <div className='w-full'>
          <Accordion
            headline={
              <FormattedMessage id='interactions_circle.user_list' defaultMessage='User list' />
            }
            expanded={expanded}
            onToggle={setExpanded}
          >
            <div className='flex flex-col gap-2'>
              {users?.map((user) => (
                <Link key={user.id} to='/@{$username}' params={{ username: user.acct }}>
                  <div className='flex items-center gap-2'>
                    <Avatar
                      size={20}
                      src={user.avatar!}
                      alt={user.avatar_description}
                      username={user.acct}
                    />
                    <Text size='sm' weight='semibold' truncate>
                      {user.acct}
                    </Text>
                  </div>
                </Link>
              ))}
            </div>
          </Accordion>
        </div>

        {!showHtmlCircle && (
          <div className='flex gap-2'>
            <Button onClick={onSave} icon={iconDownloadSimple}>
              <FormattedMessage id='interactions_circle.download' defaultMessage='Download' />
            </Button>
            <Button onClick={onCompose} icon={iconNotePencil}>
              <FormattedMessage id='interactions_circle.compose' defaultMessage='Share' />
            </Button>
          </div>
        )}
      </div>
    </Column>
  );
};

export { CirclePage as default };
