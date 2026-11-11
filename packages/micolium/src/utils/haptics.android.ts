import * as Haptics from 'expo-haptics';

const haptics = {
  selection: () => Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Segment_Tick),
  toggleOn: () => Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Toggle_On),
  toggleOff: () => Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Toggle_Off),
  longPress: () => Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Long_Press),
  confirm: () => Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Confirm),
  reject: () => Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Reject),
};

export { haptics };
