import React from 'react';
import { FormattedMessage } from 'react-intl';

const EmptyResultsBlankslate = () => (
  <div className='⁂-chat-search__blankslate'>
    <p className='⁂-chat-search__blankslate__title' data-testid='no-results'>
      <FormattedMessage
        id='chat_search.empty_results_blankslate.title'
        defaultMessage='No matches found'
      />
    </p>

    <p className='⁂-chat-search__blankslate__body'>
      <FormattedMessage
        id='chat_search.empty_results_blankslate.body'
        defaultMessage='Try searching for another name.'
      />
    </p>
  </div>
);

export { EmptyResultsBlankslate as default };
