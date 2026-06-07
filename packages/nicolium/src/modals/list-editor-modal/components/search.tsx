import iconBackspace from '@phosphor-icons/core/regular/backspace.svg';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Form from '@/components/ui/form';
import Icon from '@/components/ui/icon';
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

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setSearchValue(e.target.value);
  };

  const handleSubmit = () => {
    onSubmit(searchValue);
  };

  const hasValue = searchValue.length > 0;

  return (
    <Form onSubmit={handleSubmit} className='list-editor-modal__search'>
      <label title={intl.formatMessage(messages.search)}>
        <Input
          type='text'
          value={searchValue}
          onChange={handleChange}
          placeholder={intl.formatMessage(messages.search)}
        />
        {hasValue && (
          <div
            role='button'
            tabIndex={0}
            className='list-editor-modal__search__clear'
            onClick={() => {
              setSearchValue('');
              onSubmit('');
            }}
          >
            <Icon src={iconBackspace} aria-hidden />
          </div>
        )}
      </label>

      <button className='list-editor-modal__search__submit' onClick={handleSubmit}>
        <FormattedMessage id='tabs_bar.search' defaultMessage='Search' />
      </button>
    </Form>
  );
};

export { Search as default };
