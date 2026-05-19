import iconCheckCircle from '@phosphor-icons/core/regular/check-circle.svg';
import iconCheck from '@phosphor-icons/core/regular/check.svg';
import { animated, config, useSpring } from '@react-spring/web';
import clsx from 'clsx';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Icon from '@/components/ui/icon';

import { ParsedContent } from '../statuses/parsed-content';

import type { Poll } from 'pl-api';

const messages = defineMessages({
  voted: { id: 'poll.voted', defaultMessage: 'You voted for this answer' },
  votes: { id: 'poll.votes', defaultMessage: '{votes, plural, one {# vote} other {# votes}}' },
});

const PollPercentageBar: React.FC<{ percent: number }> = ({ percent }): React.JSX.Element => {
  const styles = useSpring({
    from: { width: '0%' },
    to: { width: `${percent}%` },
    config: config.gentle,
  });

  return <animated.span className='⁂-poll__percentage-bar' style={styles} />;
};

interface IPollOptionText extends IPollOption {
  percent: number;
}

const PollOptionText: React.FC<IPollOptionText> = ({ poll, option, index, active, onToggle }) => {
  const handleOptionChange: React.EventHandler<React.ChangeEvent> = () => {
    onToggle(index);
  };

  const handleOptionKeyPress: React.EventHandler<React.KeyboardEvent> = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onToggle(index);
      e.stopPropagation();
      e.preventDefault();
    }
  };

  return (
    <label
      className={clsx('⁂-poll__option-text', { '⁂-poll__option-text--active': active })}
      key={option.title}
    >
      <input
        name='poll-option'
        type={poll.multiple ? 'checkbox' : 'radio'}
        value={index}
        checked={active}
        onChange={handleOptionChange}
      />

      <div>
        <div className='⁂-poll__option-text__text'>
          <ParsedContent html={option.title} emojis={poll.emojis} />
        </div>

        <div className='⁂-poll__option-text__radio'>
          <span
            tabIndex={0}
            role={poll.multiple ? 'checkbox' : 'radio'}
            onKeyPress={handleOptionKeyPress}
            aria-checked={active}
            aria-label={option.title}
          >
            {active && <Icon src={iconCheck} />}
          </span>
        </div>
      </div>
    </label>
  );
};

interface IPollOption {
  poll: Poll;
  option: Poll['options'][number];
  index: number;
  showResults?: boolean;
  active: boolean;
  onToggle: (value: number) => void;
  language?: string | null;
  truncate?: boolean;
}

const PollOption: React.FC<IPollOption> = (props): React.JSX.Element | null => {
  const { index, poll, option, showResults, language } = props;

  const intl = useIntl();

  if (!poll) return null;

  const pollVotesCount = (poll.multiple && poll.voters_count) || poll.votes_count;
  const percent = pollVotesCount === 0 ? 0 : (option.votes_count / pollVotesCount) * 100;
  const voted = poll.own_votes?.includes(index);
  const message = intl.formatMessage(messages.votes, { votes: option.votes_count });

  if (!showResults) return <PollOptionText percent={percent} {...props} />;

  return (
    <div className='⁂-poll__option' title={message} key={option.title}>
      <PollPercentageBar percent={percent} />

      <div className='⁂-poll__option__label'>
        <ParsedContent
          html={(language && option.title_map && option.title_map[language]) ?? option.title}
          emojis={poll.emojis}
        />
      </div>

      <div className='⁂-poll__option__result'>
        {voted && <Icon src={iconCheckCircle} alt={intl.formatMessage(messages.voted)} />}

        <span>{Math.round(percent)}%</span>
      </div>
    </div>
  );
};

export { PollOption as default };
