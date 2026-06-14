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
  keyNameLeft: { id: 'keyboard_shortcuts.key_names.left', defaultMessage: 'Arrow left' },
  keyNameRight: { id: 'keyboard_shortcuts.key_names.right', defaultMessage: 'Arrow right' },
  joinerOr: { id: 'keyboard_shortcuts.joiners.or', defaultMessage: 'or' },
  joinerPlus: { id: 'keyboard_shortcuts.joiners.plus', defaultMessage: 'plus' },
  joinerThen: { id: 'keyboard_shortcuts.joiners.then', defaultMessage: 'then' },
  joinerRange: { id: 'keyboard_shortcuts.joiners.range', defaultMessage: 'to' },
});

const Hotkey: React.FC<{ children: React.ReactNode }> = ({ children }) => <kbd>{children}</kbd>;

const spokenKeyNames: Record<string, MessageDescriptor> = {
  '/': messages.keyNameSlash,
  '?': messages.keyNameQuestionMark,
  alt: messages.keyNameAlt,
  backspace: messages.keyNameBackspace,
  down: messages.keyNameDown,
  enter: messages.keyNameEnter,
  esc: messages.keyNameEsc,
  up: messages.keyNameUp,
  left: messages.keyNameLeft,
  right: messages.keyNameRight,
};

const getSpokenKeyName = (keyName: string) => {
  if (spokenKeyNames[keyName]) return spokenKeyNames[keyName];
  if (/^[a-z]$/i.test(keyName)) return keyName.toUpperCase();
  return keyName;
};

type KeyJoiner = 'or' | 'plus' | 'then' | 'range';

const visualJoiners: Record<KeyJoiner, string> = {
  or: ', ',
  plus: ' + ',
  then: ' + ',
  range: ' - ',
};

const spokenJoiners: Record<KeyJoiner, MessageDescriptor> = {
  or: messages.joinerOr,
  plus: messages.joinerPlus,
  then: messages.joinerThen,
  range: messages.joinerRange,
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
    <span aria-label={spokenBinding}>
      <span aria-hidden='true'>
        {keys.map((keyName, idx) => (
          <React.Fragment key={keyName}>
            {idx > 0 && visualJoiners[joiner]}
            <Hotkey>{keyName}</Hotkey>
          </React.Fragment>
        ))}
      </span>
    </span>
  );
};

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
    isLoggedIn && {
      key: <HotkeyBinding keys={['1', '9']} joiner='range' />,
      label: (
        <FormattedMessage id='keyboard_shortcuts.focus_column' defaultMessage='to focus column' />
      ),
    },
    isLoggedIn && {
      key: <HotkeyBinding keys={['0']} />,
      label: (
        <FormattedMessage
          id='keyboard_shortcuts.focus_last_column'
          defaultMessage='to focus last column'
        />
      ),
    },
    isLoggedIn && {
      key: <HotkeyBinding keys={['left']} />,
      label: (
        <FormattedMessage
          id='keyboard_shortcuts.focus_previous_column'
          defaultMessage='to focus previous column'
        />
      ),
    },
    isLoggedIn && {
      key: <HotkeyBinding keys={['right']} />,
      label: (
        <FormattedMessage
          id='keyboard_shortcuts.focus_next_column'
          defaultMessage='to focus next column'
        />
      ),
    },
    isLoggedIn && {
      key: <HotkeyBinding keys={['c']} />,
      label: (
        <FormattedMessage id='keyboard_shortcuts.add_column' defaultMessage='to add a new column' />
      ),
    },
    isLoggedIn && {
      key: <HotkeyBinding keys={['escape']} />,
      label: (
        <FormattedMessage
          id='keyboard_shortcuts.column_back'
          defaultMessage='to navigate back inside a column'
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
      <div>
        {columns.map((column, i) => (
          <table key={i}>
            <thead>
              <tr>
                <th>
                  <FormattedMessage id='keyboard_shortcuts.hotkey' defaultMessage='Hotkey' />
                </th>
                <th>
                  <FormattedMessage id='keyboard_shortcuts.action' defaultMessage='Action' />
                </th>
              </tr>
            </thead>
            <tbody>
              {column.map((hotkey, i) => (
                <tr key={i}>
                  <td>{hotkey.key}</td>
                  <td>{hotkey.label}</td>
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
