import iconX from '@phosphor-icons/core/regular/x.svg';
import React, { useRef } from 'react';
import { useIntl, defineMessages, FormattedMessage } from 'react-intl';

import Button from './button';
import IconButton from './icon-button';
import Text from './text';

const messages = defineMessages({
  remove: { id: 'streamfield.remove', defaultMessage: 'Remove' },
});

/** Type of the inner Streamfield input component. */
type StreamfieldComponent<T> = React.ComponentType<{
  index: number;
  value: T;
  onChange: (value: T) => void;
  autoFocus: boolean;
}>;

interface IStreamfield<T> {
  /** Array of values for the streamfield. */
  values: T[];
  /** Input label message. */
  label?: React.ReactNode;
  /** Input hint message. */
  hint?: React.ReactNode;
  /** Callback to add an item. */
  onAddItem?: () => void;
  /** Callback to remove an item by index. */
  onRemoveItem?: (i: number) => void;
  /** Callback when values are changed. */
  onChange: (values: T[]) => void;
  /** Input to render for each value. */
  component: StreamfieldComponent<T>;
  /** Minimum number of allowed inputs. */
  minItems?: number;
  /** Maximum number of allowed inputs. */
  maxItems?: number;
  /** Allow changing order of the items. */
  draggable?: boolean;
}

/** List of inputs that can be added or removed. */
const Streamfield = <T,>({
  values,
  label,
  hint,
  onAddItem,
  onRemoveItem,
  onChange,
  component: Component,
  maxItems = Infinity,
  minItems = 0,
  draggable,
}: IStreamfield<T>) => {
  const intl = useIntl();

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragStart = (i: number) => () => {
    dragItem.current = i;
  };

  const handleDragEnter = (i: number) => () => {
    dragOverItem.current = i;
  };

  const handleDragEnd = () => {
    const newData = [...values];
    const item = newData.splice(dragItem.current!, 1)[0];
    newData.splice(dragOverItem.current!, 0, item);

    onChange(newData);
  };

  const handleChange = (i: number) => (value: T) => {
    const newData = [...values];
    newData[i] = value;
    onChange(newData);
  };

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex flex-col'>
        {label && (
          <Text size='sm' weight='medium'>
            {label}
          </Text>
        )}
        {hint && (
          <Text size='xs' theme='muted'>
            {hint}
          </Text>
        )}
      </div>

      {values.length > 0 && (
        <div className='flex flex-col gap-1'>
          {values.map((value, i) =>
            (value as Record<string, unknown>)?._destroy ? null : (
              <div
                className='flex items-center gap-2'
                key={i}
                draggable={draggable}
                onDragStart={handleDragStart(i)}
                onDragEnter={handleDragEnter(i)}
                onDragEnd={handleDragEnd}
              >
                <Component
                  key={i}
                  index={i}
                  onChange={handleChange(i)}
                  value={value}
                  autoFocus={i > 0}
                />
                {values.length > minItems && onRemoveItem && (
                  <IconButton
                    iconClassName='h-4 w-4'
                    className='bg-transparent text-gray-600 hover:text-gray-600'
                    src={iconX}
                    onClick={() => {
                      onRemoveItem(i);
                    }}
                    title={intl.formatMessage(messages.remove)}
                  />
                )}
              </div>
            ),
          )}
        </div>
      )}

      {onAddItem && values.length < maxItems && (
        <Button onClick={onAddItem} theme='secondary' block>
          <FormattedMessage id='streamfield.add' defaultMessage='Add' />
        </Button>
      )}
    </div>
  );
};

export { type StreamfieldComponent, Streamfield as default };
