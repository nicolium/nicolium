import { HashtagNode } from '@lexical/hashtag';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { $convertToMarkdownString } from '@lexical/markdown';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $nodesOfType, $getRoot, type EditorState, $getNodeByKey } from 'lexical';
import debounce from 'lodash/debounce';
import { useCallback, useEffect } from 'react';
import { useIntl } from 'react-intl';

import { fetchStatus } from '@/actions/statuses';
import { useCurrentAccountContext } from '@/contexts/current-account-context';
import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';
import { backendUrl } from '@/stores/auth';
import { useComposeActions, useSubmitCompose } from '@/stores/compose';
import { useSettings } from '@/stores/settings';
import { getStatusIdsFromLinksInContent } from '@/utils/status';
import Purify from '@/utils/url-purify';

import { TRANSFORMERS } from '../transformers';

import type { LanguageIdentificationModel } from 'fasttext.wasm.js/dist/models/language-identification/common.js';

let lidModel: LanguageIdentificationModel;
let browserLanguageDetector: LanguageDetector | undefined;

interface IStatePlugin {
  composeId: string;
  isWysiwyg?: boolean;
}

const StatePlugin: React.FC<IStatePlugin> = ({ composeId, isWysiwyg }) => {
  const intl = useIntl();
  const client = useClient();
  const accountOrInstanceUrl = useCurrentAccountContext().meUrl || backendUrl;
  const [editor] = useLexicalComposerContext();
  const features = useFeatures();
  const { urlPrivacy, ignoreHashtagCasingSuggestions } = useSettings();
  const actions = useComposeActions();
  const submitCompose = useSubmitCompose(composeId);

  const checkUrls = useCallback(
    debounce((editorState: EditorState) => {
      if (!urlPrivacy.clearLinksInCompose) return;

      const compose = actions.getCompose(composeId);

      editorState.read(() => {
        const compareUrl = (url: string) => {
          const cleanUrl = Purify.clearUrl(url, true, false);
          return {
            originalUrl: url,
            cleanUrl,
            isDirty: cleanUrl !== url,
          };
        };

        if (compose.clearLinkSuggestion?.key) {
          const node = $getNodeByKey(compose.clearLinkSuggestion.key);
          const url = (node as LinkNode | null)?.getURL?.();
          if (!url || node === null || !compareUrl(url).isDirty) {
            actions.updateCompose(composeId, (draft) => {
              draft.clearLinkSuggestion = null;
            });
          } else {
            return;
          }
        }

        const links = [...$nodesOfType(AutoLinkNode), ...$nodesOfType(LinkNode)];

        for (const link of links) {
          if (compose.dismissedClearLinksSuggestions.includes(link.getKey())) {
            continue;
          }

          const { originalUrl, cleanUrl, isDirty } = compareUrl(link.getURL());
          if (!isDirty) {
            continue;
          }

          if (isDirty) {
            actions.updateCompose(composeId, (draft) => {
              draft.clearLinkSuggestion = { key: link.getKey(), originalUrl, cleanUrl };
            });
            return;
          }
        }
      });
    }, 2000),
    [urlPrivacy.clearLinksInCompose],
  );

  const updatePreview = useCallback(
    debounce(() => {
      submitCompose({ preview: true });
    }, 2000),
    [],
  );

  const checkHashtagCasingSuggestions = useCallback(
    debounce((editorState: EditorState) => {
      if (ignoreHashtagCasingSuggestions) return;

      const compose = actions.getCompose(composeId);

      if (compose.hashtagCasingSuggestionIgnored) return;

      editorState.read(() => {
        const hashtagNodes = $nodesOfType(HashtagNode);

        for (const tag of hashtagNodes) {
          const text = tag.getTextContent();

          if (text.length > 10 && text.toLowerCase() === text && !/[0-9]/.test(text)) {
            actions.updateCompose(composeId, (draft) => {
              draft.hashtagCasingSuggestion = text;
            });
            return;
          }
        }

        actions.updateCompose(composeId, (draft) => {
          draft.hashtagCasingSuggestion = null;
        });
      });
    }, 1000),
    [ignoreHashtagCasingSuggestions],
  );

  const getQuoteSuggestions = useCallback(
    debounce((text: string) => {
      const compose = actions.getCompose(composeId);

      if (!features.quotePosts || compose?.quoteId) return;

      const ids = getStatusIdsFromLinksInContent(text);

      (async () => {
        let quoteId: string | undefined;

        for (const id of ids) {
          if (compose?.dismissedQuotes.includes(id)) continue;

          if (queryClient.getQueryData(queryKeys.statuses.show(id))) {
            quoteId = id;
            break;
          }

          const status = await fetchStatus(client, id, accountOrInstanceUrl, intl);

          if (status) {
            quoteId = status.id;
            break;
          }
        }

        if (quoteId)
          actions.updateCompose(composeId, (draft) => {
            draft.quoteId = quoteId!;
          });
      })();
    }, 2000),
    [],
  );

  const detectLanguage = useCallback(
    debounce((text: string) => {
      const compose = actions.getCompose(composeId);

      if (!features.postLanguages || features.languageDetection || compose?.language) return;

      const wordsLength = text.split(/\s+/).length;

      if (wordsLength < 4) return;

      (async () => {
        if ('LanguageDetector' in globalThis) {
          try {
            const availability = await LanguageDetector.availability();
            if (availability !== 'unavailable') {
              if (!browserLanguageDetector) {
                browserLanguageDetector = await LanguageDetector.create();
              }
              const [result] = await browserLanguageDetector.detect(text);
              if (
                result?.confidence &&
                result.confidence > 0.5 &&
                result.detectedLanguage !== 'und'
              ) {
                actions.updateCompose(composeId, (draft) => {
                  draft.suggestedLanguage = result.detectedLanguage!;
                });
                return;
              }
            }
          } catch {}
        }

        if (!lidModel) {
          // eslint-disable-next-line import/extensions
          const { getLIDModel } = await import('fasttext.wasm.js/common');
          lidModel = await getLIDModel();
        }
        if (!lidModel.model) await lidModel.load();
        const { alpha2, possibility } = await lidModel.identify(text.replace(/\s+/i, ' '));

        if (alpha2 && possibility > 0.5) {
          actions.updateCompose(composeId, (draft) => {
            draft.suggestedLanguage = alpha2;
          });
        }
      })();
    }, 750),
    [],
  );

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      const plainText = editorState.read(() => $getRoot().getTextContent());
      editor.update(() => {
        let text = plainText;
        if (isWysiwyg) {
          text = $convertToMarkdownString(TRANSFORMERS);
        }
        const isEmpty = text === '';
        const data = isEmpty ? null : JSON.stringify(editorState.toJSON());
        actions.updateCompose(composeId, (draft) => {
          if (!draft.modifiedLanguage || draft.modifiedLanguage === draft.language) {
            draft.editorState = data as string;
            draft.text = text;
          } else if (draft.modifiedLanguage) {
            draft.editorStateMap[draft.modifiedLanguage] = data as string;
            draft.textMap[draft.modifiedLanguage] = text;
          }
          if (draft.preview && draft.previewAutoUpdate) {
            updatePreview();
          }
        });
        checkUrls(editorState);
        checkHashtagCasingSuggestions(editorState);
        getQuoteSuggestions(plainText);
        detectLanguage(plainText);
        if (isEmpty) {
          window.onbeforeunload = null;
        } else {
          window.onbeforeunload = (event) => {
            event.preventDefault();
            event.returnValue = true;
          };
        }
      });
    });
  }, [editor]);

  return null;
};

export { StatePlugin as default };
