import iconCaretDown from '@phosphor-icons/core/regular/caret-down.svg';
import iconCaretRight from '@phosphor-icons/core/regular/caret-right.svg';
import clsx from 'clsx';
import React, { useState } from 'react';

import Icon from '@/components/ui/icon';
import { useRemoteInstance } from '@/queries/instance/use-remote-instance';

import InstanceRestrictions from './instance-restrictions';

interface IRestrictedInstance {
  host: string;
}

const RestrictedInstance: React.FC<IRestrictedInstance> = ({ host }) => {
  const remoteInstance = useRemoteInstance(host);

  const [expanded, setExpanded] = useState(false);

  const toggleExpanded: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    setExpanded((value) => !value);
    e.preventDefault();
  };

  return (
    <div
      className={clsx('restricted-instance', {
        'restricted-instance--rejected': remoteInstance.federation.reject,
      })}
    >
      <a href='#' onClick={toggleExpanded}>
        <Icon src={expanded ? iconCaretDown : iconCaretRight} />
        <div className={clsx({ 'line-through': remoteInstance.federation.reject })}>
          {remoteInstance.host}
        </div>
      </a>
      <div
        className={clsx('restricted-instance__content', {
          'restricted-instance__content': expanded,
        })}
      >
        <InstanceRestrictions remoteInstance={remoteInstance} />
      </div>
    </div>
  );
};

export { RestrictedInstance as default };
