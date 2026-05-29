import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import ForkAwesomeIcon from '@/components/fork-awesome-icon';
import Popover from '@/components/ui/popover';

import forkAwesomeIcons from './forkawesome.json';
import IconPickerMenu from './icon-picker-menu';

const messages = defineMessages({
  emoji: { id: 'icon_button.label', defaultMessage: 'Select icon' },
});

interface IIconPickerDropdown {
  value: string;
  onPickIcon: (icon: string) => void;
}

const IconPickerDropdown: React.FC<IIconPickerDropdown> = ({ value, onPickIcon }) => {
  const intl = useIntl();

  const title = intl.formatMessage(messages.emoji);

  return (
    <div>
      <Popover
        interaction='click'
        content={<IconPickerMenu icons={forkAwesomeIcons} onPick={onPickIcon} />}
        isFlush
      >
        <div
          className='admin-icon-picker__trigger'
          title={title}
          aria-label={title}
          role='button'
          tabIndex={0}
        >
          <ForkAwesomeIcon id={value} />
        </div>
      </Popover>
    </div>
  );
};

export { IconPickerDropdown as default };
