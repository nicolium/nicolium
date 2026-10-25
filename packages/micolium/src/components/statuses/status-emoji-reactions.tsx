import { Chip } from '@mkljczk/react-native-paper';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View } from 'react-native';

import {
  useEmojiReactMutation,
  useEmojiUnreactMutation,
} from '@/queries/statuses/use-status-interactions';

import { Emoji } from '../ui/emoji';

import type { SelectedStatus } from '@/queries/statuses/use-status';
import type { EmojiReaction } from 'pl-api';

interface IStatusEmojiReactions {
  status: SelectedStatus;
}

const StatusEmojiReactions: React.FC<IStatusEmojiReactions> = ({ status }) => {
  const navigation = useNavigation();
  const { mutate: emojiReact } = useEmojiReactMutation(status.id);
  const { mutate: emojiUnreact } = useEmojiUnreactMutation(status.id);

  if (!status.emoji_reactions.length) return null;

  const handleReact = (emoji: EmojiReaction) => {
    if (emoji.me) emojiUnreact(emoji.name);
    else emojiReact(emoji.name);
  };

  return (
    <View style={{ flexDirection: 'row', gap: 4, flexWrap: 'wrap' }}>
      {status.emoji_reactions.map((emoji) => (
        <Chip
          key={emoji.name}
          mode={emoji.me ? 'flat' : 'outlined'}
          icon={() => <Emoji emoji={emoji.name} url={emoji.url} />}
          onPress={() => handleReact(emoji)}
          onLongPress={() =>
            navigation.navigate('status', {
              screen: 'reactions',
              params: { id: status.id, emoji: emoji.name },
            })
          }
          compact
        >
          {emoji.count}
        </Chip>
      ))}
    </View>
  );
};

export { StatusEmojiReactions };
