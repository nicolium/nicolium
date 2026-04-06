import React, { memo, useMemo } from 'react';

import Checkbox from './checkbox';

interface IFormGroup {
  /** Input label message. */
  labelText?: React.ReactNode;
  /** Input label tooltip message. */
  labelTitle?: string;
  /** Input hint message. */
  hintText?: React.ReactNode;
  /** Input errors. */
  errors?: string[];
  /** Elements to display within the FormGroup. */
  children: React.ReactNode;
}

/** Input container with label. Renders the child. */
const FormGroup: React.FC<IFormGroup> = (props) => {
  const { children, errors = [], labelText, labelTitle, hintText } = props;
  const formFieldId: string = useMemo(() => `field-${crypto.randomUUID()}`, []);
  const inputChildren = React.Children.toArray(children);
  const hasError = errors?.length > 0;

  let firstChild;
  if (React.isValidElement(inputChildren[0])) {
    firstChild = React.cloneElement(inputChildren[0], {
      // @ts-expect-error
      id: formFieldId,
      'aria-invalid': hasError,
      'aria-describedby': hasError ? `error-${formFieldId}` : undefined,
    });
  }

  // @ts-expect-error
  const isCheckboxFormGroup = firstChild?.type === Checkbox;

  if (isCheckboxFormGroup) {
    return (
      <div className='flex items-start gap-2'>
        {firstChild}

        <div className='flex flex-col'>
          {labelText && (
            <label
              htmlFor={formFieldId}
              data-testid='form-group-label'
              className='⁂-form-group__label ⁂-form-group__label--checkbox'
              title={labelTitle}
            >
              {labelText}
            </label>
          )}

          {hasError && (
            <div>
              <p
                id={`error-${formFieldId}`}
                data-testid='form-group-error'
                className='⁂-form-group__error'
              >
                {errors.join(', ')}
              </p>
            </div>
          )}

          {hintText && (
            <p
              data-testid='form-group-hint'
              className='⁂-form-group__hint ⁂-form-group__hint--below'
            >
              {hintText}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className='⁂-form-group'>
      {labelText && (
        <label
          htmlFor={formFieldId}
          data-testid='form-group-label'
          className='⁂-form-group__label'
          title={labelTitle}
        >
          {labelText}
        </label>
      )}

      <div className='⁂-form-group__content'>
        {hintText && (
          <p data-testid='form-group-hint' className='⁂-form-group__hint ⁂-form-group__hint--above'>
            {hintText}
          </p>
        )}

        {firstChild}
        {inputChildren.filter((_, i) => i !== 0)}

        {hasError && (
          <p
            id={`error-${formFieldId}`}
            data-testid='form-group-error'
            className='⁂-form-group__error'
          >
            {errors.join(', ')}
          </p>
        )}
      </div>
    </div>
  );
};

const MemoizedFormGroup = memo(FormGroup);

export { MemoizedFormGroup as default };
