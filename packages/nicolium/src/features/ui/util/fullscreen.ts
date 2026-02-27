// APIs for normalizing fullscreen operations. Note that Edge uses
// the WebKit-prefixed APIs currently (as of Edge 16).

const isFullscreen = (): boolean =>
  Boolean(
    // eslint-disable-next-line compat/compat
    document.fullscreenElement ??
    // @ts-expect-error
    document.webkitFullscreenElement,
  );

const exitFullscreen = (): void => {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if ('webkitExitFullscreen' in document) {
    // @ts-expect-error
    document.webkitExitFullscreen();
  }
};

const requestFullscreen = (el: Element): void => {
  if (el.requestFullscreen) {
    el.requestFullscreen();
  } else if ('webkitRequestFullscreen' in el) {
    // @ts-expect-error
    el.webkitRequestFullscreen();
  }
};

export { isFullscreen, exitFullscreen, requestFullscreen };
