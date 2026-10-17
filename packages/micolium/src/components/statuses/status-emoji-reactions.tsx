import { Chip, Text } from '@mkljczk/react-native-paper';
import { Image } from 'expo-image';
import { EmojiReaction } from 'pl-api';
import React from 'react';
import { View } from 'react-native';

import {
  useEmojiReactMutation,
  useEmojiUnreactMutation,
} from '@/queries/statuses/use-status-interactions';

import type { SelectedStatus } from '@/queries/statuses/use-status';

interface IStatusEmojiReactions {
  status: SelectedStatus;
}

const StatusEmojiReactions: React.FC<IStatusEmojiReactions> = ({ status }) => {
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
          icon={() => {
            if (emoji.url) {
              return (
                <Image
                  source={{ uri: emoji.url }}
                  accessibilityLabel={emoji.name}
                  style={{ width: 20, height: 20, objectFit: 'contain' }}
                />
              );
            } else {
              return <Text style={{ fontSize: 20 }}>{emoji.name}</Text>;
            }
          }}
          onPress={() => handleReact(emoji)}
          compact
        >
          {emoji.count}
        </Chip>
      ))}
    </View>
  );
};

export { StatusEmojiReactions };
