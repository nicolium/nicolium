import {
  Host as JetpackHost,
  DatePickerDialog as JetpackDatePickerDialog,
  TimePickerDialog as JetpackTimePickerDialog,
} from '@expo/ui/jetpack-compose';
import { DatePicker as SwiftUIDatePicker, Host as SwiftUIHost } from '@expo/ui/swift-ui';
import { List, Text } from '@mkljczk/react-native-paper';
import React from 'react';
import { FormattedDate } from 'react-intl';
import { Platform, type StyleProp, type ViewStyle } from 'react-native';

interface IDateTimePicker {
  title: string;
  initialDate?: Date;
  rangeStart?: Date;
  rangeEnd?: Date;
  onSelect: (date: Date) => void;
  listItemStyle?: StyleProp<ViewStyle>;
}

const DateTimePicker: React.FC<IDateTimePicker> = ({
  title,
  initialDate,
  rangeStart,
  rangeEnd,
  onSelect,
  listItemStyle,
}) => {
  const [displayed, setDisplayed] = React.useState<false | 'date' | 'time'>(false);
  const [pickedDate, setPickedDate] = React.useState(initialDate);

  if (Platform.OS === 'ios') {
    return (
      <SwiftUIHost matchContents style={{ marginBottom: 8 }}>
        <SwiftUIDatePicker
          title={title}
          selection={initialDate}
          displayedComponents={['date', 'hourAndMinute']}
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
        right={
          initialDate
            ? () => (
                <Text>
                  <FormattedDate
                    value={initialDate}
                    hour12
                    year='numeric'
                    month='short'
                    day='2-digit'
                    hour='numeric'
                    minute='2-digit'
                  />
                </Text>
              )
            : undefined
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
                setPickedDate(date);
                setDisplayed('time');
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
