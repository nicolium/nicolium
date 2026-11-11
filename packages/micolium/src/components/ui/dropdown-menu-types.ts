import type { SFSymbol } from 'expo-symbols';

type DropdownMenuItem = {
  key: string;
} & (
  | {
      type: 'button';
      onPress: () => void;
      label: string;
      sublabel?: string;
      appleIcon?: SFSymbol;
      androidIcon?: string;
      disabled?: boolean;
      checked?: boolean;
      destructive?: boolean;
    }
  | {
      type: 'section';
      children: Array<DropdownMenuItem>;
      label?: string;
      sublabel?: string;
      appleIcon?: SFSymbol;
      androidIcon?: string;
      controlGroup?: boolean;
    }
  | {
      type: 'menu';
      children: Array<DropdownMenuItem>;
      label: string;
      sublabel?: string;
      appleIcon?: SFSymbol;
      androidIcon?: string;
      disabled?: boolean;
    }
);

export { type DropdownMenuItem };
