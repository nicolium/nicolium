import React from 'react';

interface IFormActions {
  children: React.ReactNode;
}

/** Container element to house form actions. */
const FormActions: React.FC<IFormActions> = ({ children }) => (
  <div className='⁂-form__actions'>{children}</div>
);

export { FormActions as default };
