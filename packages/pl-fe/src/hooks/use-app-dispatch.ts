import { useDispatch } from 'react-redux';

import type { AppDispatch } from '@/store';

const useAppDispatch = () => useDispatch<AppDispatch>();

export { useAppDispatch };
