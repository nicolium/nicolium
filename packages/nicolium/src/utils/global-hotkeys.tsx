import { useNavigate, useRouter } from '@tanstack/react-router';
import React, { useMemo } from 'react';

import { FOCUS_EDITOR_COMMAND } from '@/features/compose/editor/plugins/focus-plugin';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useComposeActions } from '@/stores/compose';
import { useModalsActions } from '@/stores/modals';

import { Hotkeys } from '../features/ui/components/hotkeys';

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
  const { data: account } = useOwnAccount();
  const { openModal } = useModalsActions();
  const { resetCompose } = useComposeActions();

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
      resetCompose(composeId ?? undefined);
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

    const handleHotkeyAddColumn = () => {
      (document.getElementById('add-column') as HTMLButtonElement | null)?.click();
    };

    const handleHotkeyFocusColumn = (e?: KeyboardEvent) => {
      if (!e?.key) return;
      const key = e.key;
      if (key >= '1' && key <= '9') {
        const index = parseInt(key, 10) - 1;
        const column = document.querySelector(
          `.deck__column[data-index="${index}"]`,
        ) as HTMLDivElement | null;
        if (column) {
          column.focus();
        }
      }
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
        addColumn: handleHotkeyAddColumn,
        focusColumn: handleHotkeyFocusColumn,
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
