import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { deleteAccount } from '@/actions/security';
import Button from '@/components/ui/button';
import Card, { CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import Form from '@/components/ui/form';
import FormActions from '@/components/ui/form-actions';
import FormGroup from '@/components/ui/form-group';
import Input from '@/components/ui/input';
import Stack from '@/components/ui/stack';
import Text from '@/components/ui/text';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useFeatures } from '@/hooks/use-features';
import toast from '@/toast';

const messages = defineMessages({
  passwordFieldLabel: { id: 'security.fields.password.label', defaultMessage: 'Password' },
  deleteHeader: { id: 'column.delete_account', defaultMessage: 'Delete account' },
  deleteSubmit: { id: 'security.submit.delete', defaultMessage: 'Delete account' },
  deleteAccountSuccess: {
    id: 'security.delete_account.success',
    defaultMessage: 'Account successfully deleted.',
  },
  deleteAccountFail: {
    id: 'security.delete_account.fail',
    defaultMessage: 'Account deletion failed.',
  },
});

const DeleteAccountPage = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const features = useFeatures();

  const [password, setPassword] = React.useState('');
  const [isLoading, setLoading] = React.useState(false);

  const handleInputChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    event.persist();

    setPassword(event.target.value);
  }, []);

  const handleSubmit = React.useCallback(() => {
    setLoading(true);
    dispatch(deleteAccount(password))
      .then(() => {
        setPassword('');
        toast.success(intl.formatMessage(messages.deleteAccountSuccess));
      })
      .finally(() => {
        setLoading(false);
      })
      .catch(() => {
        setPassword('');
        toast.error(intl.formatMessage(messages.deleteAccountFail));
      });
  }, [password, dispatch, intl]);

  return (
    <Card variant='rounded'>
      <CardHeader backHref='/settings'>
        <CardTitle title={intl.formatMessage(messages.deleteHeader)} />
      </CardHeader>

      <CardBody>
        <Stack space={4}>
          <Text theme='muted'>
            {features.deleteAccountWithoutPassword ? (
              features.federating ? (
                <FormattedMessage
                  id='security.text.delete.without_password'
                  defaultMessage='To delete your account, click Delete account. This is a permanent action that cannot be undone. Your account will be destroyed from this server, and a deletion request will be sent to other servers. It’s not guaranteed that all servers will purge your account.'
                />
              ) : (
                <FormattedMessage
                  id='security.text.delete.local.without_password'
                  defaultMessage='To delete your account, click Delete account. This is a permanent action that cannot be undone.'
                />
              )
            ) : features.federating ? (
              <FormattedMessage
                id='security.text.delete'
                defaultMessage='To delete your account, enter your password and then click Delete account. This is a permanent action that cannot be undone. Your account will be destroyed from this server, and a deletion request will be sent to other servers. It’s not guaranteed that all servers will purge your account.'
              />
            ) : (
              <FormattedMessage
                id='security.text.delete.local'
                defaultMessage='To delete your account, enter your password and then click Delete account. This is a permanent action that cannot be undone.'
              />
            )}
          </Text>

          <Form onSubmit={handleSubmit}>
            {!features.deleteAccountWithoutPassword && (
              <FormGroup labelText={intl.formatMessage(messages.passwordFieldLabel)}>
                <Input
                  type='password'
                  name='password'
                  onChange={handleInputChange}
                  value={password}
                />
              </FormGroup>
            )}

            <FormActions>
              <Button type='submit' theme='danger' disabled={isLoading}>
                {intl.formatMessage(messages.deleteSubmit)}
              </Button>
            </FormActions>
          </Form>
        </Stack>
      </CardBody>
    </Card>
  );
};

export { DeleteAccountPage as default };
