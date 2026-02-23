import { useNavigate } from '@tanstack/react-router';
import { Filter, type FilterContext } from 'pl-api';
import React, { useEffect, useMemo, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import List, { ListItem } from '@/components/list';
import MissingIndicator from '@/components/missing-indicator';
import Button from '@/components/ui/button';
import Column from '@/components/ui/column';
import Form from '@/components/ui/form';
import FormActions from '@/components/ui/form-actions';
import FormGroup from '@/components/ui/form-group';
import HStack from '@/components/ui/hstack';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import Stack from '@/components/ui/stack';
import Streamfield from '@/components/ui/streamfield';
import Text from '@/components/ui/text';
import Toggle from '@/components/ui/toggle';
import { SelectDropdown } from '@/features/forms';
import { editFilterRoute } from '@/features/ui/router';
import { useFeatures } from '@/hooks/use-features';
import { useCreateFilter, useFilter, useUpdateFilter } from '@/queries/settings/use-filters';
import toast from '@/toast';

import type { StreamfieldComponent } from '@/components/ui/streamfield';

interface IFilterField {
  id?: string;
  keyword: string;
  whole_word: boolean;
  _destroy?: boolean;
}

const messages = defineMessages({
  subheading_add_new: { id: 'column.filters.subheading_add_new', defaultMessage: 'Add new filter' },
  title: { id: 'column.filters.title', defaultMessage: 'Title' },
  keyword: { id: 'column.filters.keyword', defaultMessage: 'Keyword or phrase' },
  keywords: { id: 'column.filters.keywords', defaultMessage: 'Keywords or phrases' },
  expires: { id: 'column.filters.expires', defaultMessage: 'Expire after' },
  home_timeline: { id: 'column.filters.home_timeline', defaultMessage: 'Home timeline' },
  public_timeline: { id: 'column.filters.public_timeline', defaultMessage: 'Public timeline' },
  notifications: { id: 'column.filters.notifications', defaultMessage: 'Notifications' },
  conversations: { id: 'column.filters.conversations', defaultMessage: 'Conversations' },
  accounts: { id: 'column.filters.accounts', defaultMessage: 'Accounts' },
  drop_header: { id: 'column.filters.drop_header', defaultMessage: 'Drop instead of hide' },
  drop_hint: {
    id: 'column.filters.drop_hint',
    defaultMessage: 'Filtered posts will disappear irreversibly, even if filter is later removed',
  },
  hide_header: { id: 'column.filters.hide_header', defaultMessage: 'Hide completely' },
  hide_hint: {
    id: 'column.filters.hide_hint',
    defaultMessage: 'Completely hide the filtered content, instead of showing a warning',
  },
  filter_action_header: {
    id: 'column.filters.filter_action_header',
    defaultMessage: 'Filter action',
  },
  filter_action_hint: {
    id: 'column.filters.filter_action_hint',
    defaultMessage: 'Choose which action to perform when a post matches the filter',
  },
  filter_action_warn: {
    id: 'column.filters.filter_action_warn',
    defaultMessage: 'Hide with a warning',
  },
  filter_action_blur: {
    id: 'column.filters.filter_action_blur',
    defaultMessage: 'Hide media with a warning',
  },
  filter_action_hide: {
    id: 'column.filters.filter_action_hide',
    defaultMessage: 'Hide completely',
  },
  add_new: { id: 'column.filters.add_new', defaultMessage: 'Add new filter' },
  edit: { id: 'column.filters.edit', defaultMessage: 'Edit filter' },
  createError: { id: 'column.filters.create.error', defaultMessage: 'Error adding filter' },
  editError: { id: 'column.filters.edit.error', defaultMessage: 'Error editing filter' },
  createSuccess: {
    id: 'column.filters.create.success',
    defaultMessage: 'Filter added successfully',
  },
  editSuccess: { id: 'column.filters.edit.success', defaultMessage: 'Filter edited successfully' },
  expiration_never: { id: 'column.filters.expiration.never', defaultMessage: 'Never' },
  expiration_1800: { id: 'column.filters.expiration.1800', defaultMessage: '30 minutes' },
  expiration_3600: { id: 'column.filters.expiration.3600', defaultMessage: '1 hour' },
  expiration_21600: { id: 'column.filters.expiration.21600', defaultMessage: '6 hours' },
  expiration_43200: { id: 'column.filters.expiration.43200', defaultMessage: '12 hours' },
  expiration_86400: { id: 'column.filters.expiration.86400', defaultMessage: '1 day' },
  expiration_604800: { id: 'column.filters.expiration.604800', defaultMessage: '1 week' },
});

const FilterField: StreamfieldComponent<IFilterField> = ({ value, onChange }) => {
  const intl = useIntl();

  const handleChange =
    (key: string): React.ChangeEventHandler<HTMLInputElement> =>
    (e) => {
      onChange({
        ...value,
        [key]: e.currentTarget[e.currentTarget.type === 'checkbox' ? 'checked' : 'value'],
      });
    };

  return (
    <HStack space={2} grow>
      <Input
        type='text'
        outerClassName='w-2/5 grow'
        value={value.keyword}
        onChange={handleChange('keyword')}
        placeholder={intl.formatMessage(messages.keyword)}
      />
      <HStack alignItems='center' space={2}>
        <Toggle checked={value.whole_word} onChange={handleChange('whole_word')} />

        <Text tag='span' theme='muted'>
          <FormattedMessage id='column.filters.whole_word' defaultMessage='Whole word' />
        </Text>
      </HStack>
    </HStack>
  );
};

const EditFilterPage: React.FC = () => {
  const { filterId } = editFilterRoute.useParams();

  const intl = useIntl();
  const navigate = useNavigate();
  const features = useFeatures();

  const {
    data: filter,
    isFetching: isFetchingFilter,
    isError: notFound,
  } = useFilter(filterId !== 'new' ? filterId : undefined);
  const { mutate: createFilter, isPending: isCreating } = useCreateFilter();
  const { mutate: updateFilter, isPending: isUpdating } = useUpdateFilter(filterId);

  const [title, setTitle] = useState('');
  const [expiresIn, setExpiresIn] = useState<number | undefined>();
  const [homeTimeline, setHomeTimeline] = useState(true);
  const [publicTimeline, setPublicTimeline] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [conversations, setConversations] = useState(false);
  const [accounts, setAccounts] = useState(false);
  const [filterAction, setFilterAction] = useState<Filter['filter_action']>('warn');
  const [keywords, setKeywords] = useState<IFilterField[]>([{ keyword: '', whole_word: false }]);

  const expirations = useMemo(
    () => ({
      '': intl.formatMessage(messages.expiration_never),
      1800: intl.formatMessage(messages.expiration_1800),
      3600: intl.formatMessage(messages.expiration_3600),
      21600: intl.formatMessage(messages.expiration_21600),
      43200: intl.formatMessage(messages.expiration_43200),
      86400: intl.formatMessage(messages.expiration_86400),
      604800: intl.formatMessage(messages.expiration_604800),
    }),
    [],
  );

  const handleSelectChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    setExpiresIn(+e.target.value || undefined);
  };

  const handleAddNew: React.FormEventHandler = (e) => {
    e.preventDefault();
    const context: Array<FilterContext> = [];

    if (homeTimeline) {
      context.push('home');
    }
    if (publicTimeline) {
      context.push('public');
    }
    if (notifications) {
      context.push('notifications');
    }
    if (conversations) {
      context.push('thread');
    }
    if (accounts) {
      context.push('account');
    }

    (filterId !== 'new' ? updateFilter : createFilter)(
      {
        title,
        expires_in: expiresIn,
        context,
        filter_action: filterAction,
        keywords_attributes: keywords,
      },
      {
        onSuccess: () => {
          navigate({ to: '/filters' });
          toast.success(
            intl.formatMessage(filterId !== 'new' ? messages.editSuccess : messages.createSuccess),
          );
        },
        onError: () => {
          toast.error(
            intl.formatMessage(filterId !== 'new' ? messages.editError : messages.createError),
          );
        },
      },
    );
  };

  const handleChangeKeyword = (keywords: { keyword: string; whole_word: boolean }[]) => {
    setKeywords(keywords);
  };

  const handleAddKeyword = () => {
    setKeywords((keywords) => [...keywords, { keyword: '', whole_word: false }]);
  };

  const handleRemoveKeyword = (i: number) => {
    setKeywords((keywords) =>
      keywords[i].id
        ? keywords.map((keyword, index) => (index === i ? { ...keyword, _destroy: true } : keyword))
        : keywords.filter((_, index) => index !== i),
    );
  };

  useEffect(() => {
    if (filter) {
      setTitle(filter.title);
      setHomeTimeline(filter.context.includes('home'));
      setPublicTimeline(filter.context.includes('public'));
      setNotifications(filter.context.includes('notifications'));
      setConversations(filter.context.includes('thread'));
      setAccounts(filter.context.includes('account'));
      setFilterAction(filter.filter_action);
      setKeywords(filter.keywords);
    }
  }, [isFetchingFilter]);

  if (notFound) return <MissingIndicator />;

  const keywordsField = (
    <Streamfield
      label={intl.formatMessage(messages.keywords)}
      component={FilterField}
      values={keywords}
      onChange={handleChangeKeyword}
      onAddItem={handleAddKeyword}
      onRemoveItem={handleRemoveKeyword}
      minItems={1}
      maxItems={features.filtersV2 ? Infinity : 1}
    />
  );

  return (
    <Column
      className='filter-settings-panel'
      label={intl.formatMessage(messages.subheading_add_new)}
    >
      <Form onSubmit={handleAddNew}>
        {features.filtersV2 ? (
          <FormGroup labelText={intl.formatMessage(messages.title)}>
            <Input
              required
              type='text'
              name='title'
              value={title}
              onChange={({ target }) => {
                setTitle(target.value);
              }}
            />
          </FormGroup>
        ) : (
          keywordsField
        )}

        <FormGroup labelText={intl.formatMessage(messages.expires)}>
          <SelectDropdown items={expirations} defaultValue='' onChange={handleSelectChange} />
        </FormGroup>

        <Stack>
          <Text size='sm' weight='medium'>
            <FormattedMessage id='filters.context_header' defaultMessage='Filter contexts' />
          </Text>
          <Text size='xs' theme='muted'>
            <FormattedMessage
              id='filters.context_hint'
              defaultMessage='One or multiple contexts where the filter should apply'
            />
          </Text>
        </Stack>

        <List>
          <ListItem label={intl.formatMessage(messages.home_timeline)}>
            <Toggle
              checked={homeTimeline}
              onChange={({ target }) => {
                setHomeTimeline(target.checked);
              }}
            />
          </ListItem>
          <ListItem label={intl.formatMessage(messages.public_timeline)}>
            <Toggle
              checked={publicTimeline}
              onChange={({ target }) => {
                setPublicTimeline(target.checked);
              }}
            />
          </ListItem>
          <ListItem label={intl.formatMessage(messages.notifications)}>
            <Toggle
              checked={notifications}
              onChange={({ target }) => {
                setNotifications(target.checked);
              }}
            />
          </ListItem>
          <ListItem label={intl.formatMessage(messages.conversations)}>
            <Toggle
              checked={conversations}
              onChange={({ target }) => {
                setConversations(target.checked);
              }}
            />
          </ListItem>
          {features.filtersV2 && (
            <ListItem label={intl.formatMessage(messages.accounts)}>
              <Toggle
                checked={accounts}
                onChange={({ target }) => {
                  setAccounts(target.checked);
                }}
              />
            </ListItem>
          )}
        </List>

        <List>
          {features.filtersV2BlurAction ? (
            <ListItem
              label={intl.formatMessage(messages.filter_action_header)}
              hint={intl.formatMessage(messages.filter_action_hint)}
            >
              <Select
                value={filterAction}
                onChange={({ target }) => {
                  setFilterAction(target.value as Filter['filter_action']);
                }}
              >
                <option value='warn'>{intl.formatMessage(messages.filter_action_warn)}</option>
                <option value='hide'>{intl.formatMessage(messages.filter_action_hide)}</option>
                <option value='blur'>{intl.formatMessage(messages.filter_action_blur)}</option>
              </Select>
            </ListItem>
          ) : (
            <ListItem
              label={intl.formatMessage(
                features.filtersV2 ? messages.hide_header : messages.drop_header,
              )}
              hint={intl.formatMessage(
                features.filtersV2 ? messages.hide_hint : messages.drop_hint,
              )}
            >
              <Toggle
                checked={filterAction === 'hide'}
                onChange={({ target }) => {
                  setFilterAction(target.checked ? 'hide' : 'warn');
                }}
              />
            </ListItem>
          )}
        </List>

        {features.filtersV2 && keywordsField}

        <FormActions>
          <Button
            type='submit'
            theme='primary'
            disabled={isFetchingFilter || isUpdating || isCreating}
          >
            {intl.formatMessage(filterId !== 'new' ? messages.edit : messages.add_new)}
          </Button>
        </FormActions>
      </Form>
    </Column>
  );
};

export { EditFilterPage as default };
