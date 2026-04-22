import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import List, { ListItem } from '@/components/list';
import Card, { CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import Column from '@/components/ui/column';
import Text from '@/components/ui/text';
import { useFeatures } from '@/hooks/use-features';
import { useOwnAccount } from '@/hooks/use-own-account';

const messages = defineMessages({
  settings: { id: 'settings.settings', defaultMessage: 'Settings' },
});

/** User settings page. */
const SettingsPage = () => {
  const intl = useIntl();

  const features = useFeatures();
  const { data: account } = useOwnAccount();

  if (!account) return null;

  const displayName = account.display_name || account.username;

  return (
    <Column label={intl.formatMessage(messages.settings)} transparent withHeader={false}>
      <Card className='flex flex-col gap-4' variant='rounded'>
        <CardHeader>
          <CardTitle title={<FormattedMessage id='settings.profile' defaultMessage='Profile' />} />
        </CardHeader>

        <CardBody>
          <List>
            <ListItem
              label={<FormattedMessage id='settings.edit_profile' defaultMessage='Edit profile' />}
              labelClassName='min-w-fit'
              to='/settings/profile'
            >
              <span className='⁂-edit-profile-link__display-name truncate'>{displayName}</span>
            </ListItem>
          </List>
        </CardBody>
        <CardHeader>
          <CardTitle
            title={<FormattedMessage id='column.preferences' defaultMessage='Preferences' />}
          />
        </CardHeader>

        <CardBody>
          <List>
            <ListItem
              to='/settings/general'
              label={<FormattedMessage id='preferences.tab.general' defaultMessage='General' />}
            />

            <ListItem
              to='/settings/appearance'
              label={
                <FormattedMessage id='preferences.tab.appearance' defaultMessage='Appearance' />
              }
            />

            <ListItem
              to='/settings/content'
              label={
                <FormattedMessage
                  id='preferences.tab.content'
                  defaultMessage='Content and filtering'
                />
              }
            />

            <ListItem
              to='/settings/compose'
              label={<FormattedMessage id='preferences.tab.compose' defaultMessage='Compose' />}
            />

            <ListItem
              to='/settings/timelines'
              label={<FormattedMessage id='preferences.tab.timelines' defaultMessage='Timelines' />}
            />

            <ListItem
              to='/settings/security'
              label={
                <FormattedMessage
                  id='preferences.tab.security'
                  defaultMessage='Privacy and security'
                />
              }
            />
          </List>
        </CardBody>

        <CardHeader>
          <CardTitle
            title={<FormattedMessage id='settings.other' defaultMessage='Other options' />}
          />
        </CardHeader>

        <CardBody>
          <List>
            {(features.importBlocks || features.importFollows || features.importMutes) && (
              <ListItem
                label={<FormattedMessage id='column.import_data' defaultMessage='Import data' />}
                to='/settings/import'
              />
            )}

            <ListItem
              label={<FormattedMessage id='column.export_data' defaultMessage='Export data' />}
              to='/settings/export'
            />

            {features.accountBackups && (
              <ListItem
                label={<FormattedMessage id='column.backups' defaultMessage='Backups' />}
                to='/settings/backups'
              />
            )}

            <ListItem
              label={<FormattedMessage id='column.developers' defaultMessage='Developers' />}
              to='/developers'
            />

            {features.federating &&
              (features.accountMoving ? (
                <ListItem
                  label={<FormattedMessage id='column.migration' defaultMessage='Move account' />}
                  to='/settings/migration'
                />
              ) : (
                features.manageAccountAliases && (
                  <ListItem
                    label={
                      <FormattedMessage id='column.aliases' defaultMessage='Account aliases' />
                    }
                    to='/settings/aliases'
                  />
                )
              ))}

            {(features.deleteAccount || features.deleteAccountWithoutPassword) && (
              <ListItem
                label={
                  <Text theme='danger'>
                    <FormattedMessage id='column.delete_account' defaultMessage='Delete account' />
                  </Text>
                }
                to='/settings/account'
              />
            )}
          </List>
        </CardBody>
      </Card>
    </Column>
  );
};

export { SettingsPage as default };
