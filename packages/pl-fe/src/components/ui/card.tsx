import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import SvgIcon from '@/components/ui/svg-icon';

const messages = defineMessages({
  back: { id: 'card.back.label', defaultMessage: 'Back' },
});

type CardSizes = 'md' | 'lg' | 'xl';

interface ICard extends Pick<React.HTMLAttributes<HTMLDivElement>, 'role' | 'aria-label'> {
  /** The type of card. */
  variant?: 'default' | 'rounded' | 'slim';
  /** Card size preset. */
  size?: CardSizes;
  /** Extra classnames for the <div> element. */
  className?: string;
  /** Elements inside the card. */
  children: React.ReactNode;
  tabIndex?: number;
}

/** An opaque backdrop to hold a collection of related elements. */
const Card = React.forwardRef<HTMLDivElement, ICard>(
  (
    { children, variant = 'default', size = 'md', className, ...filteredProps },
    ref,
  ): React.JSX.Element => (
    <div
      ref={ref}
      {...filteredProps}
      className={clsx(
        {
          [`⁂-card--rounded ⁂-card--${size}`]: variant === 'rounded',
          '⁂-card--slim': variant === 'slim',
        },
        className,
      )}
    >
      {children}
    </div>
  ),
);

interface ICardHeader {
  backHref?: string;
  onBackClick?: (event: React.MouseEvent) => void;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Card header container with back button.
 * Typically holds a CardTitle.
 */
const CardHeader: React.FC<ICardHeader> = ({
  className,
  children,
  backHref,
  onBackClick,
}): React.JSX.Element => {
  const intl = useIntl();

  const renderBackButton = () => {
    if (!backHref && !onBackClick) {
      return null;
    }

    const Comp: React.ElementType = backHref ? Link : 'button';
    const backAttributes = backHref ? { to: backHref } : { onClick: onBackClick };

    return (
      <Comp
        {...backAttributes}
        className='⁂-card-header__button'
        aria-label={intl.formatMessage(messages.back)}
        title={intl.formatMessage(messages.back)}
      >
        <SvgIcon src={require('@phosphor-icons/core/regular/arrow-left.svg')} aria-hidden />
      </Comp>
    );
  };

  return (
    <div className={clsx('⁂-card-header', className)}>
      {renderBackButton()}

      {children}
    </div>
  );
};

interface ICardTitle {
  title: React.ReactNode;
  truncate?: boolean;
}

/** A card's title. */
const CardTitle: React.FC<ICardTitle> = ({ title, truncate = true }): React.JSX.Element => (
  <h1
    className={clsx('⁂-card-title', { '⁂-card-title--truncate': truncate })}
    data-testid='card-title'
  >
    {title}
  </h1>
);

interface ICardBody {
  /** Classnames for the <div> element. */
  className?: string;
  /** Children to appear inside the card. */
  children: React.ReactNode;
}

/** A card's body. */
const CardBody: React.FC<ICardBody> = ({ className, children }): React.JSX.Element => (
  <div data-testid='card-body' className={className}>
    {children}
  </div>
);

export { type CardSizes, Card as default, Card, CardHeader, CardTitle, CardBody };
