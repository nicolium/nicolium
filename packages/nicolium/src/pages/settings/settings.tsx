import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import List, { ListItem } from '@/components/list';
import Card, { CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import Column from '@/components/ui/column';
import Text from '@/components/ui/text';
import Preferences from '@/features/preferences';
import MessagesSettings from '@/features/settings/components/messages-settings';
import { useFeatures } from '@/hooks/use-features';
import { useOwnAccount } from '@/hooks/use-own-account';
import { useMfaConfig } from '@/queries/security/use-mfa';

const messages = defineMessages({
  settings: { id: 'settings.settings', defaultMessage: 'Settings' },
});

/** User settings page. */
const SettingsPage = () => {
  const intl = useIntl();

  const { data: mfa } = useMfaConfig();
  const features = useFeatures();
  const { data: account } = useOwnAccount();

  const isMfaEnabled = mfa?.settings.totp;

  if (!account) return null;

  const displayName = account.display_name || account.username;

  return (
    <Column label={intl.formatMessage(messages.settings)} transparent withHeader={false}>
      <Card className='space-y-4' variant='rounded'>
        <CardHeader>
          <CardTitle title={<FormattedMessage id='settings.profile' defaultMessage='Profile' />} />
        </CardHeader>

        <CardBody>
          <List>
            <ListItem
              label={<FormattedMessage id='settings.edit_profile' defaultMessage='Edit profile' />}
              to='/settings/profile'
            >
              <span className='max-w-full truncate'>{displayName}</span>
            </ListItem>
          </List>
        </CardBody>

        <CardHeader>
          <CardTitle
            title={
              <FormattedMessage id='settings.mutes_blocks' defaultMessage='Mutes and blocks' />
            }
          />
        </CardHeader>

        <CardBody>
          <List>
            <ListItem
              label={<FormattedMessage id='column.mutes' defaultMessage='Mutes' />}
              to='/mutes'
            />
            <ListItem
              label={<FormattedMessage id='column.blocks' defaultMessage='Blocks' />}
              to='/blocks'
            />
            {(features.filters || features.filtersV2) && (
              <ListItem
                label={<FormattedMessage id='column.filters' defaultMessage='Muted words' />}
                to='/filters'
              />
            )}
            {features.federating && (
              <ListItem
                label={
                  <FormattedMessage id='column.domain_blocks' defaultMessage='Domain blocks' />
                }
                to='/domain_blocks'
              />
            )}
            {(features.interactionRequests || features.quoteApprovalPolicies) && (
              <ListItem
                label={
                  <FormattedMessage
                    id='column.interaction_policies'
                    defaultMessage='Interaction policies'
                  />
                }
                to='/settings/interaction_policies'
              />
            )}
          </List>
        </CardBody>

        <CardHeader>
          <CardTitle
            title={<FormattedMessage id='settings.security' defaultMessage='Security' />}
          />
        </CardHeader>

        <CardBody>
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
              <>
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
              </>
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
        </CardBody>

        {features.chats ? (
          <>
            <CardHeader>
              <CardTitle title={<FormattedMessage id='column.chats' defaultMessage='Chats' />} />
            </CardHeader>

            <CardBody>
              <MessagesSettings />
            </CardBody>
          </>
        ) : null}

        <CardHeader>
          <CardTitle
            title={<FormattedMessage id='column.preferences' defaultMessage='Preferences' />}
          />
        </CardHeader>

        <CardBody>
          <Preferences />
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
