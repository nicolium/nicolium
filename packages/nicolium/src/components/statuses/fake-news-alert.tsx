import iconInfo from '@phosphor-icons/core/regular/info.svg';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from '../ui/icon';

interface IFakeNewsAlert {
  publishedAt: string;
}

const FakeNewsAlert: React.FC<IFakeNewsAlert> = ({ publishedAt }) => {
  return (
    <div className='fake-news-alert'>
      <h3>
        <Icon src={iconInfo} aria-hidden />
        <FormattedMessage id='status.fake_news.heading' defaultMessage='False information' />
      </h3>
      <p>
        <FormattedMessage
          id='status.fake_news.text'
          defaultMessage='This post has been marked as false information by a third-party fact-checker. {description}'
          values={{
            description: (
              <FormattedMessage
                id='status.fake_news.description.published_at'
                defaultMessage='The post was actually published on {hour}.'
                values={{ hour: publishedAt }}
              />
            ),
          }}
        />
      </p>
    </div>
  );
};

export { FakeNewsAlert as default };
