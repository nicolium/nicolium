import { Outlet , Link } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useRef } from 'react';
import { useIntl } from 'react-intl';

import { uploadCompose } from '@/actions/compose';
import Avatar from '@/components/ui/avatar';
import Layout from '@/components/ui/layout';
import LinkFooter from '@/features/ui/components/link-footer';
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
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useAppSelector } from '@/hooks/use-app-selector';
import { useDraggedFiles } from '@/hooks/use-dragged-files';
import { useFeatures } from '@/hooks/use-features';
import { useFrontendConfig } from '@/hooks/use-frontend-config';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useSettings } from '@/stores/settings';

const HomeLayout = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const me = useAppSelector(state => state.me);
  const { account } = useOwnAccount();
  const features = useFeatures();
  const frontendConfig = useFrontendConfig();
  const { disableUserProvidedMedia } = useSettings();

  const composeId = 'home';
  const composeBlock = useRef<HTMLDivElement>(null);

  const hasCrypto = typeof frontendConfig.cryptoAddresses[0]?.ticker === 'string';
  const cryptoLimit = frontendConfig.cryptoDonatePanel.limit;

  const { isDragging, isDraggedOver } = useDraggedFiles(composeBlock, (files) => {
    dispatch(uploadCompose(composeId, files, intl));
  });

  const acct = account ? account.acct : '';
  const avatar = account ? account.avatar : '';

  return (
    <>
      <Layout.Main className='⁂-layout__main--home'>
        {me && (
          <div
            className={clsx('⁂-compose-block', {
              '⁂-compose-block--dragging': isDragging,
              '⁂-compose-block--dragged-over': isDraggedOver,
            })}
            ref={composeBlock}
          >
            <div className='⁂-compose-block__body'>
              {!disableUserProvidedMedia && (
                <Link className='⁂-compose-block__avatar' to='/@{$username}' params={{ username: acct }}>
                  <Avatar src={avatar} alt={account?.avatar_description} isCat={account?.is_cat} size={42} username={account?.username} />
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

        <Outlet />
      </Layout.Main >

      <Layout.Aside>
        {!me && (
          <SignUpPanel />
        )}
        {me && features.announcements && (
          <AnnouncementsPanel />
        )}
        {features.trends && (
          <TrendsPanel limit={5} />
        )}
        {(hasCrypto && cryptoLimit > 0 && me) && (
          <CryptoDonatePanel limit={cryptoLimit} />
        )}
        <PromoPanel />
        {features.birthdays && (
          <BirthdayPanel limit={10} />
        )}
        {me && features.suggestions && (
          <WhoToFollowPanel limit={3} />
        )}
        <LinkFooter />
      </Layout.Aside>
    </>
  );
};

export { HomeLayout as default };
