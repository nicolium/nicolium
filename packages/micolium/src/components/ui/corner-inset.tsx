import { UNSTABLE_CornerInset } from '@react-navigation/native';
import { Platform } from 'react-native';

const CornerInset = Platform.OS === 'ios' ? UNSTABLE_CornerInset : () => null;

export { CornerInset };
