// Adapted from Mastodon https://github.com/mastodon/mastodon/blob/main/app/javascript/mastodon/components/hashtag_bar.tsx
import { Link } from '@tanstack/react-router';
import React, { useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';

// Fit on a single line on desktop
const VISIBLE_HASHTAGS = 3;

interface IHashtagsBar {
  hashtags: Array<string>;
}

const HashtagsBar: React.FC<IHashtagsBar> = ({ hashtags }) => {
  const [expanded, setExpanded] = useState(false);
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = useCallback((e) => {
    e.stopPropagation();

    setExpanded(true);
  }, []);

  if (hashtags.length === 0) {
    return null;
  }

  const revealedHashtags = expanded ? hashtags : hashtags.slice(0, VISIBLE_HASHTAGS);

  return (
    <div className='⁂-hashtags-bar'>
      {revealedHashtags.map((hashtag) => (
        <Link
          key={hashtag}
          to='/tags/$hashtag'
          params={{ hashtag }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          className='⁂-hashtags-bar__item'
        >
          <bdi>
            #<span>{hashtag}</span>
          </bdi>
        </Link>
      ))}

      {!expanded && hashtags.length > VISIBLE_HASHTAGS && (
        <button onClick={handleClick}>
          <FormattedMessage
            id='hashtags.and_other'
            defaultMessage='…and {count, plural, other {# more}}'
            values={{ count: hashtags.length - VISIBLE_HASHTAGS }}
          />
        </button>
      )}
    </div>
  );
};

export { HashtagsBar as default };
