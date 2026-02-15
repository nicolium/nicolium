import clsx from 'clsx';
import React from 'react';

interface IStatusInfo {
  avatarSize: number;
  icon: React.ReactNode;
  text: React.ReactNode;
  className?: string;
  title?: string;
}

const StatusInfo = (props: IStatusInfo) => {
  const { avatarSize, icon, text, className, title } = props;

  const onClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return (
    <div
      className={clsx('⁂-status-info', className)}
      onClick={onClick}
      style={{
        marginLeft: Math.max(0, avatarSize - 25),
        maxWidth: `calc(100% - ${Math.max(0, avatarSize - 25)}px)`,
      }}
      title={title}
    >
      {icon}

      <p>{text}</p>
    </div>
  );
};

export { StatusInfo as default };
