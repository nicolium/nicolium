import iconMagnifyingGlass from '@phosphor-icons/core/regular/magnifying-glass.svg';
import iconX from '@phosphor-icons/core/regular/x.svg';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import React, { useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Icon from '@/components/ui/icon';
import Input from '@/components/ui/input';
import { ChatWidgetScreens, useChatContext } from '@/contexts/chat-context';
import { useDebounce } from '@/hooks/use-debounce';
import { useChats } from '@/queries/chats';
import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';
import { useAccountSearch } from '@/queries/search/use-search-accounts';
import toast from '@/toast';

import Blankslate from './blankslate';
import EmptyResultsBlankslate from './empty-results-blankslate';
import Results from './results';

import type { NicoliumResponse } from '@/api';

const messages = defineMessages({
  placeholder: { id: 'chat_search.placeholder', defaultMessage: 'Type a name' },
  clearSearch: { id: 'chat_search.clear', defaultMessage: 'Clear search' },
  search: { id: 'chat_search.search', defaultMessage: 'Search' },
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
    onError: (error: { response: NicoliumResponse }) => {
      const data = error.response?.json;
      toast.error(data?.error);
    },
    onSuccess: (response) => {
      if (isMainPage) {
        navigate({ to: '/chats/$chatId', params: { chatId: response.id } });
      } else {
        changeScreen(ChatWidgetScreens.CHAT, response.id);
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.chats.search });
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
    <div className='⁂-chat-search'>
      <div className='⁂-chat-search__form'>
        <Input
          data-testid='search'
          type='text'
          autoFocus
          placeholder={intl.formatMessage(messages.placeholder)}
          value={value || ''}
          onChange={(event) => {
            setValue(event.target.value);
          }}
          outerClassName='⁂-chat-search__input'
          theme='search'
          append={
            <button
              onClick={clearValue}
              aria-label={intl.formatMessage(
                hasSearchValue ? messages.clearSearch : messages.search,
              )}
            >
              <Icon src={hasSearchValue ? iconX : iconMagnifyingGlass} aria-hidden='true' />
            </button>
          }
        />
      </div>

      <div className='⁂-chat-search__body' ref={parentRef}>
        {renderBody()}
      </div>
    </div>
  );
};

export { ChatSearch as default };
