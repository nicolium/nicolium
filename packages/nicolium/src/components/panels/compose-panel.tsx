/* eslint-disable jsx-a11y/no-autofocus */
import iconDotsThreeVertical from '@phosphor-icons/core/regular/dots-three-vertical.svg';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { changeSetting } from '@/actions/settings';
import { ComposeForm } from '@/components/async-components';
import DropdownMenu, { type Menu } from '@/components/dropdown-menu';
import Widget from '@/components/ui/widget';
import { useComposeHeading } from '@/hooks/use-compose-heading';
import { useCompose } from '@/stores/compose';
import { useSettings } from '@/stores/settings';

import type { SidebarItem } from '@/schemas/frontend-settings';

const messages = defineMessages({
  openInteractions: {
    id: 'column.deck.compose.open_interactions',
    defaultMessage: 'Compose replies here',
  },
});

interface IComposePanel {
  openInteractions: boolean;
}

const ComposePanel: React.FC<IComposePanel> = ({ openInteractions }) => {
  const intl = useIntl();
  const { sidebarItems } = useSettings();
  const { editorKey } = useCompose('home');
  const title = useComposeHeading('home', true);

  const handleChangeOpenInteractions = (value: boolean) => {
    changeSetting(
      ['sidebarItems'],
      sidebarItems.map((item): SidebarItem => {
        if (item !== 'compose' && item !== 'compose:open-interactions') return item;
        return value ? 'compose:open-interactions' : 'compose';
      }),
    );
  };

  const menu: Menu = [
    {
      text: intl.formatMessage(messages.openInteractions),
      type: 'toggle',
      checked: openInteractions,
      onChange: handleChangeOpenInteractions,
    },
  ];

  return (
    <Widget
      className='compose-panel'
      title={title}
      action={<DropdownMenu items={menu} src={iconDotsThreeVertical} />}
    >
      <ComposeForm
        key={editorKey}
        id='home'
        shouldCondense
        compact
        autoFocus={!!editorKey}
        transparent
      />
    </Widget>
  );
};

export { ComposePanel as default };
