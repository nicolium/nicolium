import React, { useState, useMemo } from 'react';
import * as v from 'valibot';

import { frontendConfigSchema } from '@/schemas/frontend-config';
import { useFrontendConfigStore } from '@/stores/frontend-config';
import { getUpdateFrontendConfigParams, useUpdateAdminConfig } from '@/queries/admin/use-config';

import type { changeSetting } from '@/actions/settings';
import { recursiveChangeSetting, type useSettings } from '@/stores/settings';
import { settingsSchema } from '@/schemas/frontend-settings';
import { create } from 'mutative';
import ConfigDB from '@/utils/config-db';
import { defineMessages } from 'react-intl';
import toast from '@/toast';

const messages = defineMessages({
  saved: { id: 'common.saved', defaultMessage: 'Saved' },
});

interface ISettingsPage {
  changeSetting?: typeof changeSetting;
  settings?: ReturnType<typeof useSettings>;
  onSave?: () => void;
  disabled?: boolean;
}

interface IDefaultSettingsWrapper {
  settingsPage: React.FC<ISettingsPage>
}

const DefaultSettingsWrapper: React.FC<IDefaultSettingsWrapper> = ({ settingsPage: SettingsPage }) => {
  const initialData = useFrontendConfigStore((state) => state.partialConfig);
  const { mutate: updateConfig, isPending } = useUpdateAdminConfig();

  const [data, setData] = useState(v.parse(frontendConfigSchema, initialData));
  const [changed, setChanged] = useState(false);

  const settings = useMemo(() => v.parse(settingsSchema, data.defaultSettings), [data.defaultSettings]);

  const onSave = () => {
    updateConfig(getUpdateFrontendConfigParams(data), {
      onSuccess: ({ configs }) => {
        toast.success(messages.saved);
        const updatedConfig = ConfigDB.find(configs, ':pleroma', ':frontend_configurations')!.value.find(
          (value: Record<string, any>) => value.tuple?.[0] === ':nicolium',
        ).tuple?.[1];
        setData(v.parse(frontendConfigSchema, updatedConfig));
        setChanged(false);
      },
    });
  }

  const changeSetting = (path: string[], value: any) => {
    setData((data) => create(data, (draft) => {
      // const defaultSettings = v.parse(settingsSchema, draft.defaultSettings);
      recursiveChangeSetting(draft.defaultSettings, path, value, settings);
    }));
    setChanged(true);
  }
  
  return (
    <SettingsPage
      settings={settings}
      changeSetting={changeSetting}
      onSave={onSave}
      disabled={isPending || !changed}
    />
  )
};

export { DefaultSettingsWrapper as default, type ISettingsPage }
