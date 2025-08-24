import { LAYOUT_BREAKPOINT } from 'pl-fe/is-mobile';

import { useScreenWidth } from './use-screen-width';

export function useIsMobile() {
  const screenWidth = useScreenWidth();
  return screenWidth <= LAYOUT_BREAKPOINT;
}
