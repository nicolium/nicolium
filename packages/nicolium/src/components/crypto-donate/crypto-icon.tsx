import genericIcon from 'cryptocurrency-icons/svg/color/generic.svg';
import React from 'react';

let modules: Record<string, any> | null = null;

/** Get crypto icon URL by ticker symbol, or fall back to generic icon */
const getIcon = (ticker: string): string => {
  if (modules === null) {
    modules = import.meta.glob('../../../../node_modules/cryptocurrency-icons/svg/color/*.svg', {
      eager: true,
    });
  }
  const key = `../../../../node_modules/cryptocurrency-icons/svg/color/${ticker}.svg`;
  return modules[key]?.default ?? genericIcon;
};

interface ICryptoIcon {
  ticker: string;
  title?: string;
  className?: string;
  imgClassName?: string;
}

const CryptoIcon: React.FC<ICryptoIcon> = ({
  ticker,
  title,
  className,
  imgClassName,
}): React.JSX.Element => (
  <div className={className}>
    <img className={imgClassName} src={getIcon(ticker)} alt={title ?? ticker} />
  </div>
);

export { CryptoIcon as default };
