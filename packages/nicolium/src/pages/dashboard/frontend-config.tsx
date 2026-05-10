import { create } from 'mutative';
import React, { useState, useEffect, useMemo } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';
import * as v from 'valibot';

import { uploadMedia } from '@/actions/media';
import List, { ListItem } from '@/components/list';
import Accordion from '@/components/ui/accordion';
import Button from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import Column from '@/components/ui/column';
import FileInput from '@/components/ui/file-input';
import Form from '@/components/ui/form';
import FormActions from '@/components/ui/form-actions';
import FormGroup from '@/components/ui/form-group';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import Streamfield from '@/components/ui/streamfield';
import Textarea from '@/components/ui/textarea';
import Toggle from '@/components/ui/toggle';
import ThemeSelector from '@/features/ui/components/theme-selector';
import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import CryptoAddressInput from '@/pages/dashboard/components/frontend-config/crypto-address-input';
import FooterLinkInput from '@/pages/dashboard/components/frontend-config/footer-link-input';
import PromoPanelInput from '@/pages/dashboard/components/frontend-config/promo-panel-input';
import SitePreview from '@/pages/dashboard/components/frontend-config/site-preview';
import { getUpdateFrontendConfigParams, useUpdateAdminConfig } from '@/queries/admin/use-config';
import {
  cryptoAddressSchema,
  footerItemSchema,
  frontendConfigSchema,
  promoPanelItemSchema,
  type FrontendConfig,
} from '@/schemas/frontend-config';
import { useFrontendConfigStore } from '@/stores/frontend-config';
import toast from '@/toast';

const messages = defineMessages({
  heading: { id: 'column.frontend_config', defaultMessage: 'Front-end configuration' },
  saved: { id: 'frontend_config.saved', defaultMessage: 'Nicolium config saved!' },
  copyrightFooterLabel: {
    id: 'frontend_config.copyright_footer.meta_fields.label_placeholder',
    defaultMessage: 'Copyright footer',
  },
  cryptoDonatePanelLimitLabel: {
    id: 'frontend_config.crypto_donate_panel_limit.meta_fields.limit_placeholder',
    defaultMessage: 'Number of items to display in the crypto homepage widget',
  },
  rawJSONInvalid: { id: 'frontend_config.raw_json_invalid', defaultMessage: 'is invalid' },
  tileServerLabel: { id: 'frontend_config.tile_server_label', defaultMessage: 'Map tile server' },
  tileServerAttributionLabel: {
    id: 'frontend_config.tile_server_attribution_label',
    defaultMessage: 'Map tiles attribution',
  },
});

type ValueGetter<T1 = Element, T2 = any> = (e: React.ChangeEvent<T1>) => T2;
type StreamItemConfigPath =
  | ['promoPanel', 'items']
  | ['navlinks', 'homeFooter']
  | ['cryptoAddresses'];
type ThemeChangeHandler = (theme: 'system' | 'light' | 'dark' | 'black') => void;

const FrontendConfigEditor: React.FC = () => {
  const intl = useIntl();
  const client = useClient();

  const features = useFeatures();

  const initialData = useFrontendConfigStore((state) => state.partialConfig);
  const { mutate: updateConfig, isPending } = useUpdateAdminConfig();

  const [data, setData] = useState(v.parse(frontendConfigSchema, initialData));
  const [jsonEditorExpanded, setJsonEditorExpanded] = useState(false);
  const [rawJSON, setRawJSON] = useState<string>(JSON.stringify(initialData, null, 2));
  const [jsonValid, setJsonValid] = useState(true);

  const frontendConfig = useMemo(() => v.parse(frontendConfigSchema, data), [data]);

  const setConfig = (newData: FrontendConfig) => {
    setData(newData);
    setJsonValid(true);
  };

  const putConfig = (newData: FrontendConfig) => {
    setData(newData);
    setJsonValid(true);
  };

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
    updateConfig(getUpdateFrontendConfigParams(data), {
      onSuccess: () => {
        toast.success(messages.saved);
      },
    });
    e.preventDefault();
  };

  const handleChange =
    (
      path: keyof FrontendConfig,
      getValue: ValueGetter<any, FrontendConfig[typeof path]>,
    ): React.ChangeEventHandler =>
    (e) => {
      const newData: FrontendConfig = { ...data, [path]: getValue(e) };
      setConfig(newData);
    };

  const handleThemeChange: ThemeChangeHandler = (theme) => {
    const newData = create(data, (draft) => {
      if (!draft.defaultSettings) draft.defaultSettings = {};
      draft.defaultSettings.themeMode = theme;
    });
    setConfig(newData);
  };

  const handleFileChange =
    (path: keyof FrontendConfig): React.ChangeEventHandler<HTMLInputElement> =>
    (e) => {
      const file = e.target.files?.item(0);

      if (file) {
        uploadMedia(client, { file })
          .then((data) => {
            handleChange(path, () => data.url)(e);
          })
          .catch(console.error);
      }
    };

  const handleStreamItemChange = (path: StreamItemConfigPath) => (values: any[]) => {
    const newData = create(data, (draft) => {
      if (path[0] === 'cryptoAddresses') {
        draft.cryptoAddresses = values;
      } else {
        // @ts-expect-error
        draft[path[0]][path[1]] = values;
      }
    });
    setConfig(newData);
  };

  const addStreamItem =
    <T,>(path: StreamItemConfigPath, schema: v.BaseSchema<any, T, v.BaseIssue<unknown>>) =>
    () => {
      const newData = create(data, (draft) => {
        if (path[0] === 'cryptoAddresses') {
          draft.cryptoAddresses.push(v.parse(cryptoAddressSchema, {}));
        } else {
          // @ts-expect-error
          draft[path[0]][path[1]].push(v.parse(schema, {}));
        }
      });
      setConfig(newData);
    };

  const deleteStreamItem = (path: StreamItemConfigPath) => (i: number) => {
    const newData = create(data, (draft) => {
      if (path[0] === 'cryptoAddresses') {
        draft.cryptoAddresses = draft.cryptoAddresses.filter((_, index) => index !== i);
      } else {
        // @ts-expect-error
        draft[path[0]][path[1]] = draft[path[0]][path[1]].filter((_, index) => index !== i);
      }
    });
    setConfig(newData);
  };

  const handleEditJSON: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setRawJSON(e.target.value);
  };

  const toggleJSONEditor = (expanded: boolean) => {
    setJsonEditorExpanded(expanded);
  };

  useEffect(() => {
    putConfig(v.parse(frontendConfigSchema, initialData));
  }, [initialData]);

  useEffect(() => {
    setRawJSON(JSON.stringify(data, null, 2));
  }, [data]);

  useEffect(() => {
    try {
      const data = v.parse(frontendConfigSchema, JSON.parse(rawJSON));
      putConfig(data);
    } catch {
      setJsonValid(false);
    }
  }, [rawJSON]);

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Form onSubmit={handleSubmit}>
        <fieldset className='space-y-6' disabled={isPending}>
          <SitePreview frontendConfig={frontendConfig} />

          <CardHeader>
            <CardTitle
              title={
                <FormattedMessage id='frontend_config.headings.theme' defaultMessage='Theme' />
              }
            />
          </CardHeader>

          <List>
            <ListItem
              label={
                <FormattedMessage
                  id='frontend_config.fields.theme_label'
                  defaultMessage='Default theme'
                />
              }
            >
              <ThemeSelector
                value={frontendConfig.defaultSettings?.themeMode ?? 'system'}
                onChange={handleThemeChange}
              />
            </ListItem>

            <ListItem
              label={
                <FormattedMessage
                  id='frontend_config.fields.edit_theme_label'
                  defaultMessage='Edit theme'
                />
              }
              to='/nicolium/config/theme'
            />
          </List>

          <FormGroup
            labelText={
              <FormattedMessage id='frontend_config.fields.logo_label' defaultMessage='Logo' />
            }
            hintText={
              <FormattedMessage
                id='frontend_config.hints.logo'
                defaultMessage='SVG or PNG. At most 2 MB. Will be displayed to 50px height, maintaining aspect ratio'
              />
            }
          >
            <FileInput onChange={handleFileChange('logo')} accept='image/svg+xml,image/png' />
          </FormGroup>

          <FormGroup
            labelText={
              <FormattedMessage
                id='frontend_config.fields.logo_dark_label'
                defaultMessage='Logo (dark)'
              />
            }
            hintText={
              <FormattedMessage
                id='frontend_config.hints.logo_dark'
                defaultMessage='SVG or PNG. At most 2 MB. Will be displayed when in dark mode'
              />
            }
          >
            <FileInput
              onChange={handleFileChange('logoDarkMode')}
              accept='image/svg+xml,image/png'
            />
          </FormGroup>

          {(data.logo || data.logoDarkMode) && (
            <List>
              <ListItem
                label={
                  <FormattedMessage
                    id='frontend_config.fields.logo_alignment'
                    defaultMessage='Logo alignment'
                  />
                }
              >
                <Select
                  className='w-fit'
                  onChange={handleChange('logoAlignment', (e) => e.target.value)}
                  defaultValue={data.logoAlignment}
                >
                  <option value='center'>
                    <FormattedMessage
                      id='frontend_config.fields.logo_alignment.center'
                      defaultMessage='Center'
                    />
                  </option>
                  <option value='left'>
                    <FormattedMessage
                      id='frontend_config.fields.logo_alignment.left'
                      defaultMessage='Left'
                    />
                  </option>
                </Select>
              </ListItem>
            </List>
          )}

          <CardHeader>
            <CardTitle
              title={
                <FormattedMessage id='frontend_config.headings.options' defaultMessage='Options' />
              }
            />
          </CardHeader>

          <List>
            <ListItem
              label={
                <FormattedMessage
                  id='frontend_config.media_preview_label'
                  defaultMessage='Prefer preview media for thumbnails'
                />
              }
              hint={
                <FormattedMessage
                  id='frontend_config.media_preview_hint'
                  defaultMessage='Some backends provide an optimized version of media for display in timelines. However, these preview images may be too small without additional configuration.'
                />
              }
            >
              <Toggle
                checked={frontendConfig.mediaPreview}
                onChange={handleChange('mediaPreview', (e) => e.target.checked)}
              />
            </ListItem>

            <ListItem
              label={
                <FormattedMessage
                  id='frontend_config.allow_displaying_remote_no_login_label'
                  defaultMessage='Allow displaying remote content when not logged in'
                />
              }
              hint={
                <FormattedMessage
                  id='frontend_config.allow_displaying_remote_no_login_hint'
                  defaultMessage='When disabled, users will be navigated to origin URLs when trying to view remote content.'
                />
              }
            >
              <Toggle
                checked={frontendConfig.allowDisplayingRemoteNoLogin}
                onChange={handleChange('allowDisplayingRemoteNoLogin', (e) => e.target.checked)}
              />
            </ListItem>

            <ListItem
              label={
                <FormattedMessage
                  id='frontend_config.redirect_root_no_login_label'
                  defaultMessage='Redirect homepage'
                />
              }
              hint={
                <FormattedMessage
                  id='frontend_config.redirect_root_no_login_hint'
                  defaultMessage='Path to redirect the homepage when a user is not logged in.'
                />
              }
            >
              <Input
                type='text'
                placeholder='/timeline/local'
                value={String(data.redirectRootNoLogin || '')}
                onChange={handleChange('redirectRootNoLogin', (e) => e.target.value)}
              />
            </ListItem>

            <ListItem
              label={
                <FormattedMessage
                  id='frontend_config.sentry_dsn_label'
                  defaultMessage='Sentry DSN'
                />
              }
              hint={
                <FormattedMessage
                  id='frontend_config.sentry_dsn_hint'
                  defaultMessage='DSN URL for error reporting. Works with Sentry and GlitchTip.'
                />
              }
            >
              <Input
                type='text'
                placeholder='https://01234abcdef@glitch.tip.tld/5678'
                value={String(data.sentryDsn ?? '')}
                onChange={handleChange('sentryDsn', (e) => e.target.value)}
              />
            </ListItem>
          </List>

          <CardHeader>
            <CardTitle
              title={
                <FormattedMessage
                  id='frontend_config.headings.navigation'
                  defaultMessage='Navigation'
                />
              }
            />
          </CardHeader>

          <Streamfield
            label={
              <FormattedMessage
                id='frontend_config.fields.promo_panel_fields_label'
                defaultMessage='Promo panel items'
              />
            }
            hint={
              <FormattedMessage
                id='frontend_config.hints.promo_panel_fields'
                defaultMessage='You can have custom defined links displayed on the right panel of the timelines page.'
              />
            }
            component={PromoPanelInput}
            values={frontendConfig.promoPanel.items}
            onChange={handleStreamItemChange(['promoPanel', 'items'])}
            onAddItem={addStreamItem(['promoPanel', 'items'], promoPanelItemSchema)}
            onRemoveItem={deleteStreamItem(['promoPanel', 'items'])}
            draggable
          />

          <Streamfield
            label={
              <FormattedMessage
                id='frontend_config.fields.home_footer_fields_label'
                defaultMessage='Home footer items'
              />
            }
            hint={
              <FormattedMessage
                id='frontend_config.hints.home_footer_fields'
                defaultMessage='You can have custom defined links displayed on the footer of your static pages'
              />
            }
            component={FooterLinkInput}
            values={frontendConfig.navlinks.homeFooter || []}
            onChange={handleStreamItemChange(['navlinks', 'homeFooter'])}
            onAddItem={addStreamItem(['navlinks', 'homeFooter'], footerItemSchema)}
            onRemoveItem={deleteStreamItem(['navlinks', 'homeFooter'])}
            draggable
          />

          <FormGroup
            labelText={
              <FormattedMessage
                id='frontend_config.copyright_footer.meta_fields.label_placeholder'
                defaultMessage='Copyright footer'
              />
            }
          >
            <Input
              type='text'
              placeholder={intl.formatMessage(messages.copyrightFooterLabel)}
              value={frontendConfig.copyright}
              onChange={handleChange('copyright', (e) => e.target.value)}
            />
          </FormGroup>

          {features.events && (
            <>
              <CardHeader>
                <CardTitle
                  title={
                    <FormattedMessage
                      id='frontend_config.headings.events'
                      defaultMessage='Events'
                    />
                  }
                />
              </CardHeader>

              <FormGroup
                labelText={
                  <FormattedMessage
                    id='frontend_config.tile_server_label'
                    defaultMessage='Map tile server'
                  />
                }
              >
                <Input
                  type='text'
                  placeholder={intl.formatMessage(messages.tileServerLabel)}
                  value={frontendConfig.tileServer}
                  onChange={handleChange('tileServer', (e) => e.target.value)}
                />
              </FormGroup>

              <FormGroup
                labelText={
                  <FormattedMessage
                    id='frontend_config.tile_server_attribution_label'
                    defaultMessage='Map tiles attribution'
                  />
                }
              >
                <Input
                  type='text'
                  placeholder={intl.formatMessage(messages.tileServerAttributionLabel)}
                  value={frontendConfig.tileServerAttribution}
                  onChange={handleChange('tileServerAttribution', (e) => e.target.value)}
                />
              </FormGroup>
            </>
          )}

          <CardHeader>
            <CardTitle
              title={
                <FormattedMessage
                  id='frontend_config.headings.cryptocurrency'
                  defaultMessage='Cryptocurrency'
                />
              }
            />
          </CardHeader>

          <Streamfield
            label={
              <FormattedMessage
                id='frontend_config.fields.crypto_addresses_label'
                defaultMessage='Cryptocurrency addresses'
              />
            }
            hint={
              <FormattedMessage
                id='frontend_config.hints.crypto_addresses'
                defaultMessage='Add cryptocurrency addresses so users of your site can donate to you. Order matters, and you must use lowercase ticker values.'
              />
            }
            component={CryptoAddressInput}
            values={frontendConfig.cryptoAddresses}
            onChange={handleStreamItemChange(['cryptoAddresses'])}
            onAddItem={addStreamItem(['cryptoAddresses'], cryptoAddressSchema)}
            onRemoveItem={deleteStreamItem(['cryptoAddresses'])}
            draggable
          />

          <FormGroup
            labelText={
              <FormattedMessage
                id='frontend_config.crypto_donate_panel_limit.meta_fields.limit_placeholder'
                defaultMessage='Number of items to display in the crypto homepage widget'
              />
            }
          >
            <Input
              type='number'
              min={0}
              pattern='[0-9]+'
              placeholder={intl.formatMessage(messages.cryptoDonatePanelLimitLabel)}
              value={frontendConfig.cryptoDonatePanel.limit}
              onChange={handleChange('cryptoDonatePanel', (e) => ({
                limit: Number(e.target.value),
              }))}
            />
          </FormGroup>

          <CardHeader>
            <CardTitle
              title={
                <FormattedMessage
                  id='frontend_config.headings.advanced'
                  defaultMessage='Advanced'
                />
              }
            />
          </CardHeader>

          <Accordion
            headline={
              <FormattedMessage
                id='frontend_config.raw_json_label'
                defaultMessage='Advanced: Edit raw JSON data'
              />
            }
            expanded={jsonEditorExpanded}
            onToggle={toggleJSONEditor}
          >
            <FormGroup
              hintText={
                <FormattedMessage
                  id='frontend_config.raw_json_hint'
                  defaultMessage='Edit the settings data directly. Changes made directly to the JSON file will override the form fields above. Click "Save" to apply your changes.'
                />
              }
              errors={jsonValid ? undefined : [intl.formatMessage(messages.rawJSONInvalid)]}
            >
              <Textarea value={rawJSON} onChange={handleEditJSON} isCodeEditor rows={12} />
            </FormGroup>
          </Accordion>
        </fieldset>

        <FormActions>
          <Button type='submit'>
            <FormattedMessage id='frontend_config.save' defaultMessage='Save' />
          </Button>
        </FormActions>
      </Form>
    </Column>
  );
};

export { FrontendConfigEditor as default };
