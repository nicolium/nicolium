import React from 'react';

import HStack from 'pl-fe/components/ui/hstack';
import Text from 'pl-fe/components/ui/text';

interface IStatusInfo {
  avatarSize: number;
  icon: React.ReactNode;
  text: React.ReactNode;
}

const StatusInfo = (props: IStatusInfo) => {
  const { avatarSize, icon, text } = props;

  const onClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
  };

  return (
    <HStack
      space={2}
      alignItems='center'
      className='-mb-2 w-fit cursor-default rounded-full border border-gray-200 bg-gray-100 px-3 py-1 black:border-gray-800 black:bg-gray-900 dark:border-transparent dark:bg-primary-800 rtl:space-x-reverse'
      onClick={onClick}
      style={{ marginLeft: avatarSize + 12 }}
    >
      {icon}

      <Text size='xs' theme='muted' weight='medium' truncate>
        {text}
      </Text>
    </HStack>
  );
};

export { StatusInfo as default };
