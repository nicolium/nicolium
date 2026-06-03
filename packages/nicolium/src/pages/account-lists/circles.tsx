import iconListBullets from '@phosphor-icons/core/regular/list-bullets.svg';
import React, { useState } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import List, { ListItem } from '@/components/list';
import Column from '@/components/ui/column';
import Form from '@/components/ui/form';
import Icon from '@/components/ui/icon';
import Input from '@/components/ui/input';
import Spinner from '@/components/ui/spinner';
import { getOrderedLists } from '@/pages/account-lists/lists';
import { useCircles, useCreateCircle } from '@/queries/accounts/use-circles';

const messages = defineMessages({
  heading: { id: 'column.circles', defaultMessage: 'Circles' },
  subheading: { id: 'circles.subheading', defaultMessage: 'Your circles' },
  label: { id: 'circles.new.title.placeholder', defaultMessage: 'New circle title' },
  title: { id: 'circles.new.create', defaultMessage: 'Add circle' },
  create: { id: 'circles.new.create.title', defaultMessage: 'Add circle' },
});

const NewCircleForm: React.FC = () => {
  const intl = useIntl();

  const [title, setTitle] = useState('');

  const { mutate: createCircle, isPending } = useCreateCircle();

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setTitle(e.target.value);
  };

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    createCircle(title);
  };

  const label = intl.formatMessage(messages.label);
  const create = intl.formatMessage(messages.create);

  return (
    <Form className='lists__list' onSubmit={handleSubmit}>
      <label className='grow'>
        <span style={{ display: 'none' }}>{label}</span>

        <Input
          type='text'
          value={title}
          disabled={isPending}
          onChange={handleChange}
          placeholder={label}
        />
      </label>

      <button disabled={isPending} type='submit'>
        {create}
      </button>
    </Form>
  );
};

const CirclesPage: React.FC = () => {
  const intl = useIntl();

  const { data: circles } = useCircles(getOrderedLists);

  if (!circles) {
    return (
      <Column>
        <Spinner />
      </Column>
    );
  }

  const emptyMessage = (
    <FormattedMessage
      id='empty_column.circles'
      defaultMessage='You don’t have any circles yet. When you create one, it will show up here.'
    />
  );

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <div className='lists'>
        <NewCircleForm />

        {!Object.keys(circles).length ? (
          <div className='lists__empty'>{emptyMessage}</div>
        ) : (
          <List>
            {circles.map((circle) => (
              <ListItem
                key={circle.id}
                to='/circles/$circleId'
                params={{ circleId: circle.id }}
                label={
                  <div className='lists__list'>
                    <Icon src={iconListBullets} size={20} />
                    <span>{circle.title}</span>
                  </div>
                }
              />
            ))}
          </List>
        )}
      </div>
    </Column>
  );
};

export { CirclesPage as default };
