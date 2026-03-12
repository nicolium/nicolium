import React from 'react';
import { FormattedMessage } from 'react-intl';

import Text from '@/components/ui/text';

const EmptyResultsBlankslate = () => (
  <div className='mx-auto flex h-full w-2/3 flex-col items-center justify-center gap-2'>
    <Text weight='bold' size='lg' align='center' data-testid='no-results'>
      <FormattedMessage
        id='chat_search.empty_results_blankslate.title'
        defaultMessage='No matches found'
      />
    </Text>

    <Text theme='muted' align='center'>
      <FormattedMessage
        id='chat_search.empty_results_blankslate.body'
        defaultMessage='Try searching for another name.'
      />
    </Text>
  </div>
);

export { EmptyResultsBlankslate as default };
