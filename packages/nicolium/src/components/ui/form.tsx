import clsx from 'clsx';
import React from 'react';

interface IForm {
  /** Form submission event handler. */
  onSubmit?: (event: React.SubmitEvent<HTMLFormElement>) => void;
  /** Class name override for the <form> element. */
  className?: string;
  /** Elements to display within the Form. */
  children: React.ReactNode;
}

/** Form element with custom styles. */
const Form: React.FC<IForm> = ({ onSubmit, children, className, ...filteredProps }) => {
  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = React.useCallback(
    (event) => {
      event.preventDefault();

      if (onSubmit) {
        onSubmit(event);
      }
    },
    [onSubmit],
  );

  return (
    <form
      data-testid='form'
      onSubmit={handleSubmit}
      className={clsx('form', className)}
      {...filteredProps}
    >
      {children}
    </form>
  );
};

export { Form as default };
