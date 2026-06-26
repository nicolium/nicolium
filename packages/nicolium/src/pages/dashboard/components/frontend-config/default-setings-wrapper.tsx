import { create } from 'mutative';
import React, { useState, useMemo } from 'react';
import { defineMessages } from 'react-intl';
import * as v from 'valibot';

import { useUpdateFrontendConfig } from '@/queries/admin/use-config';
import { frontendConfigSchema } from '@/schemas/frontend-config';
import { settingsSchema } from '@/schemas/frontend-settings';
import { useFrontendConfigStore } from '@/stores/frontend-config';
import { recursiveChangeSetting, type useSettings } from '@/stores/settings';
import toast from '@/toast';

import type { changeSetting } from '@/actions/settings';

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
  settingsPage: React.FC<ISettingsPage>;
}

const DefaultSettingsWrapper: React.FC<IDefaultSettingsWrapper> = ({
  settingsPage: SettingsPage,
}) => {
  const initialData = useFrontendConfigStore((state) => state.partialConfig);
  const { mutate: updateConfig, isPending } = useUpdateFrontendConfig();

  const [data, setData] = useState(v.parse(frontendConfigSchema, initialData));
  const dataRef = React.useRef(data);
  const [changed, setChanged] = useState(false);

  const settings = useMemo(
    () => v.parse(settingsSchema, data.defaultSettings),
    [data.defaultSettings],
  );

  const onSave = () => {
    updateConfig(dataRef.current, {
      onSuccess: (updatedData) => {
        toast.success(messages.saved);
        setData(updatedData);
        dataRef.current = updatedData;
        setChanged(false);
      },
    });
  };

  const changeSetting = (path: string[], value: any) => {
    const updatedData = create(dataRef.current, (draft) => {
      recursiveChangeSetting(draft.defaultSettings, path, value, settings);
    });
    setData(updatedData);
    dataRef.current = updatedData;
    setChanged(true);
  };

  return (
    <SettingsPage
      settings={settings}
      changeSetting={changeSetting}
      onSave={onSave}
      disabled={isPending || !changed}
    />
  );
};

export { DefaultSettingsWrapper as default, type ISettingsPage };
