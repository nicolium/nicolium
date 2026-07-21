import clsx from 'clsx';
import React from 'react';

interface IProgressCircle extends React.HTMLAttributes<HTMLDivElement> {
  progress: number;
  radius?: number;
  stroke?: number;
  title?: string;
}

const ProgressCircle: React.FC<IProgressCircle> = ({
  progress,
  radius = 12,
  stroke = 4,
  title,
  ...props
}) => {
  const progressStroke = stroke + 0.5;
  const actualRadius = radius + progressStroke;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference * (1 - Math.min(progress, 1));

  return (
    <div
      className={clsx('character-counter__circle', {
        'character-counter__circle--exceeded': progress > 1,
      })}
      title={title}
      {...props}
    >
      <svg
        width={actualRadius * 2}
        height={actualRadius * 2}
        viewBox={`0 0 ${actualRadius * 2} ${actualRadius * 2}`}
      >
        <circle cx={actualRadius} cy={actualRadius} r={radius} fill='none' strokeWidth={stroke} />
        <circle
          style={{
            strokeDashoffset: dashoffset,
            strokeDasharray: circumference,
          }}
          cx={actualRadius}
          cy={actualRadius}
          r={radius}
          fill='none'
          strokeWidth={progressStroke}
          strokeLinecap='round'
        />
      </svg>
    </div>
  );
};

export { ProgressCircle as default };
