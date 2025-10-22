import React, { useState, useCallback } from 'react';
import { useIntl } from 'react-intl';

import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import Stack from 'pl-fe/components/ui/stack';
import Toggle from 'pl-fe/components/ui/toggle';
import { NAVIGATION_ICONS, navigationMessages } from 'pl-fe/utils/navigation';

interface NavigationItem {
  id: string;
  pinned: boolean;
}

interface INavigationSettings {
  value: NavigationItem[];
  onChange: (value: NavigationItem[]) => void;
}

const NavigationSettings: React.FC<INavigationSettings> = ({ value, onChange }) => {
  const intl = useIntl();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((index: number) => () => {
    setDraggedIndex(index);
  }, []);

  const handleDragEnter = useCallback((index: number) => () => {
    if (draggedIndex !== null) {
      setDragOverIndex(index);
    }
  }, [draggedIndex]);

  const handleDragEnd = useCallback(() => {
    // Reset drag state
    const fromIndex = draggedIndex;
    const toIndex = dragOverIndex;

    setDraggedIndex(null);
    setDragOverIndex(null);

    // Only update if valid indices and position changed
    if (fromIndex === null || toIndex === null || fromIndex === toIndex) {
      return;
    }

    const newData = [...value];
    const [removed] = newData.splice(fromIndex, 1);
    newData.splice(toIndex, 0, removed);

    onChange(newData);
  }, [draggedIndex, dragOverIndex, value, onChange]);

  const handleToggle = useCallback((id: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    onChange(value.map(item =>
      item.id === id ? { ...item, pinned: checked } : item,
    ));
  }, [value, onChange]);

  const getItemLabel = useCallback((id: string): string => {
    const messageKey = id as keyof typeof navigationMessages;
    if (navigationMessages[messageKey]) {
      return intl.formatMessage(navigationMessages[messageKey]);
    }
    // Fallback to formatted ID
    return id.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }, [intl]);

  // Calculate visual order during drag
  const displayOrder = React.useMemo(() => {
    if (draggedIndex === null || dragOverIndex === null) return value;

    const newOrder = [...value];
    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(dragOverIndex, 0, removed);
    return newOrder;
  }, [value, draggedIndex, dragOverIndex]);

  return (
    <Stack space={1}>
      {displayOrder.map((item, visualIndex) => {
        const originalIndex = value.findIndex(v => v.id === item.id);
        const label = getItemLabel(item.id);
        const icon = NAVIGATION_ICONS[item.id as keyof typeof NAVIGATION_ICONS];
        const isDragging = draggedIndex === originalIndex;

        return (
          <HStack
            key={item.id}
            space={2}
            alignItems='center'
            className={`rounded-md border p-2 transition-all duration-200 ${
              isDragging
                ? 'cursor-grabbing border-primary-500 bg-primary-50 opacity-60 shadow-lg dark:border-primary-400 dark:bg-primary-900/20'
                : 'cursor-grab border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700'
            }`}
            draggable
            onDragStart={handleDragStart(originalIndex)}
            onDragEnter={handleDragEnter(visualIndex)}
            onDragEnd={handleDragEnd}
          >
            <Icon
              src={require('@phosphor-icons/core/regular/dots-six-vertical.svg')}
              className='size-5 shrink-0 text-gray-400'
            />
            {icon && (
              <Icon
                src={icon.src}
                className='size-5 shrink-0 text-gray-700 dark:text-gray-300'
              />
            )}
            <span className='flex-1 text-sm font-medium text-gray-900 dark:text-gray-100'>
              {label}
            </span>
            <Toggle
              checked={item.pinned}
              onChange={handleToggle(item.id)}
            />
          </HStack>
        );
      })}
    </Stack>
  );
};

export { NavigationSettings as default };
