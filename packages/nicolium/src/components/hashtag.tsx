import { Link } from '@tanstack/react-router';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Sparklines, SparklinesCurve } from 'react-sparklines';

import Text from '@/components/ui/text';
import { shortNumberFormat } from '@/utils/numbers';

import type { Tag } from 'pl-api';

const accountsCountRenderer = (count: number) =>
  !!count && (
    <Text theme='muted' size='sm'>
      <FormattedMessage
        id='trends.count_by_accounts'
        defaultMessage='{count} {rawCount, plural, one {person} other {people}} talking'
        values={{
          rawCount: count,
          count: <strong>{shortNumberFormat(count)}</strong>,
        }}
      />
    </Text>
  );

interface IHashtag {
  hashtag: Tag;
}

const Hashtag: React.FC<IHashtag> = ({ hashtag }) => {
  const count = Number(hashtag.history?.[0]?.accounts);

  return (
    <div className='flex items-center justify-between' data-testid='hashtag'>
      <div className='flex flex-col'>
        <Link to='/tags/$hashtag' params={{ hashtag: hashtag.name }} className='hover:underline'>
          <Text tag='span' size='sm' weight='semibold'>
            #{hashtag.name}
          </Text>
        </Link>

        {accountsCountRenderer(count)}
      </div>

      {hashtag.history && (
        <div className='w-[40px]' data-testid='sparklines'>
          <Sparklines
            width={40}
            height={28}
            data={hashtag.history.toReversed().map((day) => +day.uses)}
          >
            <SparklinesCurve style={{ fill: 'none' }} color='#818cf8' />
          </Sparklines>
        </div>
      )}
    </div>
  );
};

export { Hashtag as default, accountsCountRenderer };
