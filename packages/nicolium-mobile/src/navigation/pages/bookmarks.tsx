import { Text } from '@mkljczk/react-native-paper';
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';

import type { BookmarksStackParams } from '../router';

const AllBookmarksScreen = (_: NativeStackScreenProps<BookmarksStackParams, 'all'>) => {
  return <Text>meow</Text>;
};

const BookmarksStack = createNativeStackNavigator<BookmarksStackParams>();

const BookmarksStackScreen = () => {
  return (
    <BookmarksStack.Navigator>
      <BookmarksStack.Screen
        name='all'
        component={AllBookmarksScreen}
        options={{ headerShown: false, title: 'Bookmarks' }}
      />
    </BookmarksStack.Navigator>
  );
};

export { BookmarksStackScreen };
