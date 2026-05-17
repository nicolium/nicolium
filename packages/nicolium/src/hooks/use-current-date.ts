import { useEffect, useRef, useState } from 'react';

const timeToMidnight = () => {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);

  return midnight.getTime() - now.getTime();
};

const getCurrentDate = () => {
  const date = new Date();

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return [day, month, year];
};

const useCurrentDate = () => {
  const [date, setDate] = useState(getCurrentDate);

  const timeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updateTimeout = () => {
      timeout.current = setTimeout(() => {
        setDate(getCurrentDate);
        updateTimeout();
      }, timeToMidnight());
    };

    updateTimeout();

    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, []);

  return date;
};

export { getCurrentDate, useCurrentDate };
