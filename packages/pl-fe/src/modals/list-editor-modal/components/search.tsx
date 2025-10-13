import clsx from 'clsx';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Icon from 'pl-fe/components/icon';
import Button from 'pl-fe/components/ui/button';
import Form from 'pl-fe/components/ui/form';
import HStack from 'pl-fe/components/ui/hstack';
import Input from 'pl-fe/components/ui/input';

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
        <label className='relative grow'>
          <span style={{ display: 'none' }}>{intl.formatMessage(messages.search)}</span>

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
            <Icon src={require('@phosphor-icons/core/regular/backspace.svg')} aria-label={intl.formatMessage(messages.search)} className={clsx('size-5 text-gray-600', { hidden: !hasValue })} />
          </div>
        </label>

        <Button onClick={handleSubmit}>{intl.formatMessage(messages.searchTitle)}</Button>
      </HStack>
    </Form>
  );
};

export { Search as default };
