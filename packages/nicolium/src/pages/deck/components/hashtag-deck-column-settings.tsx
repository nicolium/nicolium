import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { ListItem } from '@/components/list';
import TagInput from '@/components/ui/tag-input';

import { useActiveDeckColumns } from '../utils/layouts';
import { deckMessages as messages } from '../utils/messages';

interface IHashtagDeckColumnSettings {
  columnId: string;
}

const HashtagDeckColumnSettings: React.FC<IHashtagDeckColumnSettings> = ({ columnId }) => {
  const intl = useIntl();

  const column = useActiveDeckColumns().find(({ id }) => id === columnId);

  if (!column) return null;

  return (
    <div className='deck__column__settings__hashtag'>
      <ListItem
        label={
          <FormattedMessage
            id='hashtag.column_settings.tag_mode.any'
            defaultMessage='Any of those'
          />
        }
      >
        <TagInput
          tags={tags}
          onChange={setBadges}
          placeholder={intl.formatMessage(messages.additionalTagsPlaceholder)}
        />
      </ListItem>
    </div>
  );
};

export { HashtagDeckColumnSettings };
