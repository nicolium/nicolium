import {
  Button,
  Icon,
  IconButton,
  List,
  Switch,
  Text,
  TextInput,
} from '@mkljczk/react-native-paper';
import { DotsSixVerticalIcon } from 'phosphor-react-native/src/icons/DotsSixVertical';
import { PlusIcon } from 'phosphor-react-native/src/icons/Plus';
import { XIcon } from 'phosphor-react-native/src/icons/X';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import DropdownMenu from '@/components/ui/dropdown-menu';
import { useInstance } from '@/contexts/current-account-context';
import { useCompose, useComposeActions } from '@/stores/compose';

import { formatDuration, DURATIONS as TOO_MANY_DURATIONS } from '../accounts/block-mute-dialog';
import { iconHelper } from '../ui/icon';

const DURATIONS = TOO_MANY_DURATIONS.slice(0, -1);

const messages = defineMessages({
  optionPlaceholder: {
    id: 'compose_form.poll.option.placeholder',
    defaultMessage: 'Answer #{number}',
  },
  removeOption: { id: 'compose_form.poll.remove_option', defaultMessage: 'Remove this answer' },
  reorderOption: { id: 'compose_form.poll.reorder_option', defaultMessage: 'Reorder answer' },
  pollDuration: { id: 'compose_form.poll.duration', defaultMessage: 'Poll duration' },
});

const OPTION_GAP = 8;

const clamp = (value: number, min: number, max: number) => {
  'worklet';
  return Math.min(Math.max(value, min), max);
};

interface IOption {
  index: number;
  count: number;
  title: string;
  maxChars: number;
  activeIndex: SharedValue<number>;
  dragY: SharedValue<number>;
  rowHeight: SharedValue<number>;
  onChange(index: number, value: string): void;
  onRemove(index: number): void;
  onMove(from: number, to: number): void;
}

const Option: React.FC<IOption> = ({
  index,
  count,
  title,
  maxChars,
  activeIndex,
  dragY,
  rowHeight,
  onChange,
  onRemove,
  onMove,
}) => {
  const intl = useIntl();

  const gesture = React.useMemo(
    () =>
      Gesture.Pan()
        .minDistance(0)
        .hitSlop({ horizontal: 12, vertical: 12 })
        .onBegin(() => {
          activeIndex.value = index;
          dragY.value = 0;
        })
        .onUpdate((event) => {
          const step = rowHeight.value;
          dragY.value = clamp(event.translationY, -index * step, (count - 1 - index) * step);
        })
        .onFinalize(() => {
          const step = rowHeight.value;
          const target = step ? clamp(Math.round(index + dragY.value / step), 0, count - 1) : index;

          if (target !== index) {
            runOnJS(onMove)(index, target);
          } else {
            activeIndex.value = -1;
            dragY.value = withTiming(0);
          }
        }),
    [index, count, onMove],
  );

  const animatedStyle = useAnimatedStyle(() => {
    const active = activeIndex.value;

    if (active === -1) {
      return { transform: [{ translateY: 0 }], zIndex: 0 };
    }

    if (active === index) {
      return { transform: [{ translateY: dragY.value }], zIndex: 1 };
    }

    const step = rowHeight.value;
    const target = step ? clamp(Math.round(active + dragY.value / step), 0, count - 1) : active;

    let offset = 0;
    if (active < index && index <= target) offset = -step;
    else if (target <= index && index < active) offset = step;

    return { transform: [{ translateY: withTiming(offset, { duration: 150 }) }], zIndex: 0 };
  });

  const handleLayout =
    index === 0
      ? (event: { nativeEvent: { layout: { height: number } } }) => {
          rowHeight.value = event.nativeEvent.layout.height + OPTION_GAP;
        }
      : undefined;

  return (
    <Animated.View style={animatedStyle} onLayout={handleLayout}>
      <TextInput
        value={title}
        onChangeText={(value) => onChange(index, value)}
        variant='outlined'
        placeholder={intl.formatMessage(messages.optionPlaceholder, { number: index + 1 })}
        maxLength={maxChars}
        endAccessory={({ style }) => (
          <View
            style={[
              style,
              { width: undefined, flexDirection: 'row', alignItems: 'center', gap: 4 },
            ]}
          >
            {count > 2 && (
              <IconButton
                key='x'
                icon={iconHelper(XIcon)}
                size={20}
                style={{ margin: 0 }}
                onPress={() => onRemove(index)}
                accessibilityLabel={intl.formatMessage(messages.removeOption)}
              />
            )}
            <GestureDetector gesture={gesture}>
              <View
                accessible
                accessibilityRole='adjustable'
                accessibilityLabel={intl.formatMessage(messages.reorderOption)}
                accessibilityActions={[
                  ...(index > 0 ? [{ name: 'decrement' as const }] : []),
                  ...(index < count - 1 ? [{ name: 'increment' as const }] : []),
                ]}
                onAccessibilityAction={({ nativeEvent }) => {
                  if (nativeEvent.actionName === 'decrement') onMove(index, index - 1);
                  if (nativeEvent.actionName === 'increment') onMove(index, index + 1);
                }}
                style={{ padding: 4 }}
              >
                <Icon source={iconHelper(DotsSixVerticalIcon)} size={24} />
              </View>
            </GestureDetector>
          </View>
        )}
      />
    </Animated.View>
  );
};

interface IPollForm {
  composeId: string;
}

const PollForm: React.FC<IPollForm> = ({ composeId }) => {
  const intl = useIntl();
  const { configuration } = useInstance();
  const { updateCompose } = useComposeActions();
  const { poll, language, modifiedLanguage } = useCompose(composeId);

  const {
    max_options: maxOptions,
    max_characters_per_option: maxOptionChars,
    min_expiration: minExpiration,
    max_expiration: maxExpiration,
  } = configuration.polls;

  const activeIndex = useSharedValue(-1);
  const dragY = useSharedValue(0);
  const rowHeight = useSharedValue(0);

  const keys = React.useRef<Array<number>>([]);
  const optionsCount = poll?.options.length ?? 0;

  if (keys.current.length > optionsCount) keys.current.length = optionsCount;

  const options = poll?.options;

  React.useLayoutEffect(() => {
    activeIndex.value = -1;
    dragY.value = 0;
  }, [options]);

  const handleChangeOption = (index: number, title: string) =>
    updateCompose(composeId, (draft) => {
      if (!draft.poll) return;
      if (!draft.modifiedLanguage || draft.modifiedLanguage === draft.language) {
        draft.poll.options[index] = title;
        if (draft.modifiedLanguage) draft.poll.options_map[index][draft.modifiedLanguage] = title;
      }
    });

  const handleRemoveOption = (index: number) => {
    keys.current.splice(index, 1);
    updateCompose(composeId, (draft) => {
      if (!draft.poll) return;
      draft.poll.options.splice(index, 1);
      draft.poll.options_map.splice(index, 1);
    });
  };

  const handleMoveOption = (from: number, to: number) => {
    const move = <T,>(array: Array<T>) => {
      const [item] = array.splice(from, 1);
      array.splice(to, 0, item);
    };

    move(keys.current);
    updateCompose(composeId, (draft) => {
      if (!draft.poll) return;
      move(draft.poll.options);
      move(draft.poll.options_map);
    });
  };

  const handleAddOption = () => {
    updateCompose(composeId, (draft) => {
      if (!draft.poll) return;
      draft.poll.options.push('');
      draft.poll.options_map.push({});
    });
  };

  const handleSelectDuration = (value: number) => {
    updateCompose(composeId, (draft) => {
      if (draft.poll) draft.poll.expires_in = value;
    });
  };

  const handleSelectMultiple = (multiple: boolean) => {
    updateCompose(composeId, (draft) => {
      if (draft.poll) draft.poll.multiple = multiple;
    });
  };

  if (!poll || !options) return null;

  const durations = DURATIONS.filter(
    (duration) => duration >= minExpiration && duration <= maxExpiration,
  );
  if (!durations.includes(poll.expires_in)) {
    durations.push(poll.expires_in);
    durations.sort((a, b) => a - b);
  }

  return (
    <View style={{ gap: 4 }}>
      <View style={{ gap: OPTION_GAP }}>
        {options.map((title, index) => {
          const text =
            !modifiedLanguage || modifiedLanguage === language
              ? title
              : poll.options_map[index][modifiedLanguage];

          return (
            <Option
              key={keys.current[index] || `fallback-${index}`}
              index={index}
              count={options.length}
              title={text}
              maxChars={maxOptionChars}
              activeIndex={activeIndex}
              dragY={dragY}
              rowHeight={rowHeight}
              onChange={handleChangeOption}
              onRemove={handleRemoveOption}
              onMove={handleMoveOption}
            />
          );
        })}
      </View>

      {options.length < maxOptions && (
        <Button
          mode='text'
          icon={iconHelper(PlusIcon)}
          onPress={handleAddOption}
          style={{ alignSelf: 'flex-start' }}
        >
          <FormattedMessage id='compose_form.poll.add_option' defaultMessage='Add an answer' />
        </Button>
      )}

      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <List.Item
            title={
              <FormattedMessage id='compose_form.poll.duration' defaultMessage='Poll duration' />
            }
            right={() => <Text>{formatDuration(intl, poll.expires_in)}</Text>}
            containerStyle={{ alignItems: 'center' }}
          />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Label>{intl.formatMessage(messages.pollDuration)}</DropdownMenu.Label>
          {durations.map((duration) => (
            <DropdownMenu.CheckboxItem
              key={duration.toString()}
              value={duration === poll.expires_in}
              onSelect={() => handleSelectDuration(duration)}
            >
              <DropdownMenu.ItemTitle>{formatDuration(intl, duration)}</DropdownMenu.ItemTitle>
            </DropdownMenu.CheckboxItem>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Root>

      <List.Item
        title={
          <FormattedMessage id='compose_form.poll.multiselect' defaultMessage='Multi-select' />
        }
        description={
          <FormattedMessage
            id='compose_form.poll.multiselect_detail'
            defaultMessage='Allow users to select multiple answers'
          />
        }
        titleNumberOfLines={0}
        right={() => (
          <Switch value={poll.multiple} onValueChange={(value) => handleSelectMultiple(value)} />
        )}
        containerStyle={{ gap: 4, alignItems: 'center' }}
        onPress={() => handleSelectMultiple(!poll.multiple)}
      />
    </View>
  );
};

export { PollForm, formatDuration };
