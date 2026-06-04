import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import Form from '@/components/ui/form';
import FormActions from '@/components/ui/form-actions';
import FormGroup from '@/components/ui/form-group';
import Textarea from '@/components/ui/textarea';
import { useOwnAccount } from '@/hooks/use-own-account';
import { captureSentryFeedback } from '@/sentry';

interface ISentryFeedbackForm {
  eventId: string;
}

/** Accept feedback for the given Sentry event. */
const SentryFeedbackForm: React.FC<ISentryFeedbackForm> = ({ eventId }) => {
  const { data: account } = useOwnAccount();

  const [feedback, setFeedback] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleFeedbackChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setFeedback(e.target.value);
  };

  const handleSubmitFeedback: React.SubmitEventHandler<HTMLFormElement> = async (_e) => {
    if (!feedback || !eventId) return;
    setIsSubmitting(true);

    await captureSentryFeedback({
      name: account?.acct,
      associatedEventId: eventId,
      message: feedback,
    }).catch(console.error);

    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <p className='feedback-form__submitted'>
        <FormattedMessage id='alert.unexpected.thanks' defaultMessage='Thanks for your feedback!' />
      </p>
    );
  }

  return (
    <Form onSubmit={handleSubmitFeedback} className='feedback-form'>
      <FormGroup>
        <Textarea
          value={feedback}
          onChange={handleFeedbackChange}
          placeholder='Anything you can tell us about what happened?'
          disabled={isSubmitting}
          autoGrow
        />
      </FormGroup>

      <FormActions>
        <button type='submit' disabled={!feedback || isSubmitting}>
          <FormattedMessage
            id='alert.unexpected.submit_feedback'
            defaultMessage='Submit feedback'
          />
        </button>
      </FormActions>
    </Form>
  );
};

export { SentryFeedbackForm as default };
