import React, { useState, useEffect } from 'react';
import { useIntl, FormattedMessage, defineMessages } from 'react-intl';

import { changeSetting, updateSettingsStore } from '@/actions/settings';
import List, { ListItem } from '@/components/list';
import Button from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import Column from '@/components/ui/column';
import Form from '@/components/ui/form';
import FormActions from '@/components/ui/form-actions';
import FormGroup from '@/components/ui/form-group';
import Textarea from '@/components/ui/textarea';
import SettingToggle from '@/pages/settings/components/setting-toggle';
import { useSettingsStore, useSettingsStoreActions } from '@/stores/settings';
import toast from '@/toast';

const isJSONValid = (text: any): boolean => {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
};

const messages = defineMessages({
  heading: { id: 'column.settings_store', defaultMessage: 'Settings store' },
});

const SettingsStore: React.FC = () => {
  const intl = useIntl();
  const { settings, userSettings } = useSettingsStore();
  const { loadUserSettings } = useSettingsStoreActions();

  const [rawJSON, setRawJSON] = useState<string>(JSON.stringify(userSettings, null, 2));
  const [jsonValid, setJsonValid] = useState(true);
  const [isLoading, setLoading] = useState(false);

  const handleEditJSON: React.ChangeEventHandler<HTMLTextAreaElement> = ({ target }) => {
    const rawJSON = target.value;
    setRawJSON(rawJSON);
    setJsonValid(isJSONValid(rawJSON));
  };

  const onToggleChange = (key: string[], checked: boolean) => {
    changeSetting(key, checked, { showAlert: true });
  };

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = () => {
    const settings = JSON.parse(rawJSON);

    setLoading(true);
    updateSettingsStore(settings)
      .then(() => {
        loadUserSettings(settings);
        setLoading(false);
      })
      .catch((error) => {
        toast.showAlertForError(error);
        setLoading(false);
      });
  };

  useEffect(() => {
    setRawJSON(JSON.stringify(userSettings, null, 2));
    setJsonValid(true);
  }, [userSettings]);

  return (
    <Column label={intl.formatMessage(messages.heading)} backHref='/developers'>
      <Form onSubmit={handleSubmit}>
        <FormGroup
          hintText={
            <FormattedMessage
              id='developers.settings_store.hint'
              defaultMessage='It is possible to directly edit your user settings here. BE CAREFUL! Editing this section can break your account, and you will only be able to recover through the API.'
            />
          }
          errors={jsonValid ? [] : ['is invalid']}
        >
          <Textarea
            value={rawJSON}
            onChange={handleEditJSON}
            disabled={isLoading}
            rows={12}
            isCodeEditor
          />
        </FormGroup>

        <FormActions>
          <Button theme='primary' type='submit' disabled={!jsonValid || isLoading}>
            <FormattedMessage id='frontend_config.save' defaultMessage='Save' />
          </Button>
        </FormActions>
      </Form>

      <CardHeader className='mb-4'>
        <CardTitle
          title={
            <FormattedMessage
              id='developers.settings_store.advanced'
              defaultMessage='Advanced settings'
            />
          }
        />
      </CardHeader>

      <List>
        <ListItem
          label={<FormattedMessage id='preferences.fields.demo.label' defaultMessage='Demo mode' />}
          hint={
            <FormattedMessage
              id='preferences.fields.demo.hint'
              defaultMessage='Use the default Nicolium logo and color scheme. Useful for taking screenshots.'
            />
          }
        >
          <SettingToggle settings={settings} settingPath={['demo']} onChange={onToggleChange} />
        </ListItem>
      </List>
    </Column>
  );
};

export { SettingsStore as default };
