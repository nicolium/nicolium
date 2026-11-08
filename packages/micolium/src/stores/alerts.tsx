import { AlertDialog, Host, Row, Text, TextButton } from '@expo/ui/jetpack-compose';
import { useTheme } from '@mkljczk/react-native-paper';
import React from 'react';
import { Alert as RNAlert, Platform, type AlertButton, type AlertOptions } from 'react-native';
import { create } from 'zustand';

type QueuedAlert = {
  id: number;
  title: string;
  message?: string;
  buttons: Array<AlertButton>;
  options?: AlertOptions;
};

type State = {
  queue: Array<QueuedAlert>;
  actions: {
    enqueueAlert: (alert: Omit<QueuedAlert, 'id'>) => void;
    dismissAlert: (id: number) => void;
  };
};

let nextId = 1;

const useAlertsStore = create<State>((set) => ({
  queue: [],
  actions: {
    enqueueAlert: (alert) => {
      set((state) => ({ queue: [...state.queue, { ...alert, id: nextId++ }] }));
    },
    dismissAlert: (id) => {
      set((state) => ({ queue: state.queue.filter((alert) => alert.id !== id) }));
    },
  },
}));

const useAlertsStoreActions = () => useAlertsStore((state) => state.actions);
const useCurrentAlert = () => useAlertsStore((state) => state.queue[0]);

const alert = (
  title: string,
  message?: string,
  buttons?: Array<AlertButton>,
  options?: AlertOptions,
) => {
  if (Platform.OS !== 'android') {
    RNAlert.alert(title, message, buttons, options);
    return;
  }

  useAlertsStore.getState().actions.enqueueAlert({
    title,
    message,
    buttons: buttons?.length ? buttons.slice(0, 3) : [{ text: 'OK' }],
    options,
  });
};

interface IQueuedAlertDialog {
  alert: QueuedAlert;
}

const QueuedAlertDialog: React.FC<IQueuedAlertDialog> = ({ alert }) => {
  const { dismissAlert } = useAlertsStoreActions();
  const theme = useTheme();

  const { title, message, buttons, options } = alert;
  const cancelable = options?.cancelable ?? false;

  const confirmButton = buttons[buttons.length - 1];
  const dismissButtons = buttons.slice(0, -1);

  const handleDismissRequest = () => {
    if (!cancelable) return;
    dismissAlert(alert.id);
    options?.onDismiss?.();
  };

  const renderButton = (button: AlertButton, key: number | string) => (
    <TextButton
      key={key}
      onClick={() => {
        dismissAlert(alert.id);
        button.onPress?.();
      }}
      colors={button.style === 'destructive' ? { contentColor: theme.colors.error } : undefined}
    >
      <Text>{button.text ?? ''}</Text>
    </TextButton>
  );

  return (
    <AlertDialog
      onDismissRequest={handleDismissRequest}
      properties={{
        dismissOnBackPress: cancelable,
        dismissOnClickOutside: cancelable,
      }}
    >
      <AlertDialog.Title>
        <Text>{title}</Text>
      </AlertDialog.Title>

      {!!message && (
        <AlertDialog.Text>
          <Text>{message}</Text>
        </AlertDialog.Text>
      )}

      {dismissButtons.length > 0 && (
        <AlertDialog.DismissButton>
          {dismissButtons.length === 1 ? (
            renderButton(dismissButtons[0], 'dismiss')
          ) : (
            <Row>{dismissButtons.map(renderButton)}</Row>
          )}
        </AlertDialog.DismissButton>
      )}

      <AlertDialog.ConfirmButton>
        {renderButton(confirmButton, 'confirm')}
      </AlertDialog.ConfirmButton>
    </AlertDialog>
  );
};

const AlertRoot =
  Platform.OS === 'android'
    ? () => {
        const currentAlert = useCurrentAlert();

        if (!currentAlert) return null;

        return (
          <Host matchContents style={{ position: 'absolute' }}>
            <QueuedAlertDialog key={currentAlert.id} alert={currentAlert} />
          </Host>
        );
      }
    : () => null;

const Alert = {
  alert,
};

export { Alert, AlertRoot };
