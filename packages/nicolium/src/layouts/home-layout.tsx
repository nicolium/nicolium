import { Outlet } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useRef } from 'react';

import { BANNER_HTML } from '@/build-config';
import { AccountLink } from '@/components/accounts/account-link';
import { AsideContent } from '@/components/navigation/aside-content';
import Avatar from '@/components/ui/avatar';
import Layout from '@/components/ui/layout';
import Text from '@/components/ui/text';
import { useCurrentAccount } from '@/contexts/current-account-context';
import Warning from '@/features/compose/components/warning';
import { ComposeForm } from '@/features/ui/util/async-components';
import { useDraggedFiles } from '@/hooks/use-dragged-files';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useUploadCompose } from '@/stores/compose';
import { useSettings } from '@/stores/settings';

const HomeLayout = () => {
  const me = useCurrentAccount();
  const { data: account } = useOwnAccount();
  const { disableUserProvidedMedia, composeInTimelines } = useSettings();

  const composeId = 'home';
  const composeBlock = useRef<HTMLDivElement>(null);

  const uploadCompose = useUploadCompose(composeId);

  const { isDragging, isDraggedOver } = useDraggedFiles(composeBlock, (files) => {
    uploadCompose(files);
  });

  const avatar = account ? account.avatar : '';

  return (
    <>
      <Layout.Main className='layout__main--home'>
        {composeInTimelines && me && (
          <div
            className={clsx('compose-block', {
              'compose-block--dragging': isDragging,
              'compose-block--dragged-over': isDraggedOver,
            })}
            ref={composeBlock}
          >
            <div className='compose-block__body'>
              {!disableUserProvidedMedia && (
                <AccountLink className='compose-block__avatar' account={account!}>
                  <Avatar
                    src={avatar}
                    alt={account?.avatar_description}
                    isCat={account?.is_cat}
                    size={42}
                    username={account?.username}
                  />
                </AccountLink>
              )}

              <div className='compose-block__form'>
                <ComposeForm
                  id={composeId}
                  shouldCondense
                  autoFocus={false}
                  clickableAreaRef={composeBlock}
                  withAvatar
                  transparent
                />
              </div>
            </div>
          </div>
        )}

        {BANNER_HTML && BANNER_HTML.length > 0 && (
          <Warning
            message={<Text theme='muted' dangerouslySetInnerHTML={{ __html: BANNER_HTML }} />}
            className='mx-4 black:m-4 sm:mx-0'
          />
        )}

        <Outlet />
      </Layout.Main>

      <Layout.Aside>
        <AsideContent layout='home' />
      </Layout.Aside>
    </>
  );
};

export { HomeLayout as default };
