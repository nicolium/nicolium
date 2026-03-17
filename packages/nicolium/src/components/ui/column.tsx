import { type LinkOptions, useNavigate, useRouter } from '@tanstack/react-router';
import clsx from 'clsx';
import throttle from 'lodash/throttle';
import React, { useCallback, useEffect, useState } from 'react';

import Helmet from '@/components/helmet';
import { useFrontendConfig } from '@/hooks/use-frontend-config';

import { Card, CardBody, CardHeader, CardTitle, type CardSizes } from './card';

interface IColumnHeader extends Pick<IColumn, 'backHref' | 'backParams' | 'className' | 'action'> {
  label?: React.ReactNode;
}

/** Contains the column title with optional back button. */
const ColumnHeader: React.FC<IColumnHeader> = ({
  label,
  backHref,
  backParams,
  className,
  action,
}) => {
  const navigate = useNavigate();
  const { history } = useRouter();

  const handleBackClick = () => {
    if (backHref) {
      navigate({ to: backHref, params: backParams });
      return;
    }

    if (!history.canGoBack) {
      navigate({ to: '/' });
    } else {
      history.back();
    }
  };

  return (
    <CardHeader className={className} onBackClick={handleBackClick}>
      <CardTitle title={label} />

      {action && <div className='⁂-column__header__action'>{action}</div>}
    </CardHeader>
  );
};

interface IColumn {
  /** Route the back button goes to. */
  backHref?: LinkOptions['to'];
  backParams?: LinkOptions['params'];
  backSearch?: LinkOptions['search'];
  /** Column title text. */
  label?: string;
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
}

/** A backdrop for the main section of the UI. */
const Column: React.FC<IColumn> = (props): React.JSX.Element => {
  const {
    backHref,
    children,
    label,
    transparent = false,
    withHeader = true,
    className,
    bodyClassName,
    action,
    size,
  } = props;
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
      <Helmet title={label}>
        {frontendConfig.appleAppId && (
          <meta
            name='apple-itunes-app'
            content={`app-id=${frontendConfig.appleAppId}, app-argument=${location.href}`}
          />
        )}
      </Helmet>

      {withHeader && (
        <ColumnHeader
          label={label}
          backHref={backHref}
          className={clsx('⁂-column__header', {
            '⁂-column__header--scrolled': isScrolled,
          })}
          action={action}
        />
      )}

      <CardBody className={bodyClassName}>{children}</CardBody>
    </Card>
  );
};

export { Column as default, Column };
