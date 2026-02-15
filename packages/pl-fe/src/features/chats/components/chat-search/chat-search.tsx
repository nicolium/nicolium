import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import React, { useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Icon from '@/components/ui/icon';
import Input from '@/components/ui/input';
import Stack from '@/components/ui/stack';
import { ChatWidgetScreens, useChatContext } from '@/contexts/chat-context';
import { useDebounce } from '@/hooks/use-debounce';
import { useChats } from '@/queries/chats';
import { queryClient } from '@/queries/client';
import { useAccountSearch } from '@/queries/search/use-search-accounts';
import toast from '@/toast';

import Blankslate from './blankslate';
import EmptyResultsBlankslate from './empty-results-blankslate';
import Results from './results';

import type { PlfeResponse } from '@/api';

const messages = defineMessages({
  placeholder: { id: 'chat_search.placeholder', defaultMessage: 'Type a name' },
});

interface IChatSearch {
  isMainPage?: boolean;
}

const ChatSearch: React.FC<IChatSearch> = ({ isMainPage = false }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const intl = useIntl();

  const navigate = useNavigate();

  const { changeScreen } = useChatContext();
  const { getOrCreateChatByAccountId } = useChats();

  const [value, setValue] = useState<string>('');
  const debouncedValue = useDebounce(value, 300);

  const accountSearchResult = useAccountSearch(debouncedValue);
  const { data: accounts, isFetching } = accountSearchResult;

  const hasSearchValue = debouncedValue && debouncedValue.length > 0;
  const hasSearchResults = (accounts ?? []).length > 0;

  const handleClickOnSearchResult = useMutation({
    mutationFn: (accountId: string) => getOrCreateChatByAccountId(accountId),
    onError: (error: { response: PlfeResponse }) => {
      const data = error.response?.json;
      toast.error(data?.error);
    },
    onSuccess: (response) => {
      if (isMainPage) {
        navigate({ to: '/chats/$chatId', params: { chatId: response.id } });
      } else {
        changeScreen(ChatWidgetScreens.CHAT, response.id);
      }

      queryClient.invalidateQueries({ queryKey: ['chats', 'search'] });
    },
  });

  const renderBody = () => {
    if (hasSearchResults) {
      return (
        <Results
          accountSearchResult={accountSearchResult}
          onSelect={(id) => {
            handleClickOnSearchResult.mutate(id);
            clearValue();
          }}
          parentRef={parentRef}
        />
      );
    } else if (hasSearchValue && !hasSearchResults && !isFetching) {
      return <EmptyResultsBlankslate />;
    } else {
      return <Blankslate />;
    }
  };

  const clearValue = () => {
    if (hasSearchValue) {
      setValue('');
    }
  };

  return (
    <Stack space={4} className='-mt-1 h-full grow'>
      <div className='px-4 pt-1'>
        <Input
          data-testid='search'
          type='text'
          autoFocus
          placeholder={intl.formatMessage(messages.placeholder)}
          value={value || ''}
          onChange={(event) =>{
            setValue(event.target.value);
          }}
          outerClassName='mt-0'
          theme='search'
          append={
            <button onClick={clearValue}>
              <Icon
                src={hasSearchValue ? require('@phosphor-icons/core/regular/x.svg') : require('@phosphor-icons/core/regular/magnifying-glass.svg')}
                className='size-4 text-gray-700 dark:text-gray-600'
                aria-hidden='true'
              />
            </button>
          }
        />
      </div>

      <Stack className='grow' ref={parentRef}>
        {renderBody()}
      </Stack>
    </Stack>
  );
};

export { ChatSearch as default };
