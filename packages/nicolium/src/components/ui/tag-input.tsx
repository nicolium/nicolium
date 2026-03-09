import React, { useState } from 'react';

import HStack from './hstack';
import Tag from './tag';

interface ITagInput {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

/** Manage a list of tags. */
// https://blog.logrocket.com/building-a-tag-input-field-component-for-react/
const TagInput: React.FC<ITagInput> = ({ tags, onChange, placeholder }) => {
  const [input, setInput] = useState('');

  const handleTagDelete = (tag: string) => {
    onChange(tags.filter((item) => item !== tag));
  };

  const handleKeyDown: React.KeyboardEventHandler = (e) => {
    const { key } = e;
    const trimmedInput = input.trim();

    if (key === 'Tab') {
      e.preventDefault();
    }

    if (
      [',', 'Tab', 'Enter'].includes(key) &&
      trimmedInput.length &&
      !tags.includes(trimmedInput)
    ) {
      e.preventDefault();
      onChange([...tags, trimmedInput]);
      setInput('');
    }

    if (key === 'Backspace' && !input.length && tags.length) {
      e.preventDefault();
      const tagsCopy = [...tags];
      tagsCopy.pop();

      onChange(tagsCopy);
    }
  };

  return (
    <div className='⁂-tag-input'>
      <HStack className='⁂-tag-input__list' space={2} wrap>
        {tags.map((tag) => (
          <div key={tag} className='⁂-tag-input__item'>
            <Tag tag={tag} onDelete={handleTagDelete} />
          </div>
        ))}

        <input
          className='⁂-tag-input__field'
          value={input}
          placeholder={placeholder}
          onChange={(e) => {
            setInput(e.target.value);
          }}
          onKeyDown={handleKeyDown}
        />
      </HStack>
    </div>
  );
};

export { TagInput as default };
