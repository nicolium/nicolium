import { render } from 'katex';

import 'katex/dist/katex.min.css';
import React, { useCallback, useLayoutEffect, useRef } from 'react';

interface IFormula {
  formula: string;
  block?: boolean;
}

const Formula: React.FC<IFormula> = ({ formula, block = false }) => {
  const ref = useRef<HTMLElement>(null);
  const setRef = useCallback((element: HTMLElement | null) => {
    ref.current = element;
  }, []);

  useLayoutEffect(() => {
    if (!ref.current) return;

    render(formula, ref.current, {
      throwOnError: false,
      trust: false,
      displayMode: block,
    } as any);
  }, [formula, block]);

  if (!block) return <span className='formula' ref={setRef} />;
  return <div className='formula' ref={setRef} />;
};

export { Formula as default };
