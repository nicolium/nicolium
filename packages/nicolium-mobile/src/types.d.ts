declare module '*.png' {
  // eslint-disable-next-line
  const value: import('react-native').ImageSourcePropType;
  export default value;
}

declare module '*.jpg' {
  // eslint-disable-next-line
  const value: import('react-native').ImageSourcePropType;
  export default value;
}

declare module '*.svg' {
  import React from 'react';
  // eslint-disable-next-line
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}
