import { Chip, IconButton } from '@mkljczk/react-native-paper';
import { SmileyIcon } from 'phosphor-react-native/src/icons/Smiley';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { View } from 'react-native';

import { useScopeUrl } from '@/hooks/use-scope-url';
import { useAnnouncements } from '@/queries/announcements/use-announcements';
import { useUiStoreActions } from '@/stores/ui';
import { haptics } from '@/utils/haptics';

import { Emoji } from '../ui/emoji';
import { iconHelper } from '../ui/icon';

import type { Announcement, AnnouncementReaction } from 'pl-api';

const messages = defineMessages({
  addEmoji: { id: 'emoji_button.label', defaultMessage: 'Insert emoji' },
});

interface IAnnouncementReactions {
  announcement: Announcement;
}

const AnnouncementReactions: React.FC<IAnnouncementReactions> = ({ announcement }) => {
  const intl = useIntl();
  const scopeUrl = useScopeUrl();
  const { openEmojiPicker } = useUiStoreActions();
  const { addReaction, removeReaction } = useAnnouncements();

  const reactions = announcement.reactions.filter((reaction) => reaction.count > 0);

  const react = (name: string) =>
    addReaction({ announcementId: announcement.id, name }, { onSuccess: () => haptics.toggleOn() });

  const unreact = (name: string) =>
    removeReaction(
      { announcementId: announcement.id, name },
      { onSuccess: () => haptics.toggleOff() },
    );

  const handleReact = (reaction: AnnouncementReaction) => {
    if (reaction.me) unreact(reaction.name);
    else react(reaction.name);
  };

  const handleOpenPicker = () => {
    const selected = reactions.filter((reaction) => reaction.me).map((reaction) => reaction.name);

    openEmojiPicker(
      (emoji) => {
        if (selected.includes(emoji)) return unreact(emoji);
        return react(emoji);
      },
      selected,
      true,
      true,
      scopeUrl,
    );
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        flexWrap: 'wrap',
        marginTop: 8,
      }}
    >
      {reactions.map((reaction) => (
        <Chip
          key={reaction.name}
          mode={reaction.me ? 'flat' : 'outlined'}
          icon={() => <Emoji emoji={reaction.name} url={reaction.url ?? undefined} />}
          onPress={() => handleReact(reaction)}
          compact
        >
          {reaction.count}
        </Chip>
      ))}
      {reactions.length < 8 && (
        <IconButton
          icon={iconHelper(SmileyIcon)}
          mode='outlined'
          size={16}
          onPress={handleOpenPicker}
          accessibilityLabel={intl.formatMessage(messages.addEmoji)}
          style={{ margin: 0 }}
        />
      )}
    </View>
  );
};

export { AnnouncementReactions };
