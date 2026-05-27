import type React from 'react';
import type { VirtuosoHandle } from 'react-virtuoso';

const selectChild = (
  index: number,
  handle: React.RefObject<VirtuosoHandle | null>,
  node: ParentNode = document,
  count?: number,
  align?: 'start' | 'center' | 'end',
) => {
  if (index < 0) return false;

  if (count !== undefined && index === count) {
    const loadMoreButton = node.querySelector<HTMLButtonElement>('.load-more');
    if (loadMoreButton) {
      loadMoreButton.focus({ preventScroll: false });
      return;
    }
    return false;
  }

  const selector = `[data-index="${index}"] .focusable`;
  const element = node.querySelector<HTMLDivElement>(selector);

  if (element) {
    element.focus({ preventScroll: false });
  } else {
    handle.current?.scrollIntoView({
      index,
      behavior: 'smooth',
      done: () => {
        if (!element) document.querySelector<HTMLDivElement>(selector)?.focus();
      },
      align,
    });
  }
};

export { selectChild };
