import React from 'react';

import Text from '@/components/ui/text';
import { generateText, randomIntFromInterval } from '@/utils/placeholders';

const PlaceholderGroupSearch = ({ withJoinAction = true }: { withJoinAction?: boolean }) => {
  const groupNameLength = randomIntFromInterval(12, 20);

  return (
    <div className='flex items-center justify-between no-reduce-motion:animate-pulse'>
      <div className='flex items-center gap-2 overflow-hidden'>
        {/* Group Avatar */}
        <div className='size-11 rounded-lg bg-gray-500 dark:bg-gray-700 dark:ring-primary-900' />

        <div className='flex flex-col text-gray-500 dark:text-gray-700'>
          <Text theme='inherit' weight='bold'>
            {generateText(groupNameLength)}
          </Text>

          <div className='flex items-center gap-1'>
            <Text theme='inherit' tag='span' size='sm' weight='medium'>
              {generateText(6)}
            </Text>

            <span>&bull;</span>

            <Text theme='inherit' tag='span' size='sm' weight='medium'>
              {generateText(6)}
            </Text>
          </div>
        </div>
      </div>

      {/* Join Group Button */}
      {withJoinAction && <div className='h-10 w-36 rounded-full bg-gray-300 dark:bg-gray-800' />}
    </div>
  );
};

export { PlaceholderGroupSearch as default };
