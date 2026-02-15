import { useNavigate, useRouter } from '@tanstack/react-router';
import React, { useMemo } from 'react';

import { resetCompose } from '@/actions/compose';
import { FOCUS_EDITOR_COMMAND } from '@/features/compose/editor/plugins/focus-plugin';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useModalsActions } from '@/stores/modals';

import { Hotkeys } from '../components/hotkeys';

import type { LexicalEditor } from 'lexical';

// const keyMap = {
//   help: '?',
//   search: ['/', 's'],
//   back: 'backspace',
//   new: 'n',
//   forceNew: 'option+n',
//   reply: 'r',
//   favourite: 'f',
//   boost: 'b',
//   mention: 'm',
//   react: 'e',
//   open: ['enter', 'o'],
//   openProfile: 'p',
//   moveDown: ['down', 'j'],
//   moveUp: ['up', 'k'],
//   toggleSensitive: ['h', 'x'],
//   openMedia: 'a',
//   goToHome: 'g h',
//   goToNotifications: 'g n',
//   goToFavourites: 'g f',
//   goToProfile: ['g p', 'g u'],
//   goToBlocked: 'g b',
//   goToMuted: 'g m',
//   goToRequests: 'g r',
// };

interface IGlobalHotkeys {
  children: React.ReactNode;
  node: React.MutableRefObject<HTMLDivElement | null>;
}

const GlobalHotkeys: React.FC<IGlobalHotkeys> = ({ children, node }) => {
  const navigate = useNavigate();
  const { history } = useRouter();
  const dispatch = useAppDispatch();
  const { account } = useOwnAccount();
  const { openModal } = useModalsActions();

  const handlers = useMemo(() => {
    const handleHotkeyNew = (e?: KeyboardEvent) => {
      e?.preventDefault();

      const element = node.current?.querySelector(
        'div[data-lexical-editor="true"]',
      ) as HTMLTextAreaElement;

      if (element) {
        ((element as any).__lexicalEditor as LexicalEditor).dispatchCommand(
          FOCUS_EDITOR_COMMAND,
          undefined,
        );
        return element.getAttribute('data-compose-id');
      } else {
        openModal('COMPOSE');
        return 'compose-modal';
      }
    };

    const handleHotkeySearch = (e?: KeyboardEvent) => {
      e?.preventDefault();
      if (!node.current) return;

      const element = node.current.querySelector('input#search') as HTMLInputElement;

      if (element?.checkVisibility()) {
        element.focus();
      } else {
        navigate({ to: '/search' });
      }
    };

    const handleHotkeyForceNew = (e?: KeyboardEvent) => {
      const composeId = handleHotkeyNew(e);
      dispatch(resetCompose(composeId ?? undefined));
    };

    const handleHotkeyBack = () => {
      if (!history.canGoBack) {
        navigate({ to: '/' });
      } else {
        history.back();
      }
    };

    const handleHotkeyToggleHelp = () => {
      openModal('HOTKEYS');
    };

    const handleHotkeyGoToHome = () => {
      navigate({ to: '/' });
    };

    const handleHotkeyGoToNotifications = () => {
      navigate({ to: '/notifications' });
    };

    const handleHotkeyGoToFavourites = () => {
      if (!account) return;
      navigate({ to: '/@{$username}/favorites', params: { username: account.acct } });
    };

    const handleHotkeyGoToProfile = () => {
      if (!account) return;
      navigate({ to: '/@{$username}', params: { username: account.acct } });
    };

    const handleHotkeyGoToBlocked = () => {
      navigate({ to: '/blocks' });
    };

    const handleHotkeyGoToMuted = () => {
      navigate({ to: '/mutes' });
    };

    const handleHotkeyGoToRequests = () => {
      navigate({ to: '/follow_requests' });
    };

    type HotkeyHandlers = { [key: string]: (keyEvent?: KeyboardEvent) => void };

    let handlers: HotkeyHandlers = {
      help: handleHotkeyToggleHelp,
      search: handleHotkeySearch,
      back: handleHotkeyBack,
    };

    if (account) {
      handlers = {
        ...handlers,
        new: handleHotkeyNew,
        forceNew: handleHotkeyForceNew,
        goToHome: handleHotkeyGoToHome,
        goToNotifications: handleHotkeyGoToNotifications,
        goToFavourites: handleHotkeyGoToFavourites,
        goToProfile: handleHotkeyGoToProfile,
        goToBlocked: handleHotkeyGoToBlocked,
        goToMuted: handleHotkeyGoToMuted,
        goToRequests: handleHotkeyGoToRequests,
      };
    }
    return handlers;
  }, [account?.id]);

  return (
    <Hotkeys handlers={handlers} global>
      {children}
    </Hotkeys>
  );
};

export default GlobalHotkeys;
