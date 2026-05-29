import clsx from 'clsx';
import React from 'react';
import { defineMessages, FormattedMessage, type MessageDescriptor, useIntl } from 'react-intl';

import Modal from '@/components/ui/modal';
import { useFeatures } from '@/hooks/use-features';
import { useLoggedIn } from '@/hooks/use-logged-in';

import type { BaseModalProps } from '@/features/ui/components/modal-root';

const messages = defineMessages({
  keyNameSlash: { id: 'keyboard_shortcuts.key_names.slash', defaultMessage: 'Slash' },
  keyNameQuestionMark: {
    id: 'keyboard_shortcuts.key_names.question_mark',
    defaultMessage: 'Question mark',
  },
  keyNameAlt: { id: 'keyboard_shortcuts.key_names.alt', defaultMessage: 'Alt' },
  keyNameBackspace: { id: 'keyboard_shortcuts.key_names.backspace', defaultMessage: 'Backspace' },
  keyNameDown: { id: 'keyboard_shortcuts.key_names.down', defaultMessage: 'Arrow down' },
  keyNameEnter: { id: 'keyboard_shortcuts.key_names.enter', defaultMessage: 'Enter' },
  keyNameEsc: { id: 'keyboard_shortcuts.key_names.esc', defaultMessage: 'Escape' },
  keyNameUp: { id: 'keyboard_shortcuts.key_names.up', defaultMessage: 'Arrow up' },
  joinerOr: { id: 'keyboard_shortcuts.joiners.or', defaultMessage: 'or' },
  joinerPlus: { id: 'keyboard_shortcuts.joiners.plus', defaultMessage: 'plus' },
  joinerThen: { id: 'keyboard_shortcuts.joiners.then', defaultMessage: 'then' },
});

const Hotkey: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className='rounded-md border border-solid border-primary-200 bg-primary-50 px-1.5 py-1 font-sans text-xs dark:border-gray-700 dark:bg-gray-800'>
    {children}
  </kbd>
);

const spokenKeyNames: Record<string, MessageDescriptor> = {
  '/': messages.keyNameSlash,
  '?': messages.keyNameQuestionMark,
  alt: messages.keyNameAlt,
  backspace: messages.keyNameBackspace,
  down: messages.keyNameDown,
  enter: messages.keyNameEnter,
  esc: messages.keyNameEsc,
  up: messages.keyNameUp,
};

const getSpokenKeyName = (keyName: string) => {
  if (spokenKeyNames[keyName]) return spokenKeyNames[keyName];
  if (/^[a-z]$/i.test(keyName)) return keyName.toUpperCase();
  return keyName;
};

type KeyJoiner = 'or' | 'plus' | 'then';

const visualJoiners: Record<KeyJoiner, string> = {
  or: ', ',
  plus: ' + ',
  then: ' + ',
};

const spokenJoiners: Record<KeyJoiner, MessageDescriptor> = {
  or: messages.joinerOr,
  plus: messages.joinerPlus,
  then: messages.joinerThen,
};

const HotkeyBinding: React.FC<{ keys: string[]; joiner?: KeyJoiner }> = ({
  keys,
  joiner = 'or',
}) => {
  const intl = useIntl();

  const spokenBinding = keys
    .map((keyName) => {
      const spokenKey = getSpokenKeyName(keyName);
      return typeof spokenKey === 'string' ? spokenKey : intl.formatMessage(spokenKey);
    })
    .join(` ${intl.formatMessage(spokenJoiners[joiner])} `);

  return (
    <span>
      <span aria-hidden='true'>
        {keys.map((keyName, idx) => (
          <React.Fragment key={keyName}>
            {idx > 0 && visualJoiners[joiner]}
            <Hotkey>{keyName}</Hotkey>
          </React.Fragment>
        ))}
      </span>
      <span className='sr-only'>{spokenBinding}</span>
    </span>
  );
};

const TableCell: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => <td className={clsx(className, 'px-2 pb-3')}>{children}</td>;

const getColumnSizes = (n: number) => {
  let part1 = Math.ceil(n / 3);
  let part2 = Math.floor(n / 3);
  const part3 = Math.floor(n / 3);

  const total = part1 + part2 + part3;
  if (total < n) {
    part2++;
  } else if (total > n) {
    part1--;
  }

  // Return the parts in descending order
  return [part1, part2, part3];
};

const HotkeysModal: React.FC<BaseModalProps> = ({ onClose }) => {
  const features = useFeatures();
  const { isLoggedIn } = useLoggedIn();

  const hotkeys = [
    isLoggedIn && {
      key: <HotkeyBinding keys={['r']} />,
      label: <FormattedMessage id='keyboard_shortcuts.reply' defaultMessage='to reply' />,
    },
    isLoggedIn && {
      key: <HotkeyBinding keys={['m']} />,
      label: (
        <FormattedMessage id='keyboard_shortcuts.mention' defaultMessage='to mention author' />
      ),
    },
    {
      key: <HotkeyBinding keys={['p']} />,
      label: (
        <FormattedMessage
          id='keyboard_shortcuts.profile'
          defaultMessage='to open author’s profile'
        />
      ),
    },
    isLoggedIn && {
      key: <HotkeyBinding keys={['f']} />,
      label: <FormattedMessage id='keyboard_shortcuts.favourite' defaultMessage='to like' />,
    },
    isLoggedIn &&
      features.emojiReacts && {
        key: <HotkeyBinding keys={['e']} />,
        label: <FormattedMessage id='keyboard_shortcuts.react' defaultMessage='to react' />,
      },
    isLoggedIn && {
      key: <HotkeyBinding keys={['b']} />,
      label: <FormattedMessage id='keyboard_shortcuts.boost' defaultMessage='to repost' />,
    },
    {
      key: <HotkeyBinding keys={['enter', 'o']} joiner='or' />,
      label: <FormattedMessage id='keyboard_shortcuts.enter' defaultMessage='to open post' />,
    },
    {
      key: <HotkeyBinding keys={['a']} />,
      label: <FormattedMessage id='keyboard_shortcuts.open_media' defaultMessage='to open media' />,
    },
    features.spoilers && {
      key: <HotkeyBinding keys={['x']} />,
      label: (
        <FormattedMessage
          id='keyboard_shortcuts.toggle_hidden'
          defaultMessage='to show/hide text behind CW'
        />
      ),
    },
    features.spoilers && {
      key: <HotkeyBinding keys={['h']} />,
      label: (
        <FormattedMessage
          id='keyboard_shortcuts.toggle_sensitivity'
          defaultMessage='to show/hide media'
        />
      ),
    },
    {
      key: <HotkeyBinding keys={['up', 'k']} joiner='or' />,
      label: (
        <FormattedMessage id='keyboard_shortcuts.up' defaultMessage='to move up in the list' />
      ),
    },
    {
      key: <HotkeyBinding keys={['down', 'j']} joiner='or' />,
      label: (
        <FormattedMessage id='keyboard_shortcuts.down' defaultMessage='to move down in the list' />
      ),
    },
    isLoggedIn && {
      key: <HotkeyBinding keys={['n']} />,
      label: (
        <FormattedMessage
          id='keyboard_shortcuts.compose'
          defaultMessage='to open the compose textarea'
        />
      ),
    },
    isLoggedIn && {
      key: <HotkeyBinding keys={['alt', 'n']} joiner='plus' />,
      label: <FormattedMessage id='keyboard_shortcuts.toot' defaultMessage='to start a new post' />,
    },
    {
      key: <HotkeyBinding keys={['backspace']} />,
      label: <FormattedMessage id='keyboard_shortcuts.back' defaultMessage='to navigate back' />,
    },
    isLoggedIn && {
      key: <HotkeyBinding keys={['s', '/']} joiner='or' />,
      label: document.querySelector('#search') ? (
        <FormattedMessage id='keyboard_shortcuts.search' defaultMessage='to focus search' />
      ) : (
        <FormattedMessage
          id='keyboard_shortcuts.navigate_search'
          defaultMessage='to open search page'
        />
      ),
    },
    {
      key: <HotkeyBinding keys={['esc']} />,
      label: (
        <FormattedMessage
          id='keyboard_shortcuts.unfocus'
          defaultMessage='to un-focus compose textarea/search'
        />
      ),
    },
    isLoggedIn && {
      key: <HotkeyBinding keys={['g', 'h']} joiner='then' />,
      label: (
        <FormattedMessage id='keyboard_shortcuts.home' defaultMessage='to open home timeline' />
      ),
    },
    isLoggedIn && {
      key: <HotkeyBinding keys={['g', 'n']} joiner='then' />,
      label: (
        <FormattedMessage
          id='keyboard_shortcuts.notifications'
          defaultMessage='to open notifications list'
        />
      ),
    },
    isLoggedIn && {
      key: <HotkeyBinding keys={['g', 'f']} joiner='then' />,
      label: (
        <FormattedMessage id='keyboard_shortcuts.favourites' defaultMessage='to open likes list' />
      ),
    },
    isLoggedIn && {
      key: <HotkeyBinding keys={['g', 'u']} joiner='then' />,
      label: (
        <FormattedMessage
          id='keyboard_shortcuts.my_profile'
          defaultMessage='to open your profile'
        />
      ),
    },
    isLoggedIn && {
      key: <HotkeyBinding keys={['g', 'b']} joiner='then' />,
      label: (
        <FormattedMessage
          id='keyboard_shortcuts.blocked'
          defaultMessage='to open blocked users list'
        />
      ),
    },
    isLoggedIn && {
      key: <HotkeyBinding keys={['g', 'm']} joiner='then' />,
      label: (
        <FormattedMessage id='keyboard_shortcuts.muted' defaultMessage='to open muted users list' />
      ),
    },
    isLoggedIn &&
      features.followRequests && {
        key: <HotkeyBinding keys={['g', 'r']} joiner='then' />,
        label: (
          <FormattedMessage
            id='keyboard_shortcuts.requests'
            defaultMessage='to open follow requests list'
          />
        ),
      },
    {
      key: <HotkeyBinding keys={['?']} />,
      label: (
        <FormattedMessage id='keyboard_shortcuts.legend' defaultMessage='to display this legend' />
      ),
    },
  ].filter((hotkey) => hotkey !== false);

  const columnSizes = getColumnSizes(hotkeys.length);

  const columns = columnSizes.reduce<
    Array<
      Array<{
        key: React.JSX.Element;
        label: React.JSX.Element;
      }>
    >
  >((prev, cur) => {
    const addedItems = prev.flat().length;
    prev.push(hotkeys.slice(addedItems, addedItems + cur));
    return prev;
  }, []);

  return (
    <Modal
      title={
        <FormattedMessage id='keyboard_shortcuts.heading' defaultMessage='Keyboard shortcuts' />
      }
      onClose={() => {
        onClose('HOTKEYS');
      }}
      className='hotkey-modal'
    >
      <div className='flex flex-col text-xs lg:flex-row'>
        {columns.map((column, i) => (
          <table key={i}>
            <thead>
              <tr>
                <th className='pb-2 font-bold'>
                  <FormattedMessage id='keyboard_shortcuts.hotkey' defaultMessage='Hotkey' />
                </th>
                <th className='pb-2 font-bold'>
                  <FormattedMessage id='keyboard_shortcuts.action' defaultMessage='Action' />
                </th>
              </tr>
            </thead>
            <tbody>
              {column.map((hotkey, i) => (
                <tr key={i}>
                  <TableCell className='whitespace-nowrap'>{hotkey.key}</TableCell>
                  <TableCell>{hotkey.label}</TableCell>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div>
    </Modal>
  );
};

export { HotkeysModal as default };
