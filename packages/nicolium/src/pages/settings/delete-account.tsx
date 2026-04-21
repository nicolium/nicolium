import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { deleteAccount } from '@/actions/security';
import Button from '@/components/ui/button';
import Column from '@/components/ui/column';
import Form from '@/components/ui/form';
import FormActions from '@/components/ui/form-actions';
import FormGroup from '@/components/ui/form-group';
import Input from '@/components/ui/input';
import Text from '@/components/ui/text';
import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useOwnAccount } from '@/hooks/use-own-account';
import toast from '@/toast';

const messages = defineMessages({
  heading: { id: 'column.delete_account', defaultMessage: 'Delete account' },
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
  const client = useClient();
  const features = useFeatures();
  const { data: account } = useOwnAccount();

  const [password, setPassword] = React.useState('');
  const [isLoading, setLoading] = React.useState(false);

  const handleInputChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    event.persist();

    setPassword(event.target.value);
  }, []);

  const handleSubmit = React.useCallback(() => {
    setLoading(true);
    deleteAccount(client, password, { url: account!.url })
      .then(() => {
        setPassword('');
        toast.success(messages.deleteAccountSuccess);
      })
      .finally(() => {
        setLoading(false);
      })
      .catch(() => {
        setPassword('');
        toast.error(intl.formatMessage(messages.deleteAccountFail));
      });
  }, [password, intl]);

  return (
    <Column label={intl.formatMessage(messages.heading)} backHref='/settings'>
      <div className='flex flex-col gap-4'>
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
            <FormGroup
              labelText={
                <FormattedMessage id='security.fields.password.label' defaultMessage='Password' />
              }
            >
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
              <FormattedMessage id='security.submit.delete' defaultMessage='Delete account' />
            </Button>
          </FormActions>
        </Form>
      </div>
    </Column>
  );
};

export { DeleteAccountPage as default };
