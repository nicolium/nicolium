import { Host as SwiftUIHost, Toggle as SwiftUIToggle } from '@expo/ui/swift-ui';
import { labelsHidden } from '@expo/ui/swift-ui/modifiers';
import {
  ActivityIndicator,
  Appbar,
  Button,
  Divider,
  IconButton,
  List as PaperList,
  Switch,
  TextInput,
  useTheme,
} from '@mkljczk/react-native-paper';
import { FlashList } from '@shopify/flash-list';
import { FunnelIcon } from 'phosphor-react-native/src/icons/Funnel';
import { PlusIcon } from 'phosphor-react-native/src/icons/Plus';
import { TrashIcon } from 'phosphor-react-native/src/icons/Trash';
import { XIcon } from 'phosphor-react-native/src/icons/X';
import React, { useEffect, useMemo, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import { EmptyMessage } from '@/components/ui/empty-message';
import { GlassButton } from '@/components/ui/glass-button';
import { HeaderBackButton, HeaderIconButton } from '@/components/ui/header-icon-button';
import { iconHelper } from '@/components/ui/icon';
import { List } from '@/components/ui/list';
import { useFeatures } from '@/contexts/current-account-context';
import { useEnableLiquidGlass } from '@/hooks/use-enable-liquid-glass';
import {
  type FilterContextType,
  useCreateFilter,
  useDeleteFilter,
  useFilter,
  useFilters,
  useUpdateFilter,
} from '@/queries/settings/use-filters';
import { getSegmentedMenuStyles } from '@/utils/themes';

import type { SettingsStackParams } from '@/router/router';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Filter } from 'pl-api';

interface IFilterKeyword {
  id?: string;
  keyword: string;
  whole_word: boolean;
  _destroy?: boolean;
}

const EXPIRATIONS = [0, 1800, 3600, 21600, 43200, 86400, 604800] as const;

const CONTEXTS: Array<FilterContextType> = ['home', 'public', 'notifications', 'thread', 'account'];

const messages = defineMessages({
  filtersHeading: { id: 'column.filters', defaultMessage: 'Muted words' },
  cancel: { id: 'common.cancel', defaultMessage: 'Cancel' },
  addFilter: { id: 'column.filters.add_new', defaultMessage: 'Add new filter' },
  title: { id: 'column.filters.title', defaultMessage: 'Title' },
  keyword: { id: 'column.filters.keyword', defaultMessage: 'Keyword or phrase' },
  addKeyword: { id: 'column.filters.add_keyword', defaultMessage: 'Add keyword' },
  removeKeyword: { id: 'column.filters.remove_keyword', defaultMessage: 'Remove keyword' },
  expires: { id: 'column.filters.expires', defaultMessage: 'Expire after' },
  createError: { id: 'column.filters.create.error', defaultMessage: 'Failed to add filter' },
  editError: { id: 'column.filters.edit.error', defaultMessage: 'Failed to edit filter' },
  createSuccess: { id: 'column.filters.create.success', defaultMessage: 'Filter added' },
  editSuccess: { id: 'column.filters.edit.success', defaultMessage: 'Filter updated' },
  deleteHeading: { id: 'confirmations.delete_filter.heading', defaultMessage: 'Delete filter' },
  deleteMessage: {
    id: 'confirmations.delete_filter.message',
    defaultMessage: 'Are you sure you want to delete this filter?',
  },
  deleteConfirm: { id: 'confirmations.delete_filter.confirm', defaultMessage: 'Delete' },
  deleteFilter: { id: 'column.filters.delete', defaultMessage: 'Delete filter' },
  deleteSuccess: { id: 'column.filters.delete.success', defaultMessage: 'Filter deleted' },
  deleteError: { id: 'column.filters.delete.error', defaultMessage: 'Failed to delete filter' },
  expirationNever: { id: 'column.filters.expiration.never', defaultMessage: 'Never' },
  expiration1800: { id: 'column.filters.expiration.1800', defaultMessage: '30 minutes' },
  expiration3600: { id: 'column.filters.expiration.3600', defaultMessage: '1 hour' },
  expiration21600: { id: 'column.filters.expiration.21600', defaultMessage: '6 hours' },
  expiration43200: { id: 'column.filters.expiration.43200', defaultMessage: '12 hours' },
  expiration86400: { id: 'column.filters.expiration.86400', defaultMessage: '1 day' },
  expiration604800: { id: 'column.filters.expiration.604800', defaultMessage: '1 week' },
  home: { id: 'column.filters.home_timeline', defaultMessage: 'Home timeline' },
  public: { id: 'column.filters.public_timeline', defaultMessage: 'Public timeline' },
  notifications: { id: 'column.filters.notifications', defaultMessage: 'Notifications' },
  thread: { id: 'column.filters.conversations', defaultMessage: 'Conversations' },
  account: { id: 'column.filters.accounts', defaultMessage: 'Accounts' },
  actionWarn: { id: 'column.filters.filter_action_warn', defaultMessage: 'Hide with a warning' },
  actionHide: { id: 'column.filters.filter_action_hide', defaultMessage: 'Hide completely' },
  actionBlur: {
    id: 'column.filters.filter_action_blur',
    defaultMessage: 'Hide media with a warning',
  },
  contextLabel: { id: 'filters.filters_list_context.label', defaultMessage: 'Filter contexts:' },
  expiresAt: { id: 'column.filters.expires_at', defaultMessage: 'Expires {date}' },
  expired: { id: 'column.filters.expired', defaultMessage: 'Expired' },
  filterAction: { id: 'column.filters.filter_action.header', defaultMessage: 'Filter action' },
  contexts: { id: 'filters.context.header', defaultMessage: 'Filter contexts' },
});

const FiltersScreen = ({ navigation }: NativeStackScreenProps<SettingsStackParams, 'filters'>) => {
  const { colors } = useTheme();
  const intl = useIntl();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const { data: filters, isPending } = useFilters();

  const getDescription = (filter: Filter) => {
    const description: Array<string> = [];

    const keywords = intl.formatList(
      filter.keywords.map(({ keyword }) => keyword),
      { type: 'conjunction' },
    );

    description.push(keywords);

    description.push(
      intl.formatMessage(messages.contextLabel) +
        ' ' +
        intl.formatList(filter.context.map((context) => intl.formatMessage(messages[context]))),
    );

    if (filter.expires_at) {
      const expired = Date.parse(filter.expires_at) < Date.now();

      description.push(
        expired
          ? intl.formatMessage(messages.expired)
          : intl.formatMessage(messages.expiresAt, {
              date: intl.formatDate(filter.expires_at, {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              }),
            }),
      );
    }

    return description.join(' · ');
  };

  return (
    <>
      <Appbar.Header
        style={{
          backgroundColor: colors.surfaceContainer,
        }}
      >
        <HeaderBackButton onPress={navigation.goBack} />
        <Appbar.Content title={intl.formatMessage(messages.filtersHeading)} />
        <HeaderIconButton icon={PlusIcon} onPress={() => navigation.navigate('filter', {})} />
      </Appbar.Header>

      <FlashList
        data={filters}
        renderItem={({ item }) => (
          <PaperList.Item
            title={item.title || item.keywords.map(({ keyword }) => keyword).join(', ')}
            description={getDescription(item)}
            descriptionNumberOfLines={2}
            left={(props) => <PaperList.Icon {...props} icon={iconHelper(FunnelIcon)} />}
            onPress={() => navigation.navigate('filter', { id: item.id })}
          />
        )}
        ItemSeparatorComponent={Divider}
        ListEmptyComponent={
          !isPending ? (
            <EmptyMessage
              emptyMessageText={
                <FormattedMessage
                  id='empty_column.filters'
                  defaultMessage='You haven’t created any muted words yet.'
                />
              }
            />
          ) : null
        }
        ListFooterComponent={
          isPending ? (
            <ActivityIndicator style={{ marginVertical: 8 }} size='large' />
          ) : (
            <View style={{ height: 88 + bottomInset }} />
          )
        }
      />
    </>
  );
};

const FilterEditorScreen = ({
  navigation,
  route,
}: NativeStackScreenProps<SettingsStackParams, 'filter'>) => {
  const filterId = route.params?.id;

  const intl = useIntl();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const features = useFeatures();
  const glassEffect = useEnableLiquidGlass();
  const theme = useTheme();

  const { data: filter, isFetching } = useFilter(filterId);
  const { mutate: createFilter, isPending: isCreating } = useCreateFilter();
  const { mutate: updateFilter, isPending: isUpdating } = useUpdateFilter(filterId ?? '');
  const { mutate: deleteFilter } = useDeleteFilter();

  const [title, setTitle] = useState('');
  const [expiresIn, setExpiresIn] = useState<number>(0);
  const [context, setContext] = useState<Array<FilterContextType>>(['home']);
  const [filterAction, setFilterAction] = useState<Filter['filter_action']>('warn');
  const [keywords, setKeywords] = useState<Array<IFilterKeyword>>([
    { keyword: '', whole_word: false },
  ]);

  useEffect(() => {
    if (!filter) return;

    setTitle(filter.title);
    setContext(filter.context);
    setFilterAction(filter.filter_action);
    setKeywords(filter.keywords);
  }, [filter?.id]);

  const localFilters = !features.filters && !features.filtersV2;
  const multipleKeywords = features.filtersV2 || localFilters;
  const filterTitle = features.filtersV2 || localFilters;
  const accountsContextType = features.filtersV2;
  const blurAction = features.filtersV2BlurAction || localFilters;

  const expirations = useMemo(
    () =>
      EXPIRATIONS.map((value) => ({
        value,
        label: intl.formatMessage(
          value
            ? messages[`expiration${value}` as `expiration${Exclude<typeof value, 0>}`]
            : messages.expirationNever,
        ),
      })),
    [],
  );

  const visibleKeywords = keywords
    .map((keyword, index) => ({ ...keyword, index }))
    .filter((keyword) => !keyword._destroy);

  const canSubmit =
    !isCreating &&
    !isUpdating &&
    context.length > 0 &&
    !visibleKeywords.some(({ keyword }) => !keyword.trim()) &&
    (!filterTitle || !!title.trim());

  const toggleContext = (value: FilterContextType) =>
    setContext((context) =>
      context.includes(value) ? context.filter((item) => item !== value) : [...context, value],
    );

  const handleChangeKeyword = (index: number, changes: Partial<IFilterKeyword>) =>
    setKeywords((keywords) =>
      keywords.map((keyword, i) => (i === index ? { ...keyword, ...changes } : keyword)),
    );

  const handleAddKeyword = () =>
    setKeywords((keywords) => [...keywords, { keyword: '', whole_word: false }]);

  const handleRemoveKeyword = (index: number) =>
    setKeywords((keywords) =>
      keywords[index].id
        ? keywords.map((keyword, i) => (i === index ? { ...keyword, _destroy: true } : keyword))
        : keywords.filter((_, i) => i !== index),
    );

  const handleSubmit = () => {
    const params = {
      title: filterTitle ? title.trim() : visibleKeywords[0]?.keyword.trim(),
      expires_in: expiresIn || undefined,
      context,
      filter_action: filterAction,
      keywords_attributes: keywords
        .filter(({ keyword, _destroy }) => _destroy || keyword.trim())
        .map(({ keyword, ...rest }) => ({ ...rest, keyword: keyword.trim() })),
    };

    (filterId ? updateFilter : createFilter)(params, {
      onSuccess: () => {
        toast.success(intl.formatMessage(filterId ? messages.editSuccess : messages.createSuccess));
        navigation.goBack();
      },
      onError: () => {
        toast.error(intl.formatMessage(filterId ? messages.editError : messages.createError));
      },
    });
  };

  const handleDelete = () => {
    if (!filterId) return;

    Alert.alert(
      intl.formatMessage(messages.deleteHeading),
      intl.formatMessage(messages.deleteMessage),
      [
        { text: intl.formatMessage(messages.cancel), style: 'cancel' },
        {
          text: intl.formatMessage(messages.deleteConfirm),
          style: 'destructive',
          onPress: () =>
            deleteFilter(filterId, {
              onSuccess: () => {
                toast.success(intl.formatMessage(messages.deleteSuccess));
                navigation.goBack();
              },
              onError: () => toast.success(intl.formatMessage(messages.deleteError)),
            }),
        },
      ],
    );
  };

  if (filterId && isFetching && !filter) {
    return <ActivityIndicator style={{ marginVertical: 16 }} size='large' />;
  }

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: bottomInset }}
      keyboardShouldPersistTaps='handled'
    >
      <PaperList.Section>
        {filterTitle && (
          <View style={{ padding: 16, paddingBottom: 0 }}>
            <TextInput
              label={intl.formatMessage(messages.title)}
              value={title}
              onChangeText={setTitle}
              variant='outlined'
            />
          </View>
        )}
      </PaperList.Section>
      <PaperList.Section>
        <PaperList.Subheader>
          {multipleKeywords ? (
            <FormattedMessage id='column.filters.keywords' defaultMessage='Keywords or phrases' />
          ) : (
            <FormattedMessage id='column.filters.keyword' defaultMessage='Keyword or phrase' />
          )}
        </PaperList.Subheader>
        {visibleKeywords.map(({ index, keyword, whole_word }) => (
          <View key={index} style={{ padding: 16, paddingTop: 0 }}>
            <TextInput
              value={keyword}
              onChangeText={(value) => handleChangeKeyword(index, { keyword: value })}
              placeholder={intl.formatMessage(messages.keyword)}
              variant='outlined'
              autoCapitalize='none'
              endAccessory={
                multipleKeywords && visibleKeywords.length > 1
                  ? ({ style }) => (
                      <IconButton
                        icon={iconHelper(XIcon)}
                        size={20}
                        style={[style, { margin: 0 }]}
                        onPress={() => handleRemoveKeyword(index)}
                        accessibilityLabel={intl.formatMessage(messages.removeKeyword)}
                      />
                    )
                  : undefined
              }
            />
            <PaperList.Item
              title={
                <FormattedMessage id='column.filters.whole_word' defaultMessage='Whole word' />
              }
              right={() =>
                glassEffect ? (
                  <Pressable onPress={() => {}}>
                    <SwiftUIHost matchContents style={{ width: 64 }}>
                      <SwiftUIToggle
                        isOn={whole_word}
                        onIsOnChange={() => handleChangeKeyword(index, { whole_word: !whole_word })}
                        label=''
                        modifiers={[labelsHidden()]}
                      />
                    </SwiftUIHost>
                  </Pressable>
                ) : (
                  <Switch
                    value={whole_word}
                    onValueChange={(value) => handleChangeKeyword(index, { whole_word: value })}
                  />
                )
              }
              onPress={() => handleChangeKeyword(index, { whole_word: !whole_word })}
              style={[getSegmentedMenuStyles(theme, false, 0, 1), { marginTop: 16 }]}
              containerStyle={{ alignItems: 'center' }}
            />
          </View>
        ))}
        {multipleKeywords && (
          <Button
            mode='text'
            icon={iconHelper(PlusIcon)}
            onPress={handleAddKeyword}
            style={{ alignSelf: 'flex-start', marginHorizontal: 8 }}
          >
            {intl.formatMessage(messages.addKeyword)}
          </Button>
        )}
      </PaperList.Section>

      <List
        sections={[
          {
            items: [
              {
                type: 'select',
                label: intl.formatMessage(messages.expires),
                sublabel:
                  filter?.expires_at && !expiresIn
                    ? intl.formatMessage(messages.expiresAt, {
                        date: intl.formatDate(filter.expires_at, {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        }),
                      })
                    : undefined,
                active: expiresIn,
                onChange: setExpiresIn,
                options: expirations,
              },
              {
                type: 'select',
                label: intl.formatMessage(messages.filterAction),
                active: filterAction,
                onChange: setFilterAction,
                options: [
                  { value: 'warn', label: intl.formatMessage(messages.actionWarn) },
                  { value: 'hide', label: intl.formatMessage(messages.actionHide) },
                  ...(blurAction
                    ? [{ value: 'blur', label: intl.formatMessage(messages.actionBlur) }]
                    : []),
                ],
              },
            ],
          },
          {
            subheader: intl.formatMessage(messages.contexts),
            items: CONTEXTS.filter((value) => value !== 'account' || accountsContextType).map(
              (value) => ({
                type: 'toggle',
                label: intl.formatMessage(messages[value]),
                active: context.includes(value),
                onPress: () => toggleContext(value),
              }),
            ),
          },
        ]}
      />

      <View style={{ flexDirection: 'row', gap: 8, padding: 16 }}>
        {filterId && (
          <GlassButton
            mode='outlined'
            icon={iconHelper(TrashIcon)}
            onPress={handleDelete}
            destructive
          >
            {intl.formatMessage(messages.deleteFilter)}
          </GlassButton>
        )}
        <GlassButton
          mode='contained'
          onPress={handleSubmit}
          disabled={!canSubmit}
          loading={isCreating || isUpdating}
          containerStyle={{ marginLeft: 'auto' }}
          style={{ marginLeft: 'auto' }}
        >
          <FormattedMessage id='common.save' defaultMessage='Save' />
        </GlassButton>
      </View>
    </ScrollView>
  );
};

export { FiltersScreen, FilterEditorScreen };
