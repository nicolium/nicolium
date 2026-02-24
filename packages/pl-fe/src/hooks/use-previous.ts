import { useRef, useEffect } from 'react';

/** Get the last version of this value. */
// https://usehooks.com/usePrevious/
const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current || undefined;
};

export { usePrevious };
