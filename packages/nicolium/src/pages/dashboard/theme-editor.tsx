import React, { useRef, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import * as v from 'valibot';

import { fetchFrontendConfig } from '@/actions/frontend-config';
import { getHost } from '@/actions/instance';
import DropdownMenu from '@/components/dropdown-menu';
import List, { ListItem } from '@/components/list';
import Button from '@/components/ui/button';
import Column from '@/components/ui/column';
import Form from '@/components/ui/form';
import FormActions from '@/components/ui/form-actions';
import ColorPicker from '@/features/frontend-config/components/color-picker';
import Palette, { type ColorGroup } from '@/features/theme-editor/components/palette';
import { useFrontendConfig } from '@/hooks/use-frontend-config';
import { normalizeColors } from '@/hooks/use-theme-css';
import { getUpdateFrontendConfigParams, useUpdateAdminConfig } from '@/queries/admin/use-config';
import { frontendConfigSchema } from '@/schemas/frontend-config';
import { useFrontendConfigStore } from '@/stores/frontend-config';
import toast from '@/toast';
import { download } from '@/utils/download';

import type { ColorChangeHandler } from 'react-color';

const messages = defineMessages({
  title: { id: 'admin.theme.title', defaultMessage: 'Theme' },
  saved: { id: 'theme_editor.saved', defaultMessage: 'Theme updated!' },
  restore: { id: 'theme_editor.restore', defaultMessage: 'Restore default theme' },
  export: { id: 'theme_editor.export', defaultMessage: 'Export theme' },
  import: { id: 'theme_editor.import', defaultMessage: 'Import theme' },
  importSuccess: {
    id: 'theme_editor.import_success',
    defaultMessage: 'Theme was successfully imported!',
  },
  colorPrimary: { id: 'theme_editor.colors.primary', defaultMessage: 'Primary' },
  colorSecondary: { id: 'theme_editor.colors.secondary', defaultMessage: 'Secondary' },
  colorAccent: { id: 'theme_editor.colors.accent', defaultMessage: 'Accent' },
  colorGray: { id: 'theme_editor.colors.gray', defaultMessage: 'Gray' },
  colorSuccess: { id: 'theme_editor.colors.success', defaultMessage: 'Success' },
  colorDanger: { id: 'theme_editor.colors.danger', defaultMessage: 'Danger' },
  colorGreentext: { id: 'theme_editor.colors.greentext', defaultMessage: 'Greentext' },
  colorAccentBlue: { id: 'theme_editor.colors.accent_blue', defaultMessage: 'Accent Blue' },
  colorGradientStart: {
    id: 'theme_editor.colors.gradient_start',
    defaultMessage: 'Gradient Start',
  },
  colorGradientEnd: { id: 'theme_editor.colors.gradient_end', defaultMessage: 'Gradient End' },
});

/** UI for editing Tailwind theme colors. */
const ThemeEditorPage: React.FC = () => {
  const intl = useIntl();

  const frontendConfig = useFrontendConfig();
  const host = getHost();
  const rawConfig = useFrontendConfigStore((state) => state.partialConfig);
  const { mutate: updateConfig } = useUpdateAdminConfig();

  const [colors, setColors] = useState(normalizeColors(frontendConfig));
  const [isDefault, setIsDefault] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resetKey, setResetKey] = useState(crypto.randomUUID());

  const fileInput = useRef<HTMLInputElement>(null);

  const updateColors = (key: string) => (newColors: ColorGroup) => {
    if (typeof colors[key] === 'string') return;

    setIsDefault(false);
    setColors({
      ...colors,
      [key]: {
        ...colors[key],
        ...newColors,
      },
    });
  };

  const updateColor = (key: string) => (hex: string) => {
    setIsDefault(false);
    setColors({
      ...colors,
      [key]: hex,
    });
  };

  const setTheme = (theme: Record<string, Record<string, string> | string>) => {
    setResetKey(crypto.randomUUID());
    setIsDefault(false);
    setTimeout(() => {
      setColors(theme);
    });
  };

  const resetTheme = () => {
    setTheme(normalizeColors(frontendConfig));
  };

  const updateTheme = () => {
    let params;
    if (isDefault) {
      params = { ...rawConfig, colors: undefined, brandColor: undefined, accentColor: undefined };
    } else {
      params = { ...rawConfig, colors };
    }
    return updateConfig(getUpdateFrontendConfigParams(params));
  };

  const restoreDefaultTheme = () => {
    const config = v.parse(frontendConfigSchema, { brandColor: '#d80482' });
    setTheme(normalizeColors(config));
    setIsDefault(true);
  };

  const exportTheme = () => {
    const data = JSON.stringify(colors, null, 2);
    download(data, 'theme.json');
  };

  const importTheme = () => {
    fileInput.current?.click();
  };

  const handleSelectFile: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.item(0);

    if (file) {
      const text = await file.text();
      const json = JSON.parse(text);
      const colors = v.parse(frontendConfigSchema, { colors: json }).colors;

      if (colors) setTheme(colors);
      toast.success(messages.importSuccess);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      await fetchFrontendConfig(host);
      await updateTheme();
      toast.success(messages.saved);
      setSubmitting(false);
    } catch (e) {
      setSubmitting(false);
    }
  };

  return (
    <Column label={intl.formatMessage(messages.title)}>
      <Form onSubmit={handleSubmit}>
        <List>
          <PaletteListItem
            label={intl.formatMessage(messages.colorPrimary)}
            palette={colors.primary}
            onChange={updateColors('primary')}
            resetKey={resetKey}
          />

          <PaletteListItem
            label={intl.formatMessage(messages.colorSecondary)}
            palette={colors.secondary}
            onChange={updateColors('secondary')}
            resetKey={resetKey}
          />

          <PaletteListItem
            label={intl.formatMessage(messages.colorAccent)}
            palette={colors.accent}
            onChange={updateColors('accent')}
            resetKey={resetKey}
          />

          <PaletteListItem
            label={intl.formatMessage(messages.colorGray)}
            palette={colors.gray}
            onChange={updateColors('gray')}
            resetKey={resetKey}
          />

          <PaletteListItem
            label={intl.formatMessage(messages.colorSuccess)}
            palette={colors.success}
            onChange={updateColors('success')}
            resetKey={resetKey}
          />

          <PaletteListItem
            label={intl.formatMessage(messages.colorDanger)}
            palette={colors.danger}
            onChange={updateColors('danger')}
            resetKey={resetKey}
          />
        </List>

        <List>
          <ColorListItem
            label={intl.formatMessage(messages.colorGreentext)}
            value={colors.greentext}
            onChange={updateColor('greentext')}
          />

          <ColorListItem
            label={intl.formatMessage(messages.colorGradientStart)}
            value={colors['gradient-start']}
            onChange={updateColor('gradient-start')}
          />

          <ColorListItem
            label={intl.formatMessage(messages.colorGradientEnd)}
            value={colors['gradient-end']}
            onChange={updateColor('gradient-end')}
          />
        </List>

        <FormActions>
          <DropdownMenu
            items={[
              {
                text: intl.formatMessage(messages.restore),
                action: restoreDefaultTheme,
                icon: require('@phosphor-icons/core/regular/arrows-clockwise.svg'),
              },
              {
                text: intl.formatMessage(messages.import),
                action: importTheme,
                icon: require('@phosphor-icons/core/regular/export.svg'),
              },
              {
                text: intl.formatMessage(messages.export),
                action: exportTheme,
                icon: require('@phosphor-icons/core/regular/download-simple.svg'),
              },
            ]}
          />
          <Button theme='secondary' onClick={resetTheme}>
            <FormattedMessage id='theme_editor.reset' defaultMessage='Reset' />
          </Button>

          <Button type='submit' theme='primary' disabled={submitting}>
            <FormattedMessage id='theme_editor.save' defaultMessage='Save theme' />
          </Button>
        </FormActions>
      </Form>

      <input
        type='file'
        ref={fileInput}
        multiple
        accept='application/json'
        className='hidden'
        onChange={handleSelectFile}
      />
    </Column>
  );
};

interface IPaletteListItem {
  label: React.ReactNode;
  palette: ColorGroup | string;
  onChange: (palette: ColorGroup) => void;
  resetKey?: string;
  allowTintChange?: boolean;
}

/** Palette editor inside a ListItem. */
const PaletteListItem: React.FC<IPaletteListItem> = ({
  label,
  palette,
  onChange,
  resetKey,
  allowTintChange,
}) =>
  typeof palette === 'string' ? null : (
    <ListItem label={<div className='whitespace-nowrap'>{label}</div>}>
      <Palette
        palette={palette}
        onChange={onChange}
        resetKey={resetKey}
        allowTintChange={allowTintChange}
      />
    </ListItem>
  );

interface IColorListItem {
  label: React.ReactNode;
  value: string | Record<string, string>;
  onChange: (hex: string) => void;
}

/** Single-color picker. */
const ColorListItem: React.FC<IColorListItem> = ({ label, value, onChange }) => {
  if (typeof value !== 'string') return null;

  const handleChange: ColorChangeHandler = (color, _e) => {
    onChange(color.hex);
  };

  return (
    <ListItem label={label}>
      <ColorPicker
        value={value}
        onChange={handleChange}
        className='h-8 w-10 overflow-hidden rounded-md'
      />
    </ListItem>
  );
};

export { ThemeEditorPage as default, PaletteListItem };
