import clsx from 'clsx';
import React, { useEffect } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import Text from '@/components/ui/text';

const messages = defineMessages({
  emoji: { id: 'icon_button.label', defaultMessage: 'Select icon' },
});

interface IIconPickerMenu {
  icons: Record<string, Array<string>>;
  onPick: (icon: string) => void;
  style?: React.CSSProperties;
}

const IconPickerMenu: React.FC<IIconPickerMenu> = ({ icons, onPick }) => {
  const intl = useIntl();
  const containerNode = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const firstButton = containerNode.current?.querySelector('button') as HTMLButtonElement;
    firstButton?.focus();
  }, []);

  const handleClick = (icon: string) => {
    onPick(icon);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const target = e.target as HTMLButtonElement;
    const icon = target.dataset.index;

    const focus = (index: number) => {
      if (index < 0) {
        index = Object.values(icons).flat().length - 1;
      } else if (index >= Object.values(icons).flat().length) {
        index = 0;
      }
      const button = target.parentElement?.parentElement?.querySelector(
        `button[data-index="${index}"]`,
      ) as HTMLButtonElement;
      button?.focus();

      e.preventDefault();
      e.stopPropagation();
    };
    switch (e.key) {
      case 'Enter':
        if (icon) {
          handleClick(icon);
          e.preventDefault();
          e.stopPropagation();
        }
        break;
      case 'ArrowLeft':
        focus(Number(target.dataset.index) - 1);
        break;
      case 'ArrowRight':
        focus(Number(target.dataset.index) + 1);
        break;
      case 'ArrowUp':
        focus(Number(target.dataset.index) - 8);
        break;
      case 'ArrowDown':
        focus(Number(target.dataset.index) + 8);
        break;
      case 'Tab':
        focus(Number(target.dataset.index) + (e.shiftKey ? -1 : 1));
        break;
      case 'Home':
        focus(0);
        break;
      case 'End':
        focus(Object.values(icons).flat().length - 1);
        break;
      default:
        break;
    }
  };

  const renderIcon = (icon: string, index: number) => {
    const name = icon.replace('fa fa-', '');

    return (
      <li key={icon} className='col-span-1 inline-block'>
        <button
          className='flex items-center justify-center rounded-full p-1.5 hover:bg-gray-50 dark:hover:bg-primary-800'
          aria-label={name}
          title={name}
          onClick={() => {
            handleClick(name);
          }}
          data-index={index}
        >
          <i className={clsx(icon, 'size-[1.375rem] text-lg leading-[1.15]')} />
        </button>
      </li>
    );
  };

  const title = intl.formatMessage(messages.emoji);

  return (
    <div
      className='h-[270px] overflow-x-hidden overflow-y-scroll rounded bg-white p-1.5 text-gray-900 dark:bg-primary-900 dark:text-gray-100'
      aria-label={title}
      ref={containerNode}
    >
      <Text className='px-1.5 py-1'>
        <FormattedMessage id='icon_button.icons' defaultMessage='Icons' />
      </Text>
      <ul className='grid grid-cols-8' onKeyDown={handleKeyDown}>
        {Object.values(icons)
          .flat()
          .map((icon, index) => renderIcon(icon, index))}
      </ul>
    </div>
  );
};

export { IconPickerMenu as default };
