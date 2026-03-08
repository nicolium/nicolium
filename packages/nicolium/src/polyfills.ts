if (!('requestIdleCallback' in window)) {
  (window as Window).requestIdleCallback = (
    cb: IdleRequestCallback,
    options?: IdleRequestOptions,
  ) => setTimeout(cb, options?.timeout ?? 1000);
}
