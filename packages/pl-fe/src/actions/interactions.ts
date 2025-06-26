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

interface ReblogRequest {
  type: typeof REBLOG_REQUEST;
  statusId: string;
}

interface ReblogFail {
  type: typeof REBLOG_FAIL;
  statusId: string;
  error: unknown;
}

interface UnreblogRequest {
  type: typeof UNREBLOG_REQUEST;
  statusId: string;
}

interface UnreblogFail {
  type: typeof UNREBLOG_FAIL;
  statusId: string;
  error: unknown;
}

interface FavouriteRequest {
  type: typeof FAVOURITE_REQUEST;
  statusId: string;
}

interface FavouriteFail {
  type: typeof FAVOURITE_FAIL;
  statusId: string;
  error: unknown;
}

interface UnfavouriteRequest {
  type: typeof UNFAVOURITE_REQUEST;
  statusId: string;
}

interface DislikeRequest {
  type: typeof DISLIKE_REQUEST;
  statusId: string;
}

interface DislikeFail {
  type: typeof DISLIKE_FAIL;
  statusId: string;
  error: unknown;
}

interface UndislikeRequest {
  type: typeof UNDISLIKE_REQUEST;
  statusId: string;
}

interface PinSuccess {
  type: typeof PIN_SUCCESS;
  statusId: string;
  accountId: string;
}

interface UnpinSuccess {
  type: typeof UNPIN_SUCCESS;
  statusId: string;
  accountId: string;
}

type InteractionsAction =
  | ReblogRequest
  | ReblogFail
  | UnreblogRequest
  | UnreblogFail
  | FavouriteRequest
  | FavouriteFail
  | UnfavouriteRequest
  | DislikeRequest
  | DislikeFail
  | UndislikeRequest
  | PinSuccess
  | UnpinSuccess

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
