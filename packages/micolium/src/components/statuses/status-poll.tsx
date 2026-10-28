import {
  Button,
  Checkbox,
  Icon,
  RadioButton,
  Text,
  TouchableRipple,
  useTheme,
} from '@mkljczk/react-native-paper';
import { CheckIcon } from 'phosphor-react-native/src/icons/Check';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { View } from 'react-native';

import RelativeTimestamp from '@/components/relative-timestamp';
import { usePollQuery, usePollVoteMutation } from '@/queries/statuses/use-poll';

import { Emojify } from '../ui/emojify';

import type { SelectedStatus } from '@/queries/statuses/use-status';
import type { Translation } from 'pl-api';

interface IStatusPoll {
  status: SelectedStatus;
  translation?: Translation;
}

const StatusPoll: React.FC<IStatusPoll> = ({ status, translation }) => {
  const { colors } = useTheme();

  const { data: poll, refetch } = usePollQuery(status.poll_id!);
  const { mutate: vote, isPending } = usePollVoteMutation(status.poll_id!);

  const [selected, setSelected] = React.useState<Array<number>>([]);
  const [showResults, setShowResults] = React.useState(poll?.expired || poll?.voted || false);

  if (!poll) return null;

  const pollVotesCount = (poll.multiple && poll.voters_count) || poll.votes_count;

  return (
    <>
      <View style={{ gap: 8 }}>
        {poll.options.map((option, index) => {
          const percent = pollVotesCount === 0 ? 0 : (option.votes_count / pollVotesCount) * 100;

          const voted = poll.voted && poll.own_votes?.includes(index);

          const handleCheck = () =>
            setSelected((value) =>
              poll.multiple
                ? value.includes(index)
                  ? value.filter((candidate) => candidate !== index)
                  : [...value, index]
                : [index],
            );

          return (
            <TouchableRipple
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                paddingRight: 12,
                padding: showResults ? 10 : 0,
                borderRadius: 8,
                borderColor: colors.outlineVariant,
                borderWidth: 1,
                position: 'relative',
                overflow: 'hidden',
              }}
              onPress={handleCheck}
            >
              <>
                {showResults ? (
                  <View
                    style={{
                      width: `${percent}%`,
                      top: 0,
                      bottom: 0,
                      backgroundColor: colors.secondaryFixedDim,
                      position: 'absolute',
                    }}
                  />
                ) : poll.multiple ? (
                  <Checkbox
                    status={selected.includes(index) ? 'checked' : 'unchecked'}
                    onPress={handleCheck}
                    style={{ margin: 0 }}
                    disabled={isPending}
                  />
                ) : (
                  <RadioButton
                    status={selected.includes(index) ? 'checked' : 'unchecked'}
                    onPress={() => setSelected([index])}
                    value={option.title}
                    disabled={isPending}
                  />
                )}
                <Text numberOfLines={1} style={{ flex: voted ? undefined : 1 }}>
                  <Emojify
                    text={translation?.poll?.options[index]?.title || option.title}
                    emojis={status.emojis}
                  />
                </Text>
                {voted && (
                  <View style={{ flex: voted ? 1 : undefined }}>
                    <Icon source={CheckIcon} size={18} />
                  </View>
                )}
                {showResults && <Text variant='labelSmall'>{Math.round(percent)}%</Text>}
              </>
            </TouchableRipple>
          );
        })}
      </View>

      <Text variant='bodyMedium'>
        {poll.voters_count ? (
          <FormattedMessage
            id='poll.total_people'
            defaultMessage='{count, plural, one {# person} other {# people}}'
            values={{ count: poll.voters_count }}
          />
        ) : (
          <FormattedMessage
            id='poll.total_votes'
            defaultMessage='{count, plural, one {# vote} other {# votes}}'
            values={{ count: poll.votes_count }}
          />
        )}
        {' · '}
        {poll.expired ? (
          <FormattedMessage id='poll.closed' defaultMessage='Closed' />
        ) : (
          poll.expires_at && <RelativeTimestamp timestamp={poll.expires_at} futureDate />
        )}
        {poll.non_anonymous && (
          <>
            {' · '}
            <FormattedMessage id='poll.non_anonymous' defaultMessage='Public poll' />
          </>
        )}
        {showResults && (
          <>
            {' · '}
            <Text style={{ textDecorationLine: 'underline' }} onPress={() => refetch()}>
              <FormattedMessage id='poll.refresh' defaultMessage='Refresh' />
            </Text>
          </>
        )}
      </Text>

      {!poll.voted && !poll.expired && (
        <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'space-between' }}>
          {!showResults && (
            <Button
              style={{ flex: 1 }}
              mode='contained'
              disabled={!selected.length}
              loading={isPending}
              onPress={() =>
                vote(selected, {
                  onSuccess() {
                    setShowResults(true);
                  },
                })
              }
            >
              <FormattedMessage id='poll.vote' defaultMessage='Submit vote' />
            </Button>
          )}
          <Button
            style={{ flex: 1 }}
            mode='contained-tonal'
            onPress={() => setShowResults((value) => !value)}
          >
            {showResults ? (
              <FormattedMessage id='poll.hide_results' defaultMessage='Hide results' />
            ) : (
              <FormattedMessage id='poll.show_results' defaultMessage='Show results' />
            )}
          </Button>
        </View>
      )}
    </>
  );
};

export { StatusPoll };
