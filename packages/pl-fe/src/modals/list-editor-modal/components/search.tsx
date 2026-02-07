import clsx from 'clsx';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Icon from '@/components/icon';
import Button from '@/components/ui/button';
import Form from '@/components/ui/form';
import HStack from '@/components/ui/hstack';
import Input from '@/components/ui/input';

const messages = defineMessages({
  search: { id: 'lists.search', defaultMessage: 'Search among people you follow' },
  searchTitle: { id: 'tabs_bar.search', defaultMessage: 'Search' },
});

interface ISearch {
  value: string;
  onSubmit: (value: string) => void;
}

const Search: React.FC<ISearch> = ({ value, onSubmit }) => {
  const intl = useIntl();

  const [searchValue, setSearchValue] = React.useState(value);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    setSearchValue(e.target.value);
  };

  const handleSubmit = () => {
    onSubmit(searchValue);
  };

  const hasValue = searchValue.length > 0;

  return (
    <Form onSubmit={handleSubmit}>
      <HStack space={2}>
        <label className='relative grow' title={intl.formatMessage(messages.search)}>
          <Input
            type='text'
            value={searchValue}
            onChange={handleChange}
            placeholder={intl.formatMessage(messages.search)}
          />
          <div
            role='button'
            tabIndex={0}
            className='absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 rtl:left-0 rtl:right-auto'
            onClick={() => {
              setSearchValue('');
              onSubmit('');
            }}
          >
            <Icon src={require('@phosphor-icons/core/regular/backspace.svg')} className={clsx('size-5 text-gray-600', { hidden: !hasValue })} aria-hidden />
          </div>
        </label>

        <Button onClick={handleSubmit}>{intl.formatMessage(messages.searchTitle)}</Button>
      </HStack>
    </Form>
  );
};

export { Search as default };
