import iconLightningSlash from '@phosphor-icons/core/regular/lightning-slash.svg';
import React, { useEffect } from 'react';
import { defineMessages, FormattedList, FormattedMessage, useIntl } from 'react-intl';

import { changeSetting } from '@/actions/settings';
import { KINKY } from '@/build-config';
import { EmptyMessage } from '@/components/empty-message';
import MissingIndicator from '@/components/missing-indicator';
import OpenShockHookForm from '@/components/openshock-hook-form';
import OutlineBox from '@/components/outline-box';
import { CardHeader, CardTitle } from '@/components/ui/card';
import Column from '@/components/ui/column';
import Form from '@/components/ui/form';
import FormGroup from '@/components/ui/form-group';
import Input from '@/components/ui/input';
import { useModalsActions } from '@/stores/modals';
import { useSettings } from '@/stores/settings';
import toast from '@/toast';
import { checkToken, getDeviceList, type DevicesResponse } from '@/utils/openshock';

import type { openshockHookSchema, Settings } from '@/schemas/frontend-settings';
import type * as v from 'valibot';

type OpenshockHook = NonNullable<Settings['openshock']>['hooks'][number];

const strong = (chunks: React.ReactNode) => <strong>{chunks}</strong>;

const messages = defineMessages({
  heading: { id: 'column.integrations.openshock', defaultMessage: 'OpenShock integration' },
  baseUrlPlaceholder: {
    id: 'integrations.openshock.base_url.placeholder',
    defaultMessage: 'eg. {url}',
  },
  apiTokenPlaceholder: {
    id: 'integrations.openshock.api_token.placeholder',
    defaultMessage: 'API token',
  },
  checkFailed: {
    id: 'integrations.openshock.check_and_save.fail',
    defaultMessage: 'Failed to connect to OpenShock',
  },
  checkFailed401: {
    id: 'integrations.openshock.check_and_save.fail.401',
    defaultMessage:
      'Connected to OpenShock, but the API token is invalid. It might have been revoked or expired',
  },
  checkSuccess: {
    id: 'integrations.openshock.check_and_save.success',
    defaultMessage: 'OpenShock integration settings saved',
  },
});

const OpenShockCredentialsForm: React.FC = () => {
  const intl = useIntl();
  const { openshock } = useSettings();

  const [pending, setPending] = React.useState(false);
  const [baseUrl, setBaseUrl] = React.useState(openshock?.baseUrl || '');
  const [token, setToken] = React.useState(openshock?.token || '');

  const handleCheckAndSave = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    setPending(true);

    checkToken(baseUrl, token)
      .then((isValid) => {
        if (isValid === 'invalid') {
          toast.error(messages.checkFailed401);
        } else if (isValid) {
          if (!openshock) {
            changeSetting(['openshock'], {
              baseUrl,
              token,
              defaultDevice: '',
              hooks: [],
            });
          } else {
            changeSetting(['openshock', 'baseUrl'], baseUrl);
            changeSetting(['openshock', 'token'], token);
          }
          toast.success(messages.checkSuccess);
        } else {
          toast.error(messages.checkFailed);
        }
        setPending(false);
      })
      .catch(() => {
        toast.error(messages.checkFailed);
        setPending(false);
      });
  };

  const handleReset = () => {
    setBaseUrl('');
    setToken('');
    changeSetting(['openshock'], (openshock: any) => {
      return {
        ...openshock,
        baseUrl: '',
        token: '',
        defaultDevice: '',
      };
    });
  };

  return (
    <Form onSubmit={handleCheckAndSave}>
      <FormGroup
        labelText={
          <FormattedMessage
            id='integrations.openshock.base_url.label'
            defaultMessage='OpenShock base URL'
          />
        }
        hintText={
          <FormattedMessage
            id='integrations.openshock.base_url.hint'
            defaultMessage='Base URL for the OpenShock integration, eg. {url}'
            values={{ url: 'https://api.openshock.app/' }}
          />
        }
      >
        <Input
          type='text'
          placeholder={intl.formatMessage(messages.baseUrlPlaceholder, {
            url: 'https://api.openshock.app/',
          })}
          value={baseUrl}
          onChange={({ target }) => {
            setBaseUrl(target.value);
          }}
          disabled={pending}
        />
      </FormGroup>
      <FormGroup
        labelText={
          <FormattedMessage
            id='integrations.openshock.api_token.label'
            defaultMessage='OpenShock API token'
          />
        }
        hintText={
          <FormattedMessage
            id='integrations.openshock.api_token.hint'
            defaultMessage='API token for the OpenShock integration'
          />
        }
      >
        <Input
          type='password'
          placeholder={intl.formatMessage(messages.apiTokenPlaceholder)}
          name='openshock_api_token'
          autoComplete='off'
          autoCorrect='off'
          autoCapitalize='off'
          value={token}
          onChange={({ target }) => {
            setToken(target.value);
          }}
          disabled={pending}
        />
      </FormGroup>
      <div className='form__actions interface-items__actions'>
        <button
          className='openshock__reset'
          type='button'
          onClick={handleReset}
          disabled={pending || (!openshock?.baseUrl && !openshock?.token)}
        >
          <FormattedMessage id='integrations.openshock.reset' defaultMessage='Reset' />
        </button>
        <button type='submit' disabled={!baseUrl || !token || pending}>
          <FormattedMessage
            id='integrations.openshock.check_and_save'
            defaultMessage='Check and save'
          />
        </button>
      </div>
    </Form>
  );
};

type Shocker = DevicesResponse['data'][number]['shockers'][number];

interface IOpenShockDevice {
  shocker: Shocker;
}

const OpenShockDevice: React.FC<IOpenShockDevice> = ({ shocker }) => {
  const { openshock } = useSettings();
  const isDefault = openshock?.defaultDevice === shocker.id;

  const handleSetDefault = () => {
    changeSetting(['openshock', 'defaultDevice'], shocker.id);
  };

  return (
    <div className='openshock__device'>
      <div className='openshock__device__info'>
        <span>
          <FormattedMessage
            id='integrations.openshock.name'
            defaultMessage='Device name: {name}'
            values={{ name: <strong>{shocker.name}</strong> }}
          />
        </span>
        <span>
          <FormattedMessage
            id='integrations.openshock.model'
            defaultMessage='Device model: {model}'
            values={{ model: <strong>{shocker.model}</strong> }}
          />
        </span>
        {isDefault && (
          <span>
            <strong>
              <FormattedMessage
                id='integrations.openshock.default_device'
                defaultMessage='Default device'
              />
            </strong>
          </span>
        )}
      </div>
      <div className='openshock__device__actions'>
        <button onClick={handleSetDefault} disabled={isDefault}>
          <FormattedMessage
            id='integrations.openshock.set_default'
            defaultMessage='Set as default'
          />
        </button>
      </div>
    </div>
  );
};

const OpenShockDevicesList: React.FC = () => {
  const { openshock } = useSettings();
  const [devices, setDevices] = React.useState<DevicesResponse['data'][number] | null | false>(
    null,
  );

  useEffect(() => {
    if (openshock?.baseUrl && openshock?.token) {
      getDeviceList()
        .then((res) => {
          setDevices(res.data?.[0] ?? false);
        })
        .catch(() => {
          toast.error(messages.checkFailed);
        });
    } else {
      setDevices(null);
    }
  }, [openshock?.baseUrl, openshock?.token]);

  if (devices !== false && !devices?.shockers) {
    return null;
  }

  return (
    <>
      <CardHeader>
        <CardTitle
          title={<FormattedMessage id='integrations.openshock.devices' defaultMessage='Devices' />}
        />
      </CardHeader>
      {devices === false ? (
        <EmptyMessage
          icon={iconLightningSlash}
          text={
            <FormattedMessage
              id='integrations.openshock.no_hubs'
              defaultMessage='The OpenShock account has no hubs visible to the API token.'
            />
          }
        />
      ) : devices.shockers.length ? (
        <div className='openshock__devices'>
          {devices.shockers.map((shocker) => (
            <OpenShockDevice key={shocker.id} shocker={shocker} />
          ))}
        </div>
      ) : (
        <EmptyMessage
          icon={iconLightningSlash}
          text={
            <FormattedMessage
              id='integrations.openshock.no_devices'
              defaultMessage='No devices found'
            />
          }
        />
      )}
    </>
  );
};

interface IOpenShockHook {
  hook: v.InferOutput<typeof openshockHookSchema>;
  index: number;
}

const OpenShockHook: React.FC<IOpenShockHook> = ({ hook, index }) => {
  const { openModal } = useModalsActions();

  const handleEdit = () => {
    openModal('EDIT_OPENSHOCK_HOOK', { hook, index });
  };

  const handleDelete = () => {
    changeSetting(['openshock', 'hooks'], (hooks: OpenshockHook[] = []) =>
      hooks.filter((_, hookIndex) => hookIndex !== index),
    );
  };

  return (
    <div className='openshock__hook'>
      <dl className='openshock__hook__info'>
        <span>
          <FormattedMessage
            id='integrations.openshock.hook.type'
            defaultMessage='Type: {type}'
            values={{
              type: (
                <strong>
                  {hook.type === 'notification' ? (
                    <FormattedMessage
                      id='integrations.openshock.hook.type.notification'
                      defaultMessage='Notification'
                    />
                  ) : hook.type === 'wrench' ? (
                    <FormattedMessage
                      id='integrations.openshock.hook.type.wrench'
                      defaultMessage='Wrench reaction'
                    />
                  ) : (
                    <FormattedMessage
                      id='integrations.openshock.hook.type.reply'
                      defaultMessage='Mention'
                    />
                  )}
                </strong>
              ),
            }}
          />
        </span>
        <span>
          <FormattedMessage
            id='integrations.openshock.hook.action'
            defaultMessage='Action: {action}'
            values={{
              action: (
                <strong>
                  {hook.actionType === 'Shock' ? (
                    <FormattedMessage
                      id='integrations.openshock.new_hook_form.action_type.shock'
                      defaultMessage='Shock'
                    />
                  ) : hook.actionType === 'Sound' ? (
                    <FormattedMessage
                      id='integrations.openshock.new_hook_form.action_type.sound'
                      defaultMessage='Sound'
                    />
                  ) : (
                    <FormattedMessage
                      id='integrations.openshock.new_hook_form.action_type.vibrate'
                      defaultMessage='Vibrate'
                    />
                  )}
                </strong>
              ),
            }}
          />
        </span>
        {hook.type === 'notification' ? (
          <>
            <span>
              <FormattedMessage
                id='integrations.openshock.hook.notification_types'
                defaultMessage='Notification types: {types}'
                values={{
                  types: (
                    <strong>
                      <FormattedList value={hook.notificationTypes} />
                    </strong>
                  ),
                }}
              />
            </span>
            <span>
              <FormattedMessage
                id='integrations.openshock.hook.intensity'
                defaultMessage='Intensity: {intensity}'
                values={{ intensity: <strong>{hook.intensity}</strong> }}
              />
            </span>
            <span>
              <FormattedMessage
                id='integrations.openshock.hook.duration'
                defaultMessage='Duration: <strong>{duration} ms</strong>'
                values={{ duration: hook.duration, strong }}
              />
            </span>
          </>
        ) : hook.type === 'wrench' ? (
          hook.adaptive ? (
            <>
              <span>
                <strong>
                  <FormattedMessage
                    id='integrations.openshock.hook.adaptive'
                    defaultMessage='Adaptive'
                  />
                </strong>
              </span>
              <span>
                <FormattedMessage
                  id='integrations.openshock.hook.min_intensity'
                  defaultMessage='Minimum intensity: {minIntensity}'
                  values={{ minIntensity: <strong>{hook.minIntensity}</strong> }}
                />
              </span>
              <span>
                <FormattedMessage
                  id='integrations.openshock.hook.max_intensity'
                  defaultMessage='Maximum intensity: {maxIntensity}'
                  values={{ maxIntensity: <strong>{hook.maxIntensity}</strong> }}
                />
              </span>
              <span>
                <FormattedMessage
                  id='integrations.openshock.hook.min_duration'
                  defaultMessage='Minimum duration: <strong>{minDuration} ms</strong>'
                  values={{ minDuration: hook.minDuration, strong }}
                />
              </span>
              <span>
                <FormattedMessage
                  id='integrations.openshock.hook.max_duration'
                  defaultMessage='Maximum duration: <strong>{maxDuration} ms</strong>'
                  values={{ maxDuration: hook.maxDuration, strong }}
                />
              </span>
            </>
          ) : (
            <>
              <span>
                <FormattedMessage
                  id='integrations.openshock.hook.intensity'
                  defaultMessage='Intensity: {intensity}'
                  values={{ intensity: <strong>{hook.minIntensity}</strong> }}
                />
              </span>
              <span>
                <FormattedMessage
                  id='integrations.openshock.hook.duration'
                  defaultMessage='Duration: <strong>{duration} ms</strong>'
                  values={{ duration: hook.minDuration, strong }}
                />
              </span>
            </>
          )
        ) : (
          <>
            <span>
              <FormattedMessage
                id='integrations.openshock.hook.keyword'
                defaultMessage='Keyword: {keyword}'
                values={{ keyword: <strong>{hook.keyword}</strong> }}
              />
            </span>
            <span>
              <strong>
                <FormattedMessage
                  id='integrations.openshock.hook.whole_word'
                  defaultMessage='Match whole word'
                />
              </strong>
            </span>
            <span>
              <FormattedMessage
                id='integrations.openshock.hook.intensity'
                defaultMessage='Intensity: {intensity}'
                values={{ intensity: <strong>{hook.intensity}</strong> }}
              />
            </span>
            <span>
              <FormattedMessage
                id='integrations.openshock.hook.duration'
                defaultMessage='Duration: <strong>{duration} ms</strong>'
                values={{ duration: hook.duration, strong }}
              />
            </span>
          </>
        )}
      </dl>
      <div className='openshock__hook__actions'>
        <button type='button' onClick={handleEdit}>
          <FormattedMessage id='integrations.openshock.edit_hook' defaultMessage='Edit' />
        </button>
        <button className='openshock__hook__delete' type='button' onClick={handleDelete}>
          <FormattedMessage id='integrations.openshock.delete_hook' defaultMessage='Delete' />
        </button>
      </div>
    </div>
  );
};

const OpenShockNewHookForm: React.FC = () => {
  const handleSave = (hook: OpenshockHook) => {
    changeSetting(['openshock', 'hooks'], (hooks: OpenshockHook[] = []) => [...hooks, hook]);
  };

  return <OpenShockHookForm onSave={handleSave} showHeader />;
};

const OpenShockHooksList: React.FC = () => {
  const { openshock } = useSettings();

  if (!openshock?.defaultDevice) {
    return (
      <div className='openshock__no-default-device'>
        <FormattedMessage
          id='integrations.openshock.no_default_device'
          defaultMessage='No default device set. Select a default device to configure hooks.'
        />
      </div>
    );
  }

  return (
    <>
      <CardHeader>
        <CardTitle
          title={<FormattedMessage id='integrations.openshock.hooks' defaultMessage='Hooks' />}
        />
      </CardHeader>
      {openshock.hooks?.length ? (
        <div className='openshock__hooks'>
          {openshock.hooks.map((hook, index) => (
            <OpenShockHook hook={hook} key={index} index={index} />
          ))}
        </div>
      ) : (
        <EmptyMessage
          icon={iconLightningSlash}
          text={
            <FormattedMessage
              id='integrations.openshock.no_hooks'
              defaultMessage='No hooks configured yet'
            />
          }
        />
      )}
      <OpenShockNewHookForm />
    </>
  );
};

const OpenShockIntegrationSettings: React.FC = () => {
  const intl = useIntl();

  if (!KINKY) return <MissingIndicator />;

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <OutlineBox>
        <p>
          <FormattedMessage
            id='integrations.openshock.description'
            defaultMessage='The OpenShock integration allows you to control your OpenShock devices based on notifications, wrench reactions, or replies. You can configure hooks to trigger specific actions on your devices. The actions will only be performed when you have Nicolium open in the browser.'
          />
        </p>
      </OutlineBox>
      <OpenShockCredentialsForm />
      <OpenShockDevicesList />
      <OpenShockHooksList />
    </Column>
  );
};

export { OpenShockIntegrationSettings as default };
