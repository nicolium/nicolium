// copy-pasted from [react-native-bottom-sheet](https://github.com/gorhom/react-native-bottom-sheet/blob/master/src/components/bottomSheetTextInput/BottomSheetTextInput.tsx)
// licensed under MIT license.

import { useBottomSheetInternal } from '@gorhom/bottom-sheet';
import React, { useCallback, useImperativeHandle, useRef } from 'react';
import {
  TextInput as RNTextInput,
  type NativeSyntheticEvent,
  type TextInputFocusEventData,
} from 'react-native';
import { findNodeHandle } from 'react-native';

import type { TextInputProps } from '@mkljczk/react-native-paper';
import type { TextInput } from 'react-native-gesture-handler';

const useBottomSheetTextInputProps = (
  providedRef: React.Ref<TextInput | undefined>,
  onBlur: TextInputProps['onBlur'],
  onFocus: TextInputProps['onFocus'],
) => {
  const ref = useRef<TextInput>(null);
  //#endregion

  //#region hooks
  const { animatedKeyboardState, textInputNodesRef } = useBottomSheetInternal();
  //#endregion

  //#region callbacks
  const handleOnFocus = useCallback(
    (args: NativeSyntheticEvent<TextInputFocusEventData>) => {
      animatedKeyboardState.set((state) => ({
        ...state,
        target: args.nativeEvent.target,
      }));
      if (onFocus) {
        onFocus(args);
      }
    },
    [onFocus, animatedKeyboardState],
  );
  const handleOnBlur = React.useCallback(
    (args: NativeSyntheticEvent<TextInputFocusEventData>) => {
      const keyboardState = animatedKeyboardState.get();
      const currentFocusedInput = findNodeHandle(RNTextInput.State.currentlyFocusedInput());

      /**
       * we need to make sure that we only remove the target
       * if the target belong to the current component and
       * if the currently focused input is not in the targets set.
       */
      const shouldRemoveCurrentTarget = keyboardState.target === args.nativeEvent.target;
      const shouldIgnoreBlurEvent =
        currentFocusedInput && textInputNodesRef.current.has(currentFocusedInput);

      if (shouldRemoveCurrentTarget && !shouldIgnoreBlurEvent) {
        animatedKeyboardState.set((state) => ({
          ...state,
          target: undefined,
        }));
      }
      if (onBlur) {
        onBlur(args);
      }
    },
    [onBlur, animatedKeyboardState, textInputNodesRef],
  );
  //#endregion

  //#region effects
  React.useEffect(() => {
    const componentNode = findNodeHandle(ref.current);
    if (!componentNode) {
      return;
    }

    if (!textInputNodesRef.current.has(componentNode)) {
      textInputNodesRef.current.add(componentNode);
    }

    return () => {
      const componentNode = findNodeHandle(ref.current);
      if (!componentNode) {
        return;
      }

      const keyboardState = animatedKeyboardState.get();
      /**
       * remove the keyboard state target if it belong
       * to the current component.
       */
      if (keyboardState.target === componentNode) {
        animatedKeyboardState.set((state) => ({
          ...state,
          target: undefined,
        }));
      }

      if (textInputNodesRef.current.has(componentNode)) {
        textInputNodesRef.current.delete(componentNode);
      }
    };
  }, [textInputNodesRef, animatedKeyboardState]);
  useImperativeHandle(providedRef, () => ref.current ?? undefined, []);

  return React.useMemo(() => ({ handleOnBlur, handleOnFocus }), [handleOnBlur, handleOnFocus]);
};

export { useBottomSheetTextInputProps };
