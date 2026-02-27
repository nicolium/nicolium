import { STANDALONE_CHECK_SUCCESS, type InstanceAction } from '@/actions/instance';

const initialState = {
  /** Whether /api/v1/instance 404'd (and we should display the external auth form). */
  instance_fetch_failed: false,
};

const meta = (state = initialState, action: InstanceAction): typeof initialState => {
  switch (action.type) {
    case STANDALONE_CHECK_SUCCESS:
      return { instance_fetch_failed: !action.ok };
    default:
      return state;
  }
};

export { meta as default };
