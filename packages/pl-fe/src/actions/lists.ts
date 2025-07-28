import { queryClient } from 'pl-fe/queries/client';

import type { List } from 'pl-api';
import type { AppDispatch } from 'pl-fe/store';

const LIST_EDITOR_TITLE_CHANGE = 'LIST_EDITOR_TITLE_CHANGE' as const;
const LIST_EDITOR_REPLIES_POLICY_CHANGE = 'LIST_EDITOR_REPLIES_POLICY_CHANGE' as const;
const LIST_EDITOR_EXCLUSIVE_CHANGE = 'LIST_EDITOR_EXCLUSIVE_CHANGE' as const;
const LIST_EDITOR_RESET = 'LIST_EDITOR_RESET' as const;
const LIST_EDITOR_SETUP = 'LIST_EDITOR_SETUP' as const;

interface ListEditorSetupAction {
  type: typeof LIST_EDITOR_SETUP;
  list: List;
}

const setupListEditor = (listId: string) => (dispatch: AppDispatch) => {
  const list = queryClient.getQueryData<Array<List>>(['lists'])?.find((list) => list.id === listId);
  if (!list) return;

  dispatch<ListEditorSetupAction>({
    type: LIST_EDITOR_SETUP,
    list,
  });
};

const changeListEditorTitle = (value: string) => ({
  type: LIST_EDITOR_TITLE_CHANGE,
  value,
});

const changeListEditorRepliesPolicy = (repliesPolicy: List['replies_policy']) => ({
  type: LIST_EDITOR_REPLIES_POLICY_CHANGE,
  repliesPolicy,
});

const changeListEditorExclusive = (exclusive: boolean) => ({
  type: LIST_EDITOR_EXCLUSIVE_CHANGE,
  exclusive,
});

const resetListEditor = () => ({
  type: LIST_EDITOR_RESET,
});

type ListsAction =
  | ListEditorSetupAction
  | ReturnType<typeof changeListEditorTitle>
  | ReturnType<typeof changeListEditorRepliesPolicy>
  | ReturnType<typeof changeListEditorExclusive>
  | ReturnType<typeof resetListEditor>;

export {
  LIST_EDITOR_TITLE_CHANGE,
  LIST_EDITOR_REPLIES_POLICY_CHANGE,
  LIST_EDITOR_EXCLUSIVE_CHANGE,
  LIST_EDITOR_RESET,
  LIST_EDITOR_SETUP,
  setupListEditor,
  changeListEditorTitle,
  changeListEditorRepliesPolicy,
  changeListEditorExclusive,
  resetListEditor,
  type ListsAction,
};
