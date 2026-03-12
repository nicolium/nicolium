import React from 'react';
import { useIntl, defineMessages } from 'react-intl';

import Input from '@/components/ui/input';

import type { StreamfieldComponent } from '@/components/ui/streamfield';
import type { FooterItem } from '@/schemas/frontend-config';

const messages = defineMessages({
  label: {
    id: 'frontend_config.home_footer.meta_fields.label_placeholder',
    defaultMessage: 'Label',
  },
  url: { id: 'frontend_config.home_footer.meta_fields.url_placeholder', defaultMessage: 'URL' },
});

const PromoPanelInput: StreamfieldComponent<FooterItem> = ({ value, onChange }) => {
  const intl = useIntl();

  const handleChange =
    (key: 'title' | 'url'): React.ChangeEventHandler<HTMLInputElement> =>
    (e) => {
      onChange({ ...value, [key]: e.currentTarget.value });
    };

  return (
    <div className='flex flex-grow gap-2'>
      <Input
        type='text'
        outerClassName='w-full grow'
        placeholder={intl.formatMessage(messages.label)}
        value={value.title}
        onChange={handleChange('title')}
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
