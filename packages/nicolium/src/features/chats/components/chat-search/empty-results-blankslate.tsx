import React from 'react';
import { FormattedMessage } from 'react-intl';

import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';

const EmptyResultsBlankslate = () => (
  <Stack justifyContent='center' alignItems='center' space={2} className='mx-auto h-full w-2/3'>
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
  </Stack>
);

export { EmptyResultsBlankslate as default };
