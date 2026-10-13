import type { ItemIcon } from 'zeego/dropdown-menu';

type SFSymbol = NonNullable<React.ComponentProps<typeof ItemIcon>['ios']>['name'];

export { SFSymbol };
