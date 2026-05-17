import React from 'react';
import { useIntl, defineMessages } from 'react-intl';

import Input from '@/components/ui/input';

import IconPicker from './icon-picker';

import type { StreamfieldComponent } from '@/components/ui/streamfield';
import type { PromoPanelItem } from '@/schemas/frontend-config';

const messages = defineMessages({
  icon: { id: 'frontend_config.promo_panel.meta_fields.icon.placeholder', defaultMessage: 'Icon' },
  label: {
    id: 'frontend_config.promo_panel.meta_fields.label.placeholder',
    defaultMessage: 'Label',
  },
  url: { id: 'frontend_config.promo_panel.meta_fields.url.placeholder', defaultMessage: 'URL' },
});

const PromoPanelInput: StreamfieldComponent<PromoPanelItem> = ({ value, onChange }) => {
  const intl = useIntl();

  const handleIconChange = (icon: string) => {
    onChange({ ...value, icon });
  };

  const handleChange =
    (key: 'text' | 'url'): React.ChangeEventHandler<HTMLInputElement> =>
    (e) => {
      onChange({ ...value, [key]: e.currentTarget.value });
    };

  return (
    <div className='flex flex-grow items-center gap-2'>
      <IconPicker value={value.icon} onChange={handleIconChange} />

      <Input
        type='text'
        outerClassName='w-full grow'
        placeholder={intl.formatMessage(messages.label)}
        value={value.text}
        onChange={handleChange('text')}
      />
      <Input
        type='text'
        outerClassName='w-full grow'
        placeholder={intl.formatMessage(messages.url)}
        value={value.url}
        onChange={handleChange('url')}
      />
    </div>
  );
};

export { PromoPanelInput as default };
