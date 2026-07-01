const lastFocusedByColumn = new Map<string, HTMLElement>();

const rememberColumnFocus = (columnId: string, element: HTMLElement) => {
  lastFocusedByColumn.set(columnId, element);
};

const forgetColumnFocus = (columnId: string) => {
  lastFocusedByColumn.delete(columnId);
};

const focusDeckColumn = (columnElement: HTMLElement | null) => {
  if (!columnElement) return;

  const columnId = columnElement.dataset.columnId;
  const remembered = columnId ? lastFocusedByColumn.get(columnId) : undefined;

  if (remembered?.isConnected && columnElement.contains(remembered)) {
    remembered.focus();
  } else {
    columnElement.focus();
  }
};

const restoreStatusFocus = (columnElement: HTMLElement, focusedId: string) => {
  let attempts = 0;

  const handleFocus = () => {
    const element = columnElement.querySelector<HTMLElement>(
      `.focusable[data-${focusedId.split(':')[0]}-id="${focusedId.split(':')[1]}"]`,
    );
    if (element) {
      element.focus({ preventScroll: false, focusVisible: true });
    }
    // why does this even work?????
    if (attempts++ < 2) setTimeout(handleFocus, 100);
  };

  setTimeout(handleFocus, 100);
};

export { rememberColumnFocus, forgetColumnFocus, focusDeckColumn, restoreStatusFocus };
