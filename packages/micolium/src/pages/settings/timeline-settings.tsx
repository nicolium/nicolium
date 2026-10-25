import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { ScrollView } from 'react-native';

import { List } from '@/components/ui/list';
import { useSetting, useSettingsActions } from '@/stores/settings';

import type { SettingsStackParams } from '@/router/router';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const messages = defineMessages({
  autoloadTimelines: {
    id: 'preferences.fields.autoload_timelines.label',
    defaultMessage: 'Automatically load new posts when scrolled to the top of the page',
  },
  autoloadMore: {
    id: 'preferences.fields.autoload_more.label',
    defaultMessage: 'Automatically load more items when scrolled to the bottom of the page',
  },
  boostModal: {
    id: 'preferences.fields.boost_modal.label',
    defaultMessage: 'Show confirmation dialog before reposting',
  },
  missingDescriptionBoostModal: {
    id: 'preferences.fields.missing_description_boost_modal.label',
    defaultMessage: 'Show confirmation dialog before reposting a post without media descriptions',
  },
});

const TimelinesSettingsScreen = (_: NativeStackScreenProps<SettingsStackParams, 'timelines'>) => {
  const intl = useIntl();
  const { update } = useSettingsActions();

  const autoloadMore = useSetting('timelines.autoloadMore');
  const autoloadTimelines = useSetting('timelines.autoloadTimelines');
  const boostModal = useSetting('timelines.boostModal');
  const missingDescriptionBoostModal = useSetting('timelines.missingDescriptionBoostModal');

  return (
    <ScrollView>
      <List
        sections={[
          {
            items: [
              {
                type: 'toggle',
                label: intl.formatMessage(messages.autoloadMore),
                active: autoloadMore,
                onPress: () => update('timelines.autoloadMore', !autoloadMore),
              },
              {
                type: 'toggle',
                label: intl.formatMessage(messages.autoloadTimelines),
                active: autoloadTimelines,
                onPress: () => update('timelines.autoloadTimelines', !autoloadTimelines),
              },
              {
                type: 'toggle',
                label: intl.formatMessage(messages.boostModal),
                active: boostModal,
                onPress: () => update('timelines.boostModal', !boostModal),
              },
              {
                type: 'toggle',
                label: intl.formatMessage(messages.missingDescriptionBoostModal),
                active: missingDescriptionBoostModal,
                onPress: () =>
                  update('timelines.missingDescriptionBoostModal', !missingDescriptionBoostModal),
              },
            ],
          },
        ]}
      />
    </ScrollView>
  );
};

export { TimelinesSettingsScreen };
