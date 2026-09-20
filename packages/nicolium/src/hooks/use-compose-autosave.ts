import { useEffect, useRef } from 'react';

import { usePersistDraftStatus } from '@/queries/statuses/use-draft-statuses';
import { checkComposeContent, useCompose } from '@/stores/compose';
import { useSettings } from '@/stores/settings';

import { useDebounce } from './use-debounce';

const AUTOSAVE_DELAY = 5000;

const useComposeAutosave = (
  composeId: string,
  enabled: boolean = true,
  onAutosave?: () => void,
) => {
  const compose = useCompose(composeId);
  const { autosaveDrafts } = useSettings();
  const persistDraftStatus = usePersistDraftStatus();
  const isFirstRender = useRef(true);

  const active = enabled && autosaveDrafts && !compose.editedId && !compose.redacting;

  const signature = active
    ? JSON.stringify([
        compose.editorState,
        compose.spoilerText,
        compose.mediaAttachments.map((media) => media.id),
        compose.poll,
        compose.scheduledAt,
      ])
    : null;

  const debouncedSignature = useDebounce(signature, AUTOSAVE_DELAY);

  useEffect(() => {
    if (!active || debouncedSignature === null) return;
    if (!checkComposeContent(compose)) return;

    if (!isFirstRender.current) {
      persistDraftStatus(composeId);
      onAutosave?.();
    }
  }, [debouncedSignature]);

  useEffect(() => {
    isFirstRender.current = false;
  }, []);
};

export { useComposeAutosave };
