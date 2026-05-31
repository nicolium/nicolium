import iconX from '@phosphor-icons/core/regular/x.svg';
import clsx from 'clsx';
import React, { useState } from 'react';
import { useIntl, defineMessages, FormattedMessage } from 'react-intl';

import IconButton from './icon-button';

const messages = defineMessages({
  remove: { id: 'streamfield.remove', defaultMessage: 'Remove' },
});

interface IExternalDragItem<T> {
  value: T;
  height: number;
}

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
  getItemKey?: (value: T, index: number) => string;
  externalDragItem?: IExternalDragItem<T> | null;
  onDropItem?: (value: T, index: number) => void;
  showEmptyDropTarget?: boolean;
  className?: string;
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
  getItemKey,
  externalDragItem,
  onDropItem,
  showEmptyDropTarget,
  className,
}: IStreamfield<T>) => {
  const intl = useIntl();

  const [draggedItem, setDraggedItem] = useState<{ index: number; height: number } | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  const clearDragState = () => {
    setDraggedItem(null);
    setDropTargetIndex(null);
  };

  const handleDragStart = (i: number) => (event: React.DragEvent<HTMLDivElement>) => {
    setDraggedItem({
      index: i,
      height: event.currentTarget.getBoundingClientRect().height,
    });
    setDropTargetIndex(null);

    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', i.toString());
  };

  const handleItemDragOver = (i: number) => (event: React.DragEvent<HTMLDivElement>) => {
    if (!draggedItem && !externalDragItem) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';

    const { top, height } = event.currentTarget.getBoundingClientRect();
    const nextDropTargetIndex = event.clientY >= top + height / 2 ? i + 1 : i;

    setDropTargetIndex((current) =>
      current === nextDropTargetIndex ? current : nextDropTargetIndex,
    );
  };

  const handleItemsDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (!draggedItem && !externalDragItem) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';

    if (values.length === 0 || event.target === event.currentTarget) {
      setDropTargetIndex(values.length);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (dropTargetIndex === null) {
      clearDragState();
      return;
    }

    if (draggedItem) {
      const destinationIndex =
        dropTargetIndex > draggedItem.index ? dropTargetIndex - 1 : dropTargetIndex;

      if (destinationIndex === draggedItem.index) {
        clearDragState();
        return;
      }

      const newData = [...values];
      const item = newData.splice(draggedItem.index, 1)[0];
      newData.splice(destinationIndex, 0, item);

      onChange(newData);
      clearDragState();
      return;
    }

    if (externalDragItem && onDropItem) {
      onDropItem(externalDragItem.value, dropTargetIndex);
    }

    setDropTargetIndex(null);
  };

  const handleDragEnd = () => {
    clearDragState();
  };

  const handleChange = (i: number) => (value: T) => {
    const newData = [...values];
    newData[i] = value;
    onChange(newData);
  };

  const isExternalDragActive = Boolean(externalDragItem && !draggedItem);
  const placeholderHeight = draggedItem?.height ?? externalDragItem?.height ?? 0;
  const placeholderIndex =
    dropTargetIndex !== null &&
    (isExternalDragActive ||
      (draggedItem &&
        dropTargetIndex !== draggedItem.index &&
        dropTargetIndex !== draggedItem.index + 1))
      ? dropTargetIndex
      : null;
  const shouldRenderItems =
    values.length > 0 || (showEmptyDropTarget && (draggable || Boolean(onDropItem)));

  return (
    <div className={clsx('streamfield', className)}>
      {label || hint ? (
        <div className='streamfield__text'>
          {label && <label>{label}</label>}
          {hint && <span>{hint}</span>}
        </div>
      ) : null}

      {shouldRenderItems && (
        <div
          className={clsx('streamfield__items', {
            'streamfield__items--droppable': showEmptyDropTarget && (draggable || onDropItem),
          })}
          onDragOver={handleItemsDragOver}
          onDrop={handleDrop}
        >
          {values.map((value, i) => {
            if ((value as Record<string, unknown>)?._destroy) return null;

            const itemKey = getItemKey?.(value, i) ?? `streamfield-item-${i}`;

            return (
              <React.Fragment key={itemKey}>
                {placeholderIndex === i && (
                  <div
                    aria-hidden='true'
                    className='streamfield__placeholder'
                    style={{ height: `${placeholderHeight}px` }}
                  />
                )}

                <div
                  className={clsx('streamfield__item', {
                    'streamfield__item--dragging': draggedItem?.index === i,
                  })}
                  draggable={draggable}
                  onDragStart={handleDragStart(i)}
                  onDragOver={handleItemDragOver(i)}
                  onDragEnd={handleDragEnd}
                >
                  <Component index={i} onChange={handleChange(i)} value={value} autoFocus={i > 0} />
                  {values.length > minItems && onRemoveItem && (
                    <IconButton
                      className='streamfield__item__remove'
                      src={iconX}
                      onClick={() => {
                        onRemoveItem(i);
                      }}
                      title={intl.formatMessage(messages.remove)}
                    />
                  )}
                </div>
              </React.Fragment>
            );
          })}

          {placeholderIndex === values.length && (
            <div
              aria-hidden='true'
              className='streamfield__placeholder'
              style={{ height: `${placeholderHeight}px` }}
            />
          )}
        </div>
      )}

      {onAddItem && values.length < maxItems && (
        <button className='streamfield__add-button' onClick={onAddItem} type='button'>
          <FormattedMessage id='streamfield.add' defaultMessage='Add' />
        </button>
      )}
    </div>
  );
};

export type { IExternalDragItem, StreamfieldComponent };
export { Streamfield as default };
