import { Chip } from '@mkljczk/react-native-paper';
import { Image } from 'expo-image';
import { TagIcon } from 'phosphor-react-native/src/icons/Tag';
import React from 'react';
import { ScrollView } from 'react-native';

import { useComposeSuggestions, type Suggestion } from '@/hooks/use-compose-suggestions';
import { useAccount } from '@/queries/accounts/use-account';

import { Emoji as EmojiComponent } from '../ui/emoji';
import { iconHelper } from '../ui/icon';

import type { Emoji } from '@/emoji/search';

interface IComposeSuggestion {
  onPress: () => void;
}

interface IComposeEmojiSuggestion extends IComposeSuggestion {
  emoji: Emoji;
}

const ComposeEmojiSuggestion: React.FC<IComposeEmojiSuggestion> = ({ emoji, onPress }) => {
  return (
    <Chip
      mode='outlined'
      icon={() => (
        <EmojiComponent
          emoji={emoji.custom ? emoji.id : emoji.native}
          url={emoji.custom ? emoji.imageUrl : undefined}
          size={16}
        />
      )}
      onPress={onPress}
    >
      {emoji.colons}
    </Chip>
  );
};

interface IComposeAccountSuggestion extends IComposeSuggestion {
  accountId: string;
}

const ComposeAccountSuggestion: React.FC<IComposeAccountSuggestion> = ({ accountId, onPress }) => {
  const { data: account } = useAccount(accountId);

  if (!account) return null;

  return (
    <Chip
      mode='outlined'
      icon={() => (
        <Image
          source={{ uri: account.avatar }}
          accessibilityLabel={account.avatar_description}
          style={{
            height: 20,
            width: 20,
            borderRadius: 10,
          }}
          contentFit='contain'
          recyclingKey={`avatar-${account.id}`}
        />
      )}
      onPress={onPress}
    >
      @{account.acct}
    </Chip>
  );
};

interface IComposeHashtagSuggestion extends IComposeSuggestion {
  hashtag: string;
}

const ComposeHashtagSuggestion: React.FC<IComposeHashtagSuggestion> = ({ hashtag, onPress }) => {
  return (
    <Chip mode='outlined' icon={iconHelper(TagIcon)} onPress={onPress}>
      {hashtag}
    </Chip>
  );
};

interface IComposeSuggestions {
  token: string;
  handleSelected: (selection: Suggestion) => void;
}

const ComposeSuggestions: React.FC<IComposeSuggestions> = ({ token, handleSelected }) => {
  const suggestions = useComposeSuggestions(token);

  return (
    suggestions.length > 0 && (
      <ScrollView
        horizontal
        contentContainerStyle={{
          flexDirection: 'row',
          gap: 4,
          marginBottom: 8,
          paddingHorizontal: 12,
        }}
      >
        {suggestions.map((suggestion) => {
          const handlePress = () => handleSelected(suggestion);

          return typeof suggestion === 'string' ? (
            suggestion.startsWith('#') ? (
              <ComposeHashtagSuggestion
                key={suggestion}
                hashtag={suggestion}
                onPress={handlePress}
              />
            ) : (
              <ComposeAccountSuggestion
                key={suggestion}
                accountId={suggestion}
                onPress={handlePress}
              />
            )
          ) : (
            <ComposeEmojiSuggestion key={suggestion.id} emoji={suggestion} onPress={handlePress} />
          );
        })}
      </ScrollView>
    )
  );
};

export { ComposeSuggestions };
