const PIN_SUCCESS = 'PIN_SUCCESS' as const;

const UNPIN_SUCCESS = 'UNPIN_SUCCESS' as const;

type InteractionsAction = {
  type: typeof PIN_SUCCESS | typeof UNPIN_SUCCESS;
  statusId: string;
  accountId: string;
};

export { PIN_SUCCESS, UNPIN_SUCCESS, type InteractionsAction };
