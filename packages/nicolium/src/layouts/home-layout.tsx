import { Outlet, Link } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useRef } from 'react';

import { BANNER_HTML } from '@/build-config';
import LinkFooter from '@/components/navigation/link-footer';
import Avatar from '@/components/ui/avatar';
import Layout from '@/components/ui/layout';
import Text from '@/components/ui/text';
import { useCurrentAccount } from '@/contexts/current-account-context';
import Warning from '@/features/compose/components/warning';
import {
  WhoToFollowPanel,
  TrendsPanel,
  SignUpPanel,
  PromoPanel,
  CryptoDonatePanel,
  BirthdayPanel,
  AnnouncementsPanel,
  ComposeForm,
} from '@/features/ui/util/async-components';
import { useDraggedFiles } from '@/hooks/use-dragged-files';
import { useFeatures } from '@/hooks/use-features';
import { useFrontendConfig } from '@/hooks/use-frontend-config';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useUploadCompose } from '@/stores/compose';
import { useSettings } from '@/stores/settings';

const HomeLayout = () => {
  const me = useCurrentAccount();
  const { data: account } = useOwnAccount();
  const features = useFeatures();
  const frontendConfig = useFrontendConfig();
  const { disableUserProvidedMedia, composeInTimelines } = useSettings();

  const composeId = 'home';
  const composeBlock = useRef<HTMLDivElement>(null);

  const uploadCompose = useUploadCompose(composeId);

  const hasCrypto = typeof frontendConfig.cryptoAddresses[0]?.ticker === 'string';
  const cryptoLimit = frontendConfig.cryptoDonatePanel.limit;

  const { isDragging, isDraggedOver } = useDraggedFiles(composeBlock, (files) => {
    uploadCompose(files);
  });

  const acct = account ? account.acct : '';
  const avatar = account ? account.avatar : '';

  return (
    <>
      <Layout.Main className='⁂-layout__main--home'>
        {composeInTimelines && me && (
          <div
            className={clsx('⁂-compose-block', {
              '⁂-compose-block--dragging': isDragging,
              '⁂-compose-block--dragged-over': isDraggedOver,
            })}
            ref={composeBlock}
          >
            <div className='⁂-compose-block__body'>
              {!disableUserProvidedMedia && (
                <Link
                  className='⁂-compose-block__avatar'
                  to='/@{$username}'
                  params={{ username: acct }}
                >
                  <Avatar
                    src={avatar}
                    alt={account?.avatar_description}
                    isCat={account?.is_cat}
                    size={42}
                    username={account?.username}
                  />
                </Link>
              )}

              <div className='⁂-compose-block__form'>
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
        {!me && <SignUpPanel />}
        {me && features.announcements && <AnnouncementsPanel />}
        {features.trends && <TrendsPanel limit={5} />}
        {hasCrypto && cryptoLimit > 0 && me && <CryptoDonatePanel limit={cryptoLimit} />}
        <PromoPanel />
        {features.birthdays && <BirthdayPanel limit={10} />}
        {me && features.suggestions && <WhoToFollowPanel limit={3} />}
        <LinkFooter />
      </Layout.Aside>
    </>
  );
};

export { HomeLayout as default };
