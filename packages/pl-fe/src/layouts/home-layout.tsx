import clsx from 'clsx';
import React, { useRef } from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import 'pl-fe/styles/new/timelines.scss';
import { uploadCompose } from 'pl-fe/actions/compose';
import Avatar from 'pl-fe/components/ui/avatar';
import Layout from 'pl-fe/components/ui/layout';
import LinkFooter from 'pl-fe/features/ui/components/link-footer';
import {
  WhoToFollowPanel,
  TrendsPanel,
  SignUpPanel,
  PromoPanel,
  CryptoDonatePanel,
  BirthdayPanel,
  AnnouncementsPanel,
  ComposeForm,
} from 'pl-fe/features/ui/util/async-components';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useDraggedFiles } from 'pl-fe/hooks/use-dragged-files';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useOwnAccount } from 'pl-fe/hooks/use-own-account';
import { usePlFeConfig } from 'pl-fe/hooks/use-pl-fe-config';
import { useSettings } from 'pl-fe/stores/settings';

interface IHomeLayout {
  children: React.ReactNode;
}

const HomeLayout: React.FC<IHomeLayout> = ({ children }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const me = useAppSelector(state => state.me);
  const { account } = useOwnAccount();
  const features = useFeatures();
  const plFeConfig = usePlFeConfig();
  const { disableUserProvidedMedia } = useSettings();

  const composeId = 'home';
  const composeBlock = useRef<HTMLDivElement>(null);

  const hasCrypto = typeof plFeConfig.cryptoAddresses[0]?.ticker === 'string';
  const cryptoLimit = plFeConfig.cryptoDonatePanel.limit;

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
                <Link className='⁂-compose-block__avatar' to={`/@${acct}`}>
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

        {children}
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
