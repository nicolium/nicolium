import iconX from '@phosphor-icons/core/regular/x.svg';
import React from 'react';

import IconButton from './icon-button';
import Text from './text';

interface ITag {
  /** Name of the tag. */
  tag: string;
  /** Callback when the X icon is pressed. */
  onDelete: (tag: string) => void;
}

/** A single editable Tag (used by TagInput). */
const Tag: React.FC<ITag> = ({ tag, onDelete }) => (
  <div className='tag'>
    <Text theme='white'>{tag}</Text>

    <IconButton
      iconClassName='h-4 w-4'
      src={iconX}
      onClick={() => {
        onDelete(tag);
      }}
    />
  </div>
);

export { Tag as default };
