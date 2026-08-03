import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import List, { ListItem } from '@/components/list';
import TagInput from '@/components/ui/tag-input';

import { useActiveDeckColumns } from '../utils/layouts';
import { deckMessages as messages } from '../utils/messages';

import { updateDeckColumn } from './deck-column-config';

interface IHashtagDeckColumnSettings {
  columnId: string;
}

const HashtagDeckColumnSettings: React.FC<IHashtagDeckColumnSettings> = ({ columnId }) => {
  const intl = useIntl();

  const column = useActiveDeckColumns().find(({ id }) => id === columnId);

  if (!column || column.type !== 'hashtag') return null;

  const { any, all, none } = column;

  const setTags = (mode: 'any' | 'all' | 'none') => (tags: string[]) => {
    updateDeckColumn(columnId, {
      [mode]: tags.map((tag) => tag.replace(/^#+/, '')),
    });
  };

  const canAddMore = any.length + all.length + none.length < 4;

  return (
    <div className='deck__column__settings__hashtag'>
      <h3>
        <FormattedMessage
          id='hashtag.column_settings.tag_header'
          defaultMessage='Additional tags for this column'
        />
      </h3>
      <List>
        <ListItem
          label={
            <FormattedMessage
              id='hashtag.column_settings.tag_mode.any'
              defaultMessage='Any of those'
            />
          }
        >
          <TagInput
            tags={any.map((tag) => `#${tag}`)}
            onChange={setTags('any')}
            placeholder={intl.formatMessage(messages.additionalTagsPlaceholder)}
            canAddMore={canAddMore}
          />
        </ListItem>
        <ListItem
          label={
            <FormattedMessage
              id='hashtag.column_settings.tag_mode.all'
              defaultMessage='All of those'
            />
          }
        >
          <TagInput
            tags={all.map((tag) => `#${tag}`)}
            onChange={setTags('all')}
            placeholder={intl.formatMessage(messages.additionalTagsPlaceholder)}
            canAddMore={canAddMore}
          />
        </ListItem>
        <ListItem
          label={
            <FormattedMessage
              id='hashtag.column_settings.tag_mode.none'
              defaultMessage='None of those'
            />
          }
        >
          <TagInput
            tags={none.map((tag) => `#${tag}`)}
            onChange={setTags('none')}
            placeholder={intl.formatMessage(messages.additionalTagsPlaceholder)}
            canAddMore={canAddMore}
          />
        </ListItem>
      </List>
    </div>
  );
};

export { HashtagDeckColumnSettings };
