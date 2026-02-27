import { animated, config, useSpring } from '@react-spring/web';
import clsx from 'clsx';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import HStack from '@/components/ui/hstack';
import Icon from '@/components/ui/icon';
import Text from '@/components/ui/text';

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

  return (
    <animated.span
      className='absolute inset-0 inline-block h-full rounded-l-md bg-primary-100 dark:bg-primary-500'
      style={styles}
    />
  );
};

interface IPollOptionText extends IPollOption {
  percent: number;
}

const PollOptionText: React.FC<IPollOptionText> = ({
  poll,
  option,
  index,
  active,
  onToggle,
  truncate,
}) => {
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
      className={clsx(
        'relative flex cursor-pointer rounded-3xl border border-solid bg-white p-2 hover:bg-primary-50 dark:bg-primary-900 dark:hover:bg-primary-800/50',
        {
          'border-primary-600 bg-primary-50 ring-1 ring-primary-600 dark:border-primary-300 dark:bg-primary-800/50 dark:ring-primary-300':
            active,
          'border-primary-300 dark:border-primary-500': !active,
        },
      )}
    >
      <input
        className='hidden'
        name='vote-options'
        type={poll.multiple ? 'checkbox' : 'radio'}
        value={index}
        checked={active}
        onChange={handleOptionChange}
      />

      <div className='grid w-full items-center'>
        <div className='col-start-1 row-start-1 max-w-full justify-self-center overflow-hidden pl-4 pr-6'>
          <div className={clsx('text-primary-600 dark:text-white', { truncate })}>
            <Text
              theme='inherit'
              weight='medium'
              align='center'
              className='line-clamp-1 inline text-ellipsis break-words'
            >
              <ParsedContent html={option.title} emojis={poll.emojis} />
            </Text>
          </div>
        </div>

        <div className='col-start-1 row-start-1 flex items-center justify-self-end'>
          <span
            className={clsx(
              'flex size-6 flex-none items-center justify-center rounded-full border border-solid',
              {
                'border-primary-600 bg-primary-600 dark:border-primary-300 dark:bg-primary-300':
                  active,
                'border-primary-300 bg-white dark:border-primary-500 dark:bg-primary-900': !active,
              },
            )}
            tabIndex={0}
            role={poll.multiple ? 'checkbox' : 'radio'}
            onKeyPress={handleOptionKeyPress}
            aria-checked={active}
            aria-label={option.title}
          >
            {active && (
              <Icon
                src={require('@phosphor-icons/core/regular/check.svg')}
                className='size-4 text-white dark:text-primary-900'
              />
            )}
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
  const { index, poll, option, showResults, language, truncate } = props;

  const intl = useIntl();

  if (!poll) return null;

  const pollVotesCount = (poll.multiple && poll.voters_count) || poll.votes_count;
  const percent = pollVotesCount === 0 ? 0 : (option.votes_count / pollVotesCount) * 100;
  const voted = poll.own_votes?.includes(index);
  const message = intl.formatMessage(messages.votes, { votes: option.votes_count });

  return (
    <div key={option.title}>
      {showResults ? (
        <div title={message}>
          <HStack
            justifyContent='between'
            alignItems='center'
            className='relative w-full overflow-hidden rounded-md bg-white p-2 dark:bg-primary-800'
          >
            <PollPercentageBar percent={percent} />

            <div className='overflow-hidden text-primary-600 dark:text-white'>
              <Text
                theme='inherit'
                weight='medium'
                className={clsx('relative break-words', { truncate })}
              >
                <ParsedContent
                  html={
                    (language && option.title_map && option.title_map[language]) ?? option.title
                  }
                  emojis={poll.emojis}
                />
              </Text>
            </div>

            <HStack space={2} alignItems='center' className='relative'>
              {voted ? (
                <Icon
                  src={require('@phosphor-icons/core/regular/check-circle.svg')}
                  alt={intl.formatMessage(messages.voted)}
                  className='size-4 text-primary-600 dark:fill-white dark:text-primary-800'
                />
              ) : (
                <div className='svg-icon' />
              )}

              <div className='text-primary-600 dark:text-white'>
                <Text weight='medium' theme='inherit'>
                  {Math.round(percent)}%
                </Text>
              </div>
            </HStack>
          </HStack>
        </div>
      ) : (
        <PollOptionText percent={percent} {...props} />
      )}
    </div>
  );
};

export { PollOption as default };
