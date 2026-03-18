import iconCaretDown from '@phosphor-icons/core/regular/caret-down.svg';
import iconCaretRight from '@phosphor-icons/core/regular/caret-right.svg';
import clsx from 'clsx';
import React, { useState } from 'react';

import Icon from '@/components/icon';
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
    <div>
      <a href='#' className='flex items-center gap-1 py-2.5 no-underline' onClick={toggleExpanded}>
        <Icon src={expanded ? iconCaretDown : iconCaretRight} />
        <div className={clsx({ 'line-through': remoteInstance.federation.reject })}>
          {remoteInstance.host}
        </div>
      </a>
      <div
        className={clsx({
          'h-0 overflow-hidden': !expanded,
          'h-auto': expanded,
        })}
      >
        <InstanceRestrictions remoteInstance={remoteInstance} />
      </div>
    </div>
  );
};

export { RestrictedInstance as default };
