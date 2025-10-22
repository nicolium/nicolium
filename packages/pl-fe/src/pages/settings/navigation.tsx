import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { changeSetting } from 'pl-fe/actions/settings';
import Column from 'pl-fe/components/ui/column';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import NavigationSettings from 'pl-fe/features/preferences/components/navigation-settings';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useSettings } from 'pl-fe/hooks/use-settings';

const messages = defineMessages({
  heading: { id: 'column.navigation_settings', defaultMessage: 'Navigation settings' },
});

const NavigationPage: React.FC = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const settings = useSettings();

  const onNavigationChange = (items: Array<{ id: string; pinned: boolean }>) => {
    dispatch(changeSetting(['navigation', 'items'], items, { showAlert: true }));
  };

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Stack space={2}>
        <Text size='sm' weight='medium'>
          <FormattedMessage id='preferences.fields.pinned_navigation_items_label' defaultMessage='Customize navigation' />
        </Text>
        <Text size='xs' theme='muted'>
          <FormattedMessage id='preferences.fields.pinned_navigation_items_hint' defaultMessage='Control which items appear in your sidebar and bottom navigation. Drag to reorder. Bottom navigation displays the first 4 pinned items.' />
        </Text>
        <NavigationSettings
          value={settings.navigation.items}
          onChange={onNavigationChange}
        />
      </Stack>
    </Column>
  );
};

export { NavigationPage as default };
