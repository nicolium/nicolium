const REBLOG_REQUEST = 'REBLOG_REQUEST' as const;
const REBLOG_FAIL = 'REBLOG_FAIL' as const;

const FAVOURITE_REQUEST = 'FAVOURITE_REQUEST' as const;
const FAVOURITE_FAIL = 'FAVOURITE_FAIL' as const;

const DISLIKE_REQUEST = 'DISLIKE_REQUEST' as const;
const DISLIKE_FAIL = 'DISLIKE_FAIL' as const;

const UNREBLOG_REQUEST = 'UNREBLOG_REQUEST' as const;
const UNREBLOG_FAIL = 'UNREBLOG_FAIL' as const;

const UNFAVOURITE_REQUEST = 'UNFAVOURITE_REQUEST' as const;

const UNDISLIKE_REQUEST = 'UNDISLIKE_REQUEST' as const;

const PIN_SUCCESS = 'PIN_SUCCESS' as const;

const UNPIN_SUCCESS = 'UNPIN_SUCCESS' as const;

type InteractionsAction = {
  type: typeof REBLOG_REQUEST | typeof UNREBLOG_REQUEST | typeof FAVOURITE_REQUEST | typeof UNFAVOURITE_REQUEST | typeof DISLIKE_REQUEST | typeof UNDISLIKE_REQUEST;
  statusId: string;
} | {
  type: typeof REBLOG_FAIL | typeof UNREBLOG_FAIL | typeof FAVOURITE_FAIL | typeof DISLIKE_FAIL;
  statusId: string;
  error: unknown;
} | {
  type: typeof PIN_SUCCESS | typeof UNPIN_SUCCESS;
  statusId: string;
  accountId: string;
};

export {
  REBLOG_REQUEST,
  REBLOG_FAIL,
  FAVOURITE_REQUEST,
  FAVOURITE_FAIL,
  DISLIKE_REQUEST,
  DISLIKE_FAIL,
  UNREBLOG_REQUEST,
  UNREBLOG_FAIL,
  UNFAVOURITE_REQUEST,
  UNDISLIKE_REQUEST,
  PIN_SUCCESS,
  UNPIN_SUCCESS,
  type InteractionsAction,
};
