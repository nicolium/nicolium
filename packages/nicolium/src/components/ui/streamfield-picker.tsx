import iconPlus from '@phosphor-icons/core/regular/plus.svg';
import clsx from 'clsx';
import React, { useState } from 'react';

import List, { ListItem } from '@/components/list';
import Streamfield, {
  type IExternalDragItem,
  type StreamfieldComponent,
} from '@/components/ui/streamfield';

import { CardTitle } from './card';

interface IStreamfieldPicker<T> {
  values: T[];
  availableValues: T[];
  component: StreamfieldComponent<T>;
  getItemKey: (value: T, index: number) => string;
  onChange: (values: T[]) => void;
  availableTitle: React.ReactNode;
  className?: string;
}

const StreamfieldPicker = <T,>({
  values,
  availableValues,
  component,
  getItemKey,
  onChange,
  availableTitle,
  className,
}: IStreamfieldPicker<T>) => {
  const [draggedAvailableItem, setDraggedAvailableItem] = useState<
    (IExternalDragItem<T> & { key: string }) | null
  >(null);

  const Component = component;

  const insertItem = (value: T, index = values.length) => {
    onChange([...values.slice(0, index), value, ...values.slice(index)]);
  };

  const handleAvailableItemDragStart =
    (value: T, index: number) => (event: React.DragEvent<HTMLAnchorElement | HTMLDivElement>) => {
      setDraggedAvailableItem({
        key: getItemKey(value, index),
        value,
        height: event.currentTarget.getBoundingClientRect().height,
      });

      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', index.toString());
    };

  const handleAvailableItemDragEnd = () => {
    setDraggedAvailableItem(null);
  };

  return (
    <>
      <Streamfield
        className={className}
        component={component}
        values={values}
        onChange={onChange}
        onRemoveItem={(index) => {
          onChange(values.filter((_, itemIndex) => itemIndex !== index));
        }}
        draggable
        getItemKey={(value, index) => getItemKey(value, index)}
        externalDragItem={draggedAvailableItem}
        onDropItem={insertItem}
        showEmptyDropTarget
      />

      {availableValues.length > 0 && (
        <>
          <CardTitle title={availableTitle} />

          <List>
            {availableValues.map((value, index) => {
              const itemKey = getItemKey(value, index);
              const isDragging = draggedAvailableItem?.key === itemKey;

              return (
                <ListItem
                  key={itemKey}
                  className={clsx('streamfield-picker__item', {
                    'streamfield-picker__item--dragging': isDragging,
                  })}
                  label={
                    <span className='streamfield-picker__item__label'>
                      <Component value={value} index={-1} onChange={() => {}} autoFocus={false} />
                    </span>
                  }
                  onClick={() => insertItem(value)}
                  draggable
                  onDragStart={handleAvailableItemDragStart(value, index)}
                  onDragEnd={handleAvailableItemDragEnd}
                  size='sm'
                  actionIcon={iconPlus}
                />
              );
            })}
          </List>
        </>
      )}
    </>
  );
};

export { StreamfieldPicker as default };
