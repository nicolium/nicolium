import React from 'react';

import Widget from '@/components/ui/widget';

import { ProfileField } from '../../util/async-components';

import type { Account } from 'pl-api';

interface IProfileFieldsPanel {
  account: Pick<Account, 'emojis' | 'fields' | 'id'>;
}

/** Custom profile fields for sidebar. */
const ProfileFieldsPanel: React.FC<IProfileFieldsPanel> = ({ account }) => (
  <Widget className='⁂-profile-fields-panel'>
    {account.fields.map((field, i) => (
      <ProfileField field={field} key={i} emojis={account.emojis} accountId={account.id} />
    ))}
  </Widget>
);

export { ProfileFieldsPanel as default };
