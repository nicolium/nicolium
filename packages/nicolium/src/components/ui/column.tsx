import { type LinkOptions, useNavigate, useRouter } from '@tanstack/react-router';
import clsx from 'clsx';
import throttle from 'lodash/throttle';
import React, { useCallback, useEffect, useState } from 'react';

import HeadTitle from '@/components/helmet';
import { useFrontendConfig } from '@/hooks/use-frontend-config';

import { Card, CardBody, CardHeader, CardTitle, type CardSizes } from './card';

type IColumnHeader = Pick<
  IColumn,
  | 'label'
  | 'title'
  | 'withBack'
  | 'backHref'
  | 'backParams'
  | 'className'
  | 'action'
  | 'truncateTitle'
>;

/** Contains the column title with optional back button. */
const ColumnHeader: React.FC<IColumnHeader> = ({
  label,
  title,
  withBack,
  backHref,
  backParams,
  className,
  action,
  truncateTitle,
}) => {
  const navigate = useNavigate();
  const { history } = useRouter();

  const handleBackClick: React.MouseEventHandler = (event) => {
    event.preventDefault();

    if (!history.canGoBack) {
      navigate({ to: '/' });
    } else {
      history.back();
    }
  };

  return (
    <CardHeader
      className={className}
      backHref={backHref}
      backParams={backParams}
      onBackClick={withBack ? handleBackClick : undefined}
    >
      <CardTitle title={title || label} truncate={truncateTitle} />

      {action && <div className='⁂-column__header__action'>{action}</div>}
    </CardHeader>
  );
};

interface IColumn {
  /** Route the back button goes to. */
  withBack?: boolean;
  backHref?: LinkOptions['to'];
  backParams?: LinkOptions['params'];
  backSearch?: LinkOptions['search'];
  /** Column title text. */
  label?: string;
  title?: React.ReactNode;
  /** Whether this column should have a transparent background. */
  transparent?: boolean;
  /** Whether this column should have a title and back button. */
  withHeader?: boolean;
  /** Extra class name for top <div> element. */
  className?: string;
  /** Extra class name for the <CardBody> element. */
  bodyClassName?: string;
  /** Children to display in the column. */
  children?: React.ReactNode;
  /** Action for the ColumnHeader, displayed at the end. */
  action?: React.ReactNode;
  /** Column size, inherited from Card. */
  size?: CardSizes;
  truncateTitle?: boolean;
}

/** A backdrop for the main section of the UI. */
const Column: React.FC<IColumn> = ({
  withBack = true,
  backHref,
  children,
  label,
  title,
  transparent = false,
  withHeader = true,
  className,
  bodyClassName,
  action,
  size,
  truncateTitle,
}) => {
  const frontendConfig = useFrontendConfig();
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = useCallback(
    throttle(() => {
      setIsScrolled(window.pageYOffset > 32);
    }, 50),
    [],
  );

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <Card
      role='region'
      aria-label={label}
      column-type={transparent ? 'transparent' : 'filled'}
      size={size}
      variant={transparent ? undefined : 'rounded'}
      className={clsx('⁂-column', className)}
    >
      <HeadTitle title={label} />
      {frontendConfig.appleAppId && (
        <meta
          name='apple-itunes-app'
          content={`app-id=${frontendConfig.appleAppId}, app-argument=${location.href}`}
        />
      )}

      {withHeader && (
        <ColumnHeader
          label={label}
          title={title}
          withBack={withBack}
          backHref={backHref}
          className={clsx('⁂-column__header', {
            '⁂-column__header--scrolled': isScrolled,
          })}
          action={action}
          truncateTitle={truncateTitle}
        />
      )}

      <CardBody className={bodyClassName}>{children}</CardBody>
    </Card>
  );
};

export { Column as default, Column };
