/** Breakpoint at which the application is considered "mobile". */
const LAYOUT_BREAKPOINT = 581;

/** Check if the width is small enough to be considered "mobile". */
const isMobile = (width: number) => width <= LAYOUT_BREAKPOINT;

/** Whether the device is iOS (best guess). */
const iOS: boolean = /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window);

const userTouching = window.matchMedia('(pointer: coarse)');

/** Whether the device is iOS (best guess). */
const isIOS = (): boolean => iOS;

export { LAYOUT_BREAKPOINT, isMobile, userTouching, isIOS };
