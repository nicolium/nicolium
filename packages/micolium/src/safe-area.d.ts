import 'react-native-safe-area-context';

declare module 'react-native-safe-area-context/lib/typescript/src/SafeArea.types' {
  interface EdgeInsets {
    parentLeft?: number;
    parentRight?: number;
  }
}
