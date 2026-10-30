import {
  Host as JetpackHost,
  DatePickerDialog as JetpackDatePickerDialog,
  TimePickerDialog as JetpackTimePickerDialog,
} from '@expo/ui/jetpack-compose';
import { DatePicker as SwiftUIDatePicker, Host as SwiftUIHost } from '@expo/ui/swift-ui';
import { List, Text } from '@mkljczk/react-native-paper';
import React from 'react';
import { FormattedDate, FormattedMessage } from 'react-intl';
import { Platform, type StyleProp, type ViewStyle } from 'react-native';

interface IDateTimePicker {
  title: string;
  description?: string;
  initialDate?: Date;
  rangeStart?: Date;
  rangeEnd?: Date;
  onSelect: (date: Date) => void;
  listItemStyle?: StyleProp<ViewStyle>;
  withTime?: boolean;
}

const DateTimePicker: React.FC<IDateTimePicker> = ({
  title,
  description,
  initialDate,
  rangeStart,
  rangeEnd,
  onSelect,
  listItemStyle,
  withTime = true,
}) => {
  const [displayed, setDisplayed] = React.useState<false | 'date' | 'time'>(false);
  const [pickedDate, setPickedDate] = React.useState(initialDate);

  if (Platform.OS === 'ios') {
    return (
      <SwiftUIHost matchContents={{ vertical: true }} style={{ marginBottom: 8, width: '100%' }}>
        <SwiftUIDatePicker
          title={title}
          selection={initialDate}
          displayedComponents={withTime ? ['date', 'hourAndMinute'] : ['date']}
          onDateChange={onSelect}
          range={{
            start: rangeStart,
            end: rangeEnd,
          }}
        />
      </SwiftUIHost>
    );
  }

  return (
    <>
      <List.Item
        title={title}
        description={description}
        right={() =>
          initialDate ? (
            <Text>
              <FormattedDate
                value={initialDate}
                hour12
                year='numeric'
                month='short'
                day='2-digit'
                hour={withTime ? 'numeric' : undefined}
                minute={withTime ? '2-digit' : undefined}
              />
            </Text>
          ) : (
            <Text>
              <FormattedMessage id='date_picker.placeholder' defaultMessage='Select date…' />
            </Text>
          )
        }
        containerStyle={{ alignItems: 'center' }}
        onPress={() => setDisplayed('date')}
        style={listItemStyle}
      />
      {displayed && (
        <JetpackHost matchContents={{ vertical: true }} style={{ width: '100%' }}>
          {displayed === 'date' ? (
            <JetpackDatePickerDialog
              onDateSelected={(date) => {
                if (withTime) {
                  setPickedDate(date);
                  setDisplayed('time');
                } else {
                  onSelect(date);
                  setDisplayed(false);
                }
              }}
              initialDate={initialDate?.toISOString()}
              variant='picker'
              selectableDates={{
                start: rangeStart,
                end: rangeEnd,
              }}
              onDismissRequest={() => setDisplayed(false)}
            />
          ) : (
            <JetpackTimePickerDialog
              onDateSelected={(date) => {
                onSelect(date);
                setDisplayed(false);
              }}
              initialDate={pickedDate!.toISOString()}
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

export { DateTimePicker };
