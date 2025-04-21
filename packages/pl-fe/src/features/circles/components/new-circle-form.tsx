import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Button from 'pl-fe/components/ui/button';
import Form from 'pl-fe/components/ui/form';
import HStack from 'pl-fe/components/ui/hstack';
import Input from 'pl-fe/components/ui/input';
import { useCreateCircle } from 'pl-fe/queries/accounts/use-circles';

const messages = defineMessages({
  label: { id: 'circles.new.title_placeholder', defaultMessage: 'New circle title' },
  title: { id: 'circles.new.create', defaultMessage: 'Add circle' },
  create: { id: 'circles.new.create_title', defaultMessage: 'Add circle' },
});

const NewCircleForm: React.FC = () => {
  const intl = useIntl();

  const [title, setTitle] = useState('');

  const { mutate: createCircle, isPending } = useCreateCircle();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<Element>) => {
    e.preventDefault();
    createCircle(title);
  };

  const label = intl.formatMessage(messages.label);
  const create = intl.formatMessage(messages.create);

  return (
    <Form onSubmit={handleSubmit}>
      <HStack space={2} alignItems='center'>
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

        <Button
          disabled={isPending}
          onClick={handleSubmit}
          theme='primary'
        >
          {create}
        </Button>
      </HStack>
    </Form>
  );
};

export { NewCircleForm as default };
