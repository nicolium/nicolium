import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import List, { ListItem } from '@/components/list';
import Column from '@/components/ui/column';
import Form from '@/components/ui/form';
import { useFeatures } from '@/hooks/use-features';
import { useMfaConfig } from '@/queries/security/use-mfa';

const messages = defineMessages({
  heading: { id: 'preferences.heading.timelines', defaultMessage: 'Timelines settings' },
});

const SecurityPreferences: React.FC = () => {
  const intl = useIntl();
  const { data: mfa } = useMfaConfig();
  const features = useFeatures();

  const isMfaEnabled = mfa?.settings.totp;

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Form>
        <List>
          {features.changeEmail && (
            <ListItem
              label={<FormattedMessage id='column.change_email' defaultMessage='Change email' />}
              to='/settings/email'
            />
          )}
          {features.changePassword && (
            <ListItem
              label={
                <FormattedMessage id='column.change_password' defaultMessage='Change password' />
              }
              to='/settings/password'
            />
          )}
          {features.manageMfa && (
            <ListItem
              label={
                <FormattedMessage id='settings.configure_mfa' defaultMessage='Configure MFA' />
              }
              to='/settings/mfa'
            >
              <span>
                {isMfaEnabled ? (
                  <FormattedMessage id='mfa.enabled' defaultMessage='Enabled' />
                ) : (
                  <FormattedMessage id='mfa.disabled' defaultMessage='Disabled' />
                )}
              </span>
            </ListItem>
          )}
          {features.sessions && (
            <ListItem
              label={<FormattedMessage id='column.tokens' defaultMessage='Active sessions' />}
              to='/settings/tokens'
            />
          )}
          <ListItem
            label={<FormattedMessage id='settings.privacy' defaultMessage='Privacy' />}
            to='/settings/privacy'
          />
        </List>
      </Form>
    </Column>
  );
};

export { SecurityPreferences as default };
