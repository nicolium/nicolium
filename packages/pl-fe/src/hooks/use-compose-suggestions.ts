import { useMemo } from 'react';

import { AutoSuggestion } from '@/components/autosuggest-input';
import emojiSearch from '@/features/emoji/search';
import { useDebounce } from '@/hooks/use-debounce';
import { useCustomEmojis } from '@/queries/instance/use-custom-emojis';
import { useSearchHashtags } from '@/queries/search/use-search';
import { useAccountSearch } from '@/queries/search/use-search-accounts';
import useTrends from '@/queries/trends';

const useComposeSuggestions = (token: string): Array<AutoSuggestion> => {
  const debouncedToken = useDebounce(token, 300);

  const searchedType = token.startsWith('@')
    ? 'accounts'
    : token.startsWith('#')
      ? 'hashtags'
      : token.startsWith(':')
        ? 'emojis'
        : null;

  // TODO: fix default selectors across the code
  const { data: customEmojis } = useCustomEmojis((emojis) => emojis);
  const { data: accountIds } = useAccountSearch(searchedType === 'accounts' ? debouncedToken : '', {
    resolve: false,
    limit: 5,
  });
  const { data: trendingTags } = useTrends();
  const { data: searchResult } = useSearchHashtags(
    searchedType === 'hashtags' ? debouncedToken : '',
  );

  return useMemo((): Array<AutoSuggestion> => {
    if (searchedType === 'emojis') {
      return emojiSearch(token.replace(':', ''), { maxResults: 10 }, customEmojis);
    }

    if (searchedType === 'accounts') {
      return accountIds ?? [];
    }

    if (searchedType === 'hashtags') {
      if (token.length === 1) {
        return (trendingTags ?? []).map(({ name }) => `#${name}`);
      }

      return (searchResult ?? []).map(({ name }) => `#${name}`);
    }

    return [];
  }, [searchedType, token, customEmojis, accountIds, trendingTags, searchResult]);
};

export { useComposeSuggestions };
