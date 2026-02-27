import React from 'react';

import Text, { type IText } from './ui/text';

interface IMarkup extends IText {}

/** Styles HTML markup returned by the API, such as in account bios and statuses. */
const Markup = React.forwardRef<HTMLElement, IMarkup>((props, ref) => (
  <Text ref={ref} {...props} data-markup />
));

export { Markup as default };
