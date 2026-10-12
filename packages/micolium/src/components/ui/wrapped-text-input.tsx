import { TextInput, type TextInputHandles, type TextInputProps } from '@mkljczk/react-native-paper';
import React from 'react';

import { useBottomSheetTextInputProps } from '@/hooks/use-bottom-sheet-text-input-props';

const WrappedTextInput: React.FC<TextInputProps> = (props) => {
  const textInputNode = React.useRef<TextInputHandles>(null);

  const { handleOnBlur, handleOnFocus } = useBottomSheetTextInputProps(
    textInputNode,
    props.onBlur,
    props.onFocus,
  );

  return <TextInput {...props} ref={textInputNode} onBlur={handleOnBlur} onFocus={handleOnFocus} />;
};

export { WrappedTextInput };
