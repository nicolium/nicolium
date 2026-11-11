import * as Haptics from 'expo-haptics';

const haptics = {
  selection: () => Haptics.selectionAsync(),
  toggleOn: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  toggleOff: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  longPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  confirm: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  reject: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
};

export { haptics };
