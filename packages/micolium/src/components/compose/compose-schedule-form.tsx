import {
  Host as JetpackHost,
  DatePickerDialog as JetpackDatePickerDialog,
  TimePickerDialog as JetpackTimePickerDialog,
} from '@expo/ui/jetpack-compose';
import { DatePicker as SwiftUIDatePicker, Host as SwiftUIHost } from '@expo/ui/swift-ui';
import { List, Text } from '@mkljczk/react-native-paper';
import React from 'react';
import { defineMessages, FormattedDate, useIntl } from 'react-intl';
import { Platform } from 'react-native';

import { useCompose, useComposeActions } from '@/stores/compose';

import type { ICompose } from './compose';

const messages = defineMessages({
  datePickerHint: { id: 'datepicker.hint', defaultMessage: 'Scheduled to post at…' },
});

const ComposeScheduleForm: React.FC<ICompose> = ({ composeId }) => {
  const intl = useIntl();
  const compose = useCompose(composeId);
  const { updateCompose } = useComposeActions();

  const [displayed, setDisplayed] = React.useState<false | 'date' | 'time'>(false);
  const [pickedDate, setPickedDate] = React.useState(compose.scheduledAt!);

  if (!compose.scheduledAt) {
    return null;
  }

  if (Platform.OS === 'ios') {
    return (
      <SwiftUIHost matchContents style={{ marginBottom: 8 }}>
        <SwiftUIDatePicker
          title={intl.formatMessage(messages.datePickerHint)}
          selection={compose.scheduledAt}
          displayedComponents={['date', 'hourAndMinute']}
          onDateChange={(date) => {
            updateCompose(composeId, (draft) => {
              draft.scheduledAt = date;
            });
          }}
          range={{
            start: new Date(Date.now() + 10 * 60 * 1000),
          }}
        />
      </SwiftUIHost>
    );
  }

  return (
    <>
      <List.Item
        title={intl.formatMessage(messages.datePickerHint)}
        right={() => (
          <Text>
            <FormattedDate
              value={compose.scheduledAt!}
              hour12
              year='numeric'
              month='short'
              day='2-digit'
              hour='numeric'
              minute='2-digit'
              timeZone={intl.timeZone}
            />
          </Text>
        )}
        containerStyle={{ alignItems: 'center' }}
        onPress={() => setDisplayed('date')}
      />
      {displayed && (
        <JetpackHost matchContents={{ vertical: true }} style={{ width: '100%' }}>
          {displayed === 'date' ? (
            <JetpackDatePickerDialog
              onDateSelected={(date) => {
                setPickedDate(date);
                setDisplayed('time');
              }}
              initialDate={compose.scheduledAt.toISOString()}
              variant='picker'
              selectableDates={{
                start: new Date(Date.now() + 10 * 60 * 1000),
              }}
              onDismissRequest={() => setDisplayed(false)}
            />
          ) : (
            <JetpackTimePickerDialog
              onDateSelected={(date) => {
                updateCompose(composeId, (draft) => {
                  draft.scheduledAt = date;
                });
                setDisplayed(false);
              }}
              initialDate={pickedDate.toISOString()}
              // selectableDates={{
              //   start: new Date(Date.now() + 10 * 60 * 1000),
              // }}
              onDismissRequest={() => setDisplayed(false)}
            />
          )}
        </JetpackHost>
      )}
    </>
  );
};

export { ComposeScheduleForm };
