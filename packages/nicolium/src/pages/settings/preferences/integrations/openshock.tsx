import iconLightningSlash from '@phosphor-icons/core/regular/lightning-slash.svg';
import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedList, FormattedMessage, useIntl } from 'react-intl';
import * as v from 'valibot';

import { changeSetting } from '@/actions/settings';
import { EmptyMessage } from '@/components/empty-message';
import List, { ListItem } from '@/components/list';
import { CardHeader, CardTitle } from '@/components/ui/card';
import Column from '@/components/ui/column';
import Form from '@/components/ui/form';
import FormGroup from '@/components/ui/form-group';
import { InlineMultiselect } from '@/components/ui/inline-multiselect';
import Input from '@/components/ui/input';
import { SelectDropdown } from '@/components/ui/select-dropdown';
import Toggle from '@/components/ui/toggle';
import { openshockHookSchema, type Settings } from '@/schemas/frontend-settings';
import { useSettings } from '@/stores/settings';
import toast from '@/toast';
import { NOTIFICATION_TYPES } from '@/utils/notification';
import { checkToken, getDeviceList, type DevicesResponse } from '@/utils/openshock';

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
  checkSuccess: {
    id: 'integrations.openshock.check_and_save.success',
    defaultMessage: 'OpenShock integration settings saved',
  },
  hookSaved: {
    id: 'integrations.openshock.new_hook_form.saved',
    defaultMessage: 'Hook saved.',
  },
  hookInvalid: {
    id: 'integrations.openshock.new_hook_form.invalid',
    defaultMessage: 'Invalid input in the hook form',
  },
  actionTypeShock: {
    id: 'integrations.openshock.new_hook_form.action_type.shock',
    defaultMessage: 'Shock',
  },
  actionTypeVibrate: {
    id: 'integrations.openshock.new_hook_form.action_type.vibrate',
    defaultMessage: 'Vibrate',
  },
  actionTypeSound: {
    id: 'integrations.openshock.new_hook_form.action_type.sound',
    defaultMessage: 'Sound',
  },
  hookTypeNotification: {
    id: 'integrations.openshock.new_hook_form.type.notification',
    defaultMessage: 'Notification',
  },
  hookTypeWrench: {
    id: 'integrations.openshock.new_hook_form.type.wrench',
    defaultMessage: 'Wrench reaction',
  },
  hookTypeReply: {
    id: 'integrations.openshock.new_hook_form.type.reply',
    defaultMessage: 'Reply',
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
        if (isValid) {
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
  const [devices, setDevices] = React.useState<DevicesResponse['data'][number] | null>(null);

  useEffect(() => {
    if (openshock?.baseUrl && openshock?.token) {
      getDeviceList()
        .then((res) => {
          setDevices(res.data?.[0]);
        })
        .catch(() => {
          toast.error(messages.checkFailed);
        });
    } else {
      setDevices(null);
    }
  }, [openshock?.baseUrl, openshock?.token]);

  if (!devices?.shockers) {
    return null;
  }

  return (
    <>
      <CardHeader>
        <CardTitle
          title={<FormattedMessage id='integrations.openshock.devices' defaultMessage='Devices' />}
        />
      </CardHeader>
      {devices.shockers.length ? (
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
                      defaultMessage='Reply'
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
        <button className='openshock__hook__delete' type='button' onClick={handleDelete}>
          <FormattedMessage id='integrations.openshock.delete_hook' defaultMessage='Delete' />
        </button>
      </div>
    </div>
  );
};

const OpenShockNewHookForm: React.FC = () => {
  const intl = useIntl();
  const { openshock } = useSettings();

  const [type, setType] = useState<OpenshockHook['type']>('notification');
  const [actionType, setActionType] = useState<OpenshockHook['actionType']>('Sound');

  const [notificationTypes, setNotificationTypes] = useState<string[]>([]);
  const [intensity, setIntensity] = useState(100);
  const [duration, setDuration] = useState(1000);

  const [adaptive, setAdaptive] = useState(false);
  const [minIntensity, setMinIntensity] = useState(0);
  const [maxIntensity, setMaxIntensity] = useState(100);
  const [minDuration, setMinDuration] = useState(500);
  const [maxDuration, setMaxDuration] = useState(2000);

  const [keyword, setKeyword] = useState('');
  const [wholeWord, setWholeWord] = useState(false);

  const handleSave = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const hook: OpenshockHook =
      type === 'notification'
        ? { type, actionType, notificationTypes, intensity, duration }
        : type === 'wrench'
          ? { type, actionType, adaptive, minIntensity, maxIntensity, minDuration, maxDuration }
          : { type, actionType, intensity, duration, keyword, wholeWord };

    const parsed = v.safeParse(openshockHookSchema, hook);
    if (!parsed.success) {
      toast.error(messages.hookInvalid);
      return;
    }

    changeSetting(['openshock', 'hooks'], (hooks: OpenshockHook[] = []) => [
      ...hooks,
      parsed.output,
    ]);
    toast.success(messages.hookSaved);
  };

  const handleAdaptiveChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAdaptive(event.target.checked);
    if (!event.target.checked) {
      setMaxIntensity(minIntensity);
      setMaxDuration(minDuration);
    }
  };

  const numberChangeHandler =
    (setter: React.Dispatch<React.SetStateAction<number>>) =>
    ({ target }: React.ChangeEvent<HTMLInputElement>) => {
      setter(target.valueAsNumber || 0);
    };

  const disabled =
    !openshock?.defaultDevice ||
    (type === 'notification' && notificationTypes.length === 0) ||
    (type === 'reply' && !keyword) ||
    (type === 'wrench' && adaptive && (minIntensity > maxIntensity || minDuration > maxDuration));

  return (
    <Form onSubmit={handleSave} className='openshock__new-hook-form'>
      <CardHeader>
        <CardTitle
          title={
            <FormattedMessage
              id='integrations.openshock.new_hook_form.title'
              defaultMessage='Create new hook'
            />
          }
        />
      </CardHeader>
      <div className='openshock__new-hook-form__grid'>
        <FormGroup
          labelText={
            <FormattedMessage
              id='integrations.openshock.new_hook_form.type'
              defaultMessage='Hook type'
            />
          }
        >
          <SelectDropdown
            items={{
              notification: intl.formatMessage(messages.hookTypeNotification),
              wrench: intl.formatMessage(messages.hookTypeWrench),
              reply: intl.formatMessage(messages.hookTypeReply),
            }}
            value={type}
            onChange={({ target }) => setType(target.value as OpenshockHook['type'])}
          />
        </FormGroup>
        <FormGroup
          labelText={
            <FormattedMessage
              id='integrations.openshock.new_hook_form.action_type'
              defaultMessage='Action'
            />
          }
        >
          <SelectDropdown
            items={{
              Shock: intl.formatMessage(messages.actionTypeShock),
              Vibrate: intl.formatMessage(messages.actionTypeVibrate),
              Sound: intl.formatMessage(messages.actionTypeSound),
            }}
            value={actionType}
            onChange={({ target }) => setActionType(target.value as OpenshockHook['actionType'])}
          />
        </FormGroup>
      </div>
      {type === 'notification' && (
        <FormGroup
          labelText={
            <FormattedMessage
              id='integrations.openshock.new_hook_form.notification_types'
              defaultMessage='Notification types'
            />
          }
        >
          <InlineMultiselect
            items={Object.fromEntries(NOTIFICATION_TYPES.map((t) => [t, t]))}
            value={notificationTypes}
            onChange={setNotificationTypes}
          />
        </FormGroup>
      )}
      {type === 'wrench' ? (
        <>
          <List>
            <ListItem
              label={
                <FormattedMessage
                  id='integrations.openshock.new_hook_form.adaptive'
                  defaultMessage='Adaptive strength'
                />
              }
              hint={
                <FormattedMessage
                  id='integrations.openshock.new_hook_form.adaptive.hint'
                  defaultMessage='Adapt intensity and duration based on the type of used wrench reaction'
                />
              }
            >
              <Toggle checked={adaptive} onChange={handleAdaptiveChange} />
            </ListItem>
          </List>
          <div className='openshock__new-hook-form__grid'>
            <FormGroup
              labelText={
                adaptive ? (
                  <FormattedMessage
                    id='integrations.openshock.new_hook_form.min_intensity'
                    defaultMessage='Minimum intensity'
                  />
                ) : (
                  <FormattedMessage
                    id='integrations.openshock.new_hook_form.intensity'
                    defaultMessage='Intensity'
                  />
                )
              }
            >
              <Input
                type='number'
                min={0}
                max={100}
                value={minIntensity}
                onChange={numberChangeHandler(setMinIntensity)}
              />
            </FormGroup>
            {adaptive && (
              <FormGroup
                labelText={
                  <FormattedMessage
                    id='integrations.openshock.new_hook_form.max_intensity'
                    defaultMessage='Maximum intensity'
                  />
                }
              >
                <Input
                  type='number'
                  min={0}
                  max={100}
                  value={maxIntensity}
                  onChange={numberChangeHandler(setMaxIntensity)}
                />
              </FormGroup>
            )}
            <FormGroup
              labelText={
                adaptive ? (
                  <FormattedMessage
                    id='integrations.openshock.new_hook_form.min_duration'
                    defaultMessage='Minimum duration (ms)'
                  />
                ) : (
                  <FormattedMessage
                    id='integrations.openshock.new_hook_form.duration'
                    defaultMessage='Duration (ms)'
                  />
                )
              }
            >
              <Input
                type='number'
                min={300}
                max={30000}
                value={minDuration}
                onChange={numberChangeHandler(setMinDuration)}
              />
            </FormGroup>
            {adaptive && (
              <FormGroup
                labelText={
                  <FormattedMessage
                    id='integrations.openshock.new_hook_form.max_duration'
                    defaultMessage='Maximum duration (ms)'
                  />
                }
              >
                <Input
                  type='number'
                  min={300}
                  max={30000}
                  value={maxDuration}
                  onChange={numberChangeHandler(setMaxDuration)}
                />
              </FormGroup>
            )}
          </div>
        </>
      ) : (
        <div className='openshock__new-hook-form__grid'>
          <FormGroup
            labelText={
              <FormattedMessage
                id='integrations.openshock.new_hook_form.intensity'
                defaultMessage='Intensity'
              />
            }
          >
            <Input
              type='number'
              min={0}
              max={100}
              value={intensity}
              onChange={numberChangeHandler(setIntensity)}
            />
          </FormGroup>
          <FormGroup
            labelText={
              <FormattedMessage
                id='integrations.openshock.new_hook_form.duration'
                defaultMessage='Duration (ms)'
              />
            }
          >
            <Input
              type='number'
              min={300}
              max={30000}
              value={duration}
              onChange={numberChangeHandler(setDuration)}
            />
          </FormGroup>
        </div>
      )}
      {type === 'reply' && (
        <>
          <FormGroup
            labelText={
              <FormattedMessage
                id='integrations.openshock.new_hook_form.keyword'
                defaultMessage='Keyword'
              />
            }
          >
            <Input
              type='text'
              value={keyword}
              onChange={({ target }) => setKeyword(target.value)}
            />
          </FormGroup>
          <List>
            <ListItem
              label={
                <FormattedMessage
                  id='integrations.openshock.new_hook_form.whole_word'
                  defaultMessage='Whole word'
                />
              }
            >
              <Toggle checked={wholeWord} onChange={({ target }) => setWholeWord(target.checked)} />
            </ListItem>
          </List>
        </>
      )}
      <div className='form__actions'>
        <button type='submit' disabled={disabled}>
          <FormattedMessage
            id='integrations.openshock.new_hook_form.save'
            defaultMessage='Save hook'
          />
        </button>
      </div>
    </Form>
  );
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

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <OpenShockCredentialsForm />
      <OpenShockDevicesList />
      <OpenShockHooksList />
    </Column>
  );
};

export { OpenShockIntegrationSettings as default };
