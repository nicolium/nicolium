import React from 'react';
import { useIntl, defineMessages } from 'react-intl';

import HStack from '@/components/ui/hstack';
import Input from '@/components/ui/input';

import IconPicker from './icon-picker';

import type { StreamfieldComponent } from '@/components/ui/streamfield';
import type { PromoPanelItem } from '@/normalizers/frontend-config';

const messages = defineMessages({
  icon: { id: 'plfe_config.promo_panel.meta_fields.icon_placeholder', defaultMessage: 'Icon' },
  label: { id: 'plfe_config.promo_panel.meta_fields.label_placeholder', defaultMessage: 'Label' },
  url: { id: 'plfe_config.promo_panel.meta_fields.url_placeholder', defaultMessage: 'URL' },
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
    <HStack space={2} alignItems='center' grow>
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
    </HStack>
  );
};

export { PromoPanelInput as default };
