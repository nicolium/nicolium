import { Alert as RNAlert, type AlertButton, type AlertOptions } from 'react-native';

const alert = (
  title: string,
  message?: string,
  buttons?: Array<AlertButton>,
  options?: AlertOptions,
) => {
  RNAlert.alert(title, message, buttons, options);
};

const AlertRoot = () => null;

const Alert = {
  alert,
};

export { Alert, AlertRoot };
