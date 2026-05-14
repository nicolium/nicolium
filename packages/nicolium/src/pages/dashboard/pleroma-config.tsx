import React, { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { EmptyMessage } from '@/components/empty-message';
import Column from '@/components/ui/column';
import FormGroup from '@/components/ui/form-group';
import Input from '@/components/ui/input';
import Spinner from '@/components/ui/spinner';
import Warning from '@/features/compose/components/warning';
import { ConfigSection } from '@/pages/dashboard/components/pleroma-config/config-section';
import {
  getConfigValueMap,
  getDescriptionSearchText,
  getDescriptionUpdates,
} from '@/pages/dashboard/components/pleroma-config/utils';
import {
  useAdminConfig,
  useAdminConfigDescriptions,
  useUpdateAdminConfig,
} from '@/queries/admin/use-config';
import toast from '@/toast';

import type { PleromaConfigDescription } from 'pl-api';

const messages = defineMessages({
  heading: { id: 'column.admin.pleroma_config', defaultMessage: 'Pleroma configuration' },
  saved: { id: 'admin.pleroma_config.save.success', defaultMessage: 'Configuration saved' },
  saveFailed: {
    id: 'admin.pleroma_config.save.fail',
    defaultMessage: 'Failed to save configuration',
  },
  search: { id: 'admin.pleroma_config.search', defaultMessage: 'Search settings' },
  searchPlaceholder: {
    id: 'admin.pleroma_config.search_placeholder',
    defaultMessage: 'Search by label, key, group or description',
  },
});

type IndexedDescription = {
  description: PleromaConfigDescription;
  searchText: string;
};

const PleromaConfigPage: React.FC = () => {
  const intl = useIntl();
  const { data: descriptions, isLoading: descriptionsLoading } = useAdminConfigDescriptions();
  const { data: currentConfig, isLoading: currentConfigLoading } = useAdminConfig();
  const { mutate: updateConfig, isPending } = useUpdateAdminConfig();

  const [searchInput, setSearchInput] = useState('');
  const deferredSearchInput = useDeferredValue(searchInput);
  const normalizedSearchInput = deferredSearchInput.trim().toLowerCase();

  const indexedDescriptions = useMemo<IndexedDescription[]>(() => {
    if (!descriptions) return [];

    return descriptions.map((description) => ({
      description,
      searchText: getDescriptionSearchText(description),
    }));
  }, [descriptions]);

  const filteredDescriptions = useMemo(() => {
    if (!indexedDescriptions.length) return [];
    if (!normalizedSearchInput.length) {
      return indexedDescriptions.map((entry) => entry.description);
    }

    return indexedDescriptions
      .filter((entry) => entry.searchText.includes(normalizedSearchInput))
      .map((entry) => entry.description);
  }, [indexedDescriptions, normalizedSearchInput]);

  const groupedEntries = useMemo(() => {
    const grouped = filteredDescriptions.reduce<Record<string, PleromaConfigDescription[]>>(
      (result, description) => {
        if (!description.group) return result;

        if (!result[description.group]) {
          result[description.group] = [];
        }

        result[description.group].push(description);
        return result;
      },
      {},
    );

    return Object.entries(grouped)
      .map(
        ([group, groupDescriptions]) =>
          [
            group,
            [...groupDescriptions].sort((left, right) =>
              (left.label ?? left.key ?? '').localeCompare(right.label ?? right.key ?? ''),
            ),
          ] as const,
      )
      .sort(([left], [right]) => left.localeCompare(right));
  }, [filteredDescriptions]);

  const configValueMap = useMemo(
    () => getConfigValueMap(currentConfig?.configs ?? []),
    [currentConfig?.configs],
  );

  const handleSave = useCallback(
    (description: PleromaConfigDescription, value: unknown) => {
      const updates = getDescriptionUpdates(description, value);
      if (!updates.length) return;

      updateConfig(updates, {
        onSuccess: () => {
          toast.success(intl.formatMessage(messages.saved));
        },
        onError: () => {
          toast.error(intl.formatMessage(messages.saveFailed));
        },
      });
    },
    [intl, updateConfig],
  );

  const handleSearchChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {
    setSearchInput(event.target.value);
  }, []);

  const isEmpty = !descriptionsLoading && !descriptions?.length;
  const isFilteredEmpty =
    !descriptionsLoading && !!descriptions?.length && !filteredDescriptions.length;

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      {descriptionsLoading || currentConfigLoading ? (
        <Spinner />
      ) : (
        <div className='⁂-admin-config'>
          {currentConfig?.need_reboot ? (
            <Warning
              message={
                <FormattedMessage
                  id='admin.pleroma_config.need_reboot'
                  defaultMessage='Some configuration changes require a server restart to take effect.'
                />
              }
            />
          ) : null}

          <div className='⁂-admin-config__filters'>
            <FormGroup labelText={intl.formatMessage(messages.search)}>
              <Input
                type='text'
                value={searchInput}
                placeholder={intl.formatMessage(messages.searchPlaceholder)}
                onChange={handleSearchChange}
              />
            </FormGroup>
          </div>

          <div className='⁂-admin-config__sections'>
            {groupedEntries.map(([group, groupDescriptions]) => (
              <ConfigSection
                key={group}
                group={group}
                descriptions={groupDescriptions}
                configValueMap={configValueMap}
                onSave={handleSave}
                isPending={isPending}
              />
            ))}
          </div>

          {isEmpty ? (
            <EmptyMessage
              text={
                <FormattedMessage
                  id='admin.pleroma_config.empty'
                  defaultMessage='No configuration options available.'
                />
              }
            />
          ) : null}

          {isFilteredEmpty ? (
            <EmptyMessage
              text={
                <FormattedMessage
                  id='admin.pleroma_config.empty_search'
                  defaultMessage='No settings match the current filters.'
                />
              }
            />
          ) : null}
        </div>
      )}
    </Column>
  );
};

export { PleromaConfigPage as default };
