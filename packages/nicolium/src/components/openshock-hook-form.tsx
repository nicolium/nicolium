import React, { useImperativeHandle, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import * as v from 'valibot';

import List, { ListItem } from '@/components/list';
import { CardHeader, CardTitle } from '@/components/ui/card';
import Form from '@/components/ui/form';
import FormGroup from '@/components/ui/form-group';
import { InlineMultiselect } from '@/components/ui/inline-multiselect';
import Input from '@/components/ui/input';
import { SelectDropdown } from '@/components/ui/select-dropdown';
import Toggle from '@/components/ui/toggle';
import { openshockHookSchema, type Settings } from '@/schemas/frontend-settings';
import toast from '@/toast';
import { NOTIFICATION_TYPES } from '@/utils/notification';

type OpenshockHook = NonNullable<Settings['openshock']>['hooks'][number];

const messages = defineMessages({
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
    defaultMessage: 'Mention',
  },
});

interface OpenShockHookFormHandle {
  submit: () => void;
}

interface IOpenShockHookForm {
  hook?: OpenshockHook;
  onSave: (hook: OpenshockHook) => void;
  showHeader?: boolean;
}

const OpenShockHookForm = React.forwardRef<OpenShockHookFormHandle, IOpenShockHookForm>(
  ({ hook, onSave, showHeader = false }, ref) => {
    const intl = useIntl();

    const [type, setType] = useState<OpenshockHook['type']>(hook?.type ?? 'notification');
    const [actionType, setActionType] = useState<OpenshockHook['actionType']>(
      hook?.actionType ?? 'Sound',
    );

    const [notificationTypes, setNotificationTypes] = useState<string[]>(
      hook?.type === 'notification' ? hook.notificationTypes : [],
    );
    const [intensity, setIntensity] = useState(
      hook?.type === 'notification' || hook?.type === 'reply' ? hook.intensity : 50,
    );
    const [duration, setDuration] = useState(
      hook?.type === 'notification' || hook?.type === 'reply' ? hook.duration : 1000,
    );

    const [adaptive, setAdaptive] = useState(hook?.type === 'wrench' ? hook.adaptive : false);
    const [minIntensity, setMinIntensity] = useState(
      hook?.type === 'wrench' ? hook.minIntensity : 20,
    );
    const [maxIntensity, setMaxIntensity] = useState(
      hook?.type === 'wrench' ? hook.maxIntensity : 100,
    );
    const [minDuration, setMinDuration] = useState(
      hook?.type === 'wrench' ? hook.minDuration : 500,
    );
    const [maxDuration, setMaxDuration] = useState(
      hook?.type === 'wrench' ? hook.maxDuration : 2000,
    );

    const [keyword, setKeyword] = useState(hook?.type === 'reply' ? hook.keyword : '');
    const [wholeWord, setWholeWord] = useState(hook?.type === 'reply' ? hook.wholeWord : false);

    const disabled =
      (type === 'notification' && notificationTypes.length === 0) ||
      (type === 'reply' && !keyword) ||
      (type === 'wrench' && adaptive && (minIntensity > maxIntensity || minDuration > maxDuration));

    const save = () => {
      const nextHook: OpenshockHook =
        type === 'notification'
          ? { type, actionType, notificationTypes, intensity, duration }
          : type === 'wrench'
            ? { type, actionType, adaptive, minIntensity, maxIntensity, minDuration, maxDuration }
            : { type, actionType, intensity, duration, keyword, wholeWord };

      const parsed = v.safeParse(openshockHookSchema, nextHook);
      if (!parsed.success) {
        toast.error(messages.hookInvalid);
        return;
      }

      onSave(parsed.output);
      toast.success(messages.hookSaved);
    };

    useImperativeHandle(ref, () => ({ submit: save }));

    const handleSave = (event: React.SubmitEvent<HTMLFormElement>) => {
      event.preventDefault();
      save();
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

    return (
      <Form onSubmit={handleSave} className='openshock__new-hook-form'>
        {showHeader && (
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
        )}
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
                <Toggle
                  checked={wholeWord}
                  onChange={({ target }) => setWholeWord(target.checked)}
                />
              </ListItem>
            </List>
          </>
        )}
        <div className='form__actions'>
          <button type='submit' disabled={disabled}>
            {hook ? (
              <FormattedMessage
                id='integrations.openshock.edit_hook_form.save'
                defaultMessage='Save changes'
              />
            ) : (
              <FormattedMessage
                id='integrations.openshock.new_hook_form.save'
                defaultMessage='Save hook'
              />
            )}
          </button>
        </div>
      </Form>
    );
  },
);

OpenShockHookForm.displayName = 'OpenShockHookForm';

export { type OpenshockHook, OpenShockHookForm as default, type OpenShockHookFormHandle };
