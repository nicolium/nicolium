import { create } from 'zustand';
import { mutative } from 'zustand-mutative';

interface PictureInPictureMediaProps {
  src: string;
  muted?: boolean;
  volume?: number;
  currentTime?: number;
  poster?: string;
  backgroundColor?: string;
  foregroundColor?: string;
  accentColor?: string;
}

interface DeployParams extends Partial<PictureInPictureMediaProps> {
  type: 'audio' | 'video';
  statusId: string;
  accountId: string;
}

type State = Partial<PictureInPictureMediaProps> & {
  type: 'audio' | 'video' | null;
  statusId?: string;
  accountId?: string;
  actions: {
    /** Open a floating player for the given media. */
    deployPictureInPicture: (params: DeployParams) => void;
    /** Close the floating player. */
    removePictureInPicture: () => void;
  };
};

const initialState = {
  type: null,
  statusId: undefined,
  accountId: undefined,
  src: undefined,
  muted: false,
  volume: 0,
  currentTime: 0,
  poster: undefined,
  backgroundColor: undefined,
  foregroundColor: undefined,
  accentColor: undefined,
} satisfies Omit<State, 'actions'>;

const usePictureInPictureStore = create<State>()(
  mutative((set) => ({
    ...initialState,
    actions: {
      deployPictureInPicture: ({ type, statusId, accountId, ...props }) => {
        set((state) => {
          Object.assign(state, initialState, { type, statusId, accountId, ...props });
        });
      },
      removePictureInPicture: () => {
        set((state) => {
          Object.assign(state, initialState);
        });
      },
    },
  })),
);

const usePictureInPicture = () => usePictureInPictureStore((state) => state);
const usePictureInPictureType = () => usePictureInPictureStore((state) => state.type);
const usePictureInPictureActions = () => usePictureInPictureStore((state) => state.actions);

export {
  usePictureInPictureStore,
  usePictureInPicture,
  usePictureInPictureType,
  usePictureInPictureActions,
};
