import clsx from 'clsx';
import React from 'react';

import HStack from 'pl-fe/components/ui/hstack';
import Text from 'pl-fe/components/ui/text';

interface IStatusInfo {
  avatarSize: number;
  icon: React.ReactNode;
  text: React.ReactNode;
  className?: string;
  title?: string;
}

const StatusInfo = (props: IStatusInfo) => {
  const { avatarSize, icon, text, className, title } = props;

  const onClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
  };

  return (
    <HStack
      space={2}
      alignItems='center'
      className={clsx('w-fit max-w-full cursor-default rounded-full border border-gray-200 bg-gray-100 px-3 py-1 black:border-gray-800 black:bg-gray-900 dark:border-transparent dark:bg-primary-800 rtl:space-x-reverse', className)}
      onClick={onClick}
      style={{ marginLeft: Math.max(0, avatarSize - 25), maxWidth: `calc(100% - ${Math.max(0, avatarSize - 25)}px)` }}
      title={title}
    >
      {icon}

      <Text size='xs' theme='muted' weight='medium' truncate>
        {text}
      </Text>
    </HStack>
  );
};

export { StatusInfo as default };
