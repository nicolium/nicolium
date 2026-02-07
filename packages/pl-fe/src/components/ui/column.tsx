import { type LinkOptions, useNavigate, useRouter } from '@tanstack/react-router';
import clsx from 'clsx';
import throttle from 'lodash/throttle';
import React, { useCallback, useEffect, useState } from 'react';

import Helmet from '@/components/helmet';
import { usePlFeConfig } from '@/hooks/use-pl-fe-config';

import { Card, CardBody, CardHeader, CardTitle, type CardSizes } from './card';

type IColumnHeader = Pick<IColumn, 'label' | 'backHref' | 'backParams' | 'className' | 'action'>;

/** Contains the column title with optional back button. */
const ColumnHeader: React.FC<IColumnHeader> = ({ label, backHref, backParams, className, action }) => {
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

      {action && (
        <div className='flex grow justify-end'>
          {action}
        </div>
      )}
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
const Column: React.FC<IColumn> = (props): JSX.Element => {
  const { backHref, children, label, transparent = false, withHeader = true, className, bodyClassName, action, size } = props;
  const plFeConfig = usePlFeConfig();
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = useCallback(throttle(() => {
    setIsScrolled(window.pageYOffset > 32);
  }, 50), []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <Card role='region' aria-label={label} column-type={transparent ? 'transparent' : 'filled'} size={size} variant={transparent ? undefined : 'rounded'} className={clsx('relative', className)}>
      <Helmet>
        <title>{label}</title>

        {plFeConfig.appleAppId && (
          <meta
            data-react-helmet='true'
            name='apple-itunes-app'
            content={`app-id=${plFeConfig.appleAppId}, app-argument=${location.href}`}
          />
        )}
      </Helmet>

      {withHeader && (
        <ColumnHeader
          label={label}
          backHref={backHref}
          className={clsx({
            'rounded-t-3xl': !isScrolled && !transparent,
            'sticky top-0 z-10 bg-white/90 dark:bg-primary-900/90 black:bg-black/75 backdrop-blur backdrop-saturate-200': !transparent,
            'p-4 sm:p-0 sm:pb-4 black:p-4': transparent,
            '-mt-4 -mx-4 p-4': size !== 'lg' && !transparent,
            '-mt-4 -mx-4 p-4 sm:-mt-6 sm:-mx-6 sm:p-6': size === 'lg' && !transparent,
          })}
          action={action}
        />
      )}

      <CardBody className={bodyClassName}>
        {children}
      </CardBody>
    </Card>
  );
};

export {
  Column as default,
  Column,
};
