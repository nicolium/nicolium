import {
  useTransitionStyles as useFloatingTransitionStyles,
  type FloatingContext,
  type ReferenceType,
  type UseTransitionStylesProps,
} from '@floating-ui/react';

import { useSettings } from '@/stores/settings';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const useTransitionStyles = (
  context: FloatingContext<ReferenceType>,
  props?: UseTransitionStylesProps,
) => {
  const { reduceMotion } = useSettings();
  const result = useFloatingTransitionStyles(context, props);

  if (reduceMotion || prefersReducedMotion.matches) {
    result.styles = {};
  }

  return result;
};

export { useTransitionStyles };
