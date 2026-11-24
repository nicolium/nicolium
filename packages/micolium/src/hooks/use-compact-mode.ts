import { useWindowDimensions } from 'react-native';

const useCompactMode = () => useWindowDimensions().width <= 375;

export { useCompactMode };
