import clsx from 'clsx';
import React from 'react';

import StatusContainer from '@/components/statuses/status-container';
import Tombstone from '@/components/statuses/tombstone';
import PlaceholderStatus from '@/features/placeholder/components/placeholder-status';
import { useMinimalStatus } from '@/queries/statuses/use-status';
import { useReplyCount, useReplyToId } from '@/stores/contexts';
import { useStatusMeta } from '@/stores/status-meta';
import { isMobile } from '@/utils/is-mobile';

import type { FilterContextType } from '@/queries/settings/use-filters';

interface IThreadStatus {
  id: string;
  contextType?: FilterContextType;
  focusedStatusId: string;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  linear?: boolean;
  depth?: number;
  isAncestor?: boolean;
}

/** Status with reply-connector in threads. */
const ThreadStatus: React.FC<IThreadStatus> = (props): React.JSX.Element => {
  const { id, focusedStatusId } = props;

  const replyToId = useReplyToId(id);
  const replyCount = useReplyCount(id);
  const { data: statusData } = useMinimalStatus(id);
  const isLoaded = Boolean(statusData);
  const { deleted } = useStatusMeta(id);

  const [maxIndentDepth] = React.useState(isMobile(window.innerWidth) ? 6 : 8);

  const isIndentMode = props.depth !== undefined;
  const depth = Math.min(props.depth ?? 0, maxIndentDepth);

  if (deleted) {
    return (
      <div className='py-4 pb-8'>
        {depth > 0 && <DepthBorders depth={depth} />}
        <Tombstone id={id} onMoveUp={props.onMoveUp} onMoveDown={props.onMoveDown} deleted />
      </div>
    );
  }

  const renderTreeConnector = (): React.JSX.Element | null => {
    if (props.linear || (isIndentMode && !props.isAncestor)) return null;

    const isConnectedTop = replyToId && replyToId !== focusedStatusId;
    const isConnectedBottom = replyCount > 0;
    const isConnected = isConnectedTop || isConnectedBottom;

    if (!isConnected) return null;

    return (
      <div
        className={clsx(
          'absolute left-5 z-[1] hidden w-0.5 bg-gray-200 black:bg-gray-800 dark:bg-primary-800 rtl:left-auto rtl:right-5',
          {
            'top-[calc(12px+42px)] !block h-[calc(100%-42px-8px-1rem)]': isConnectedBottom,
          },
        )}
      />
    );
  };

  const status = isLoaded ? (
    <StatusContainer {...props} showGroup={false} />
  ) : (
    <PlaceholderStatus variant='default' />
  );

  return (
    <div
      className={clsx('thread__status relative pb-4', {
        'thread__status--linear': props.linear,
        'thread__status--ancestor': props.isAncestor,
      })}
    >
      {isIndentMode && depth > 0 && !props.isAncestor && <DepthBorders depth={depth} />}
      {renderTreeConnector()}
      <div style={depth > 0 ? { marginInlineStart: `${depth}rem` } : undefined}>{status}</div>
      {props.linear && (
        <hr className='-mx-4 mt-2 max-w-[100vw] border-t-2 black:border-t dark:border-gray-800' />
      )}
    </div>
  );
};

interface IDepthBorders {
  depth: number;
}

const DepthBorders: React.FC<IDepthBorders> = ({ depth }) => (
  <>
    {new Array(depth).fill(0).map((_, d) => (
      <span
        key={d}
        className='thread-indent-border'
        style={{ insetInlineStart: `${d + 0.5}rem` }}
      />
    ))}
  </>
);

export { ThreadStatus as default };
