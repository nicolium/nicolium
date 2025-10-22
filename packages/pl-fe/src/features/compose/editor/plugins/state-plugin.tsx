import { HashtagNode } from '@lexical/hashtag';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { $convertToMarkdownString } from '@lexical/markdown';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $nodesOfType, $getRoot, type EditorState, $getNodeByKey } from 'lexical';
import debounce from 'lodash/debounce';
import { useCallback, useEffect } from 'react';
import { useIntl } from 'react-intl';

import { addSuggestedLanguage, addSuggestedQuote, setEditorState, suggestClearLink, suggestHashtagCasing } from 'pl-fe/actions/compose';
import { fetchStatus } from 'pl-fe/actions/statuses';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { useSettings } from 'pl-fe/stores/settings';
import { getStatusIdsFromLinksInContent } from 'pl-fe/utils/status';
import Purify from 'pl-fe/utils/url-purify';

import { TRANSFORMERS } from '../transformers';

import type { LanguageIdentificationModel } from 'fasttext.wasm.js/dist/models/language-identification/common.js';

let lidModel: LanguageIdentificationModel;

interface IStatePlugin {
  composeId: string;
  isWysiwyg?: boolean;
}

const StatePlugin: React.FC<IStatePlugin> = ({ composeId, isWysiwyg }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const [editor] = useLexicalComposerContext();
  const features = useFeatures();
  const { urlPrivacy, ignoreHashtagCasingSuggestions } = useSettings();

  const checkUrls = useCallback(debounce((editorState: EditorState) => {
    dispatch(async (_, getState) => {
      if (!urlPrivacy.clearLinksInCompose) return;

      const state = getState();
      const compose = state.compose[composeId];

      editorState.read(() => {
        const compareUrl = (url: string) => {
          const cleanUrl = Purify.clearUrl(url, true, false);
          return {
            originalUrl: url,
            cleanUrl,
            isDirty: cleanUrl !== url,
          };
        };

        if (compose.clear_link_suggestion?.key) {
          const node = $getNodeByKey(compose.clear_link_suggestion.key);
          const url = (node as LinkNode | null)?.getURL?.();
          if (!url || node === null || !compareUrl(url).isDirty) {
            dispatch(suggestClearLink(composeId, null));
          } else {
            return;
          }
        }

        const links = [...$nodesOfType(AutoLinkNode), ...$nodesOfType(LinkNode)];

        for (const link of links) {
          if (compose.dismissed_clear_links_suggestions.includes(link.getKey())) {
            continue;
          }

          const { originalUrl, cleanUrl, isDirty } = compareUrl(link.getURL());
          if (!isDirty) {
            continue;
          }

          if (isDirty) {
            return dispatch(suggestClearLink(composeId, { key: link.getKey(), originalUrl, cleanUrl }));
          }
        }
      });
    });
  }, 2000), [urlPrivacy.clearLinksInCompose]);

  const checkHashtagCasingSuggestions = useCallback(debounce((editorState: EditorState) => {
    dispatch(async (_, getState) => {
      if (ignoreHashtagCasingSuggestions) return;

      const state = getState();
      const compose = state.compose[composeId];

      if (compose.hashtag_casing_suggestion_ignored) return;

      editorState.read(() => {
        const hashtagNodes = $nodesOfType(HashtagNode);

        for (const tag of hashtagNodes) {
          const text = tag.getTextContent();

          if (text.length > 10 && text.toLowerCase() === text && !text.match(/[0-9]/)) {
            dispatch(suggestHashtagCasing(composeId, text));
            return;
          }
        }

        dispatch(suggestHashtagCasing(composeId, null));
      });
    });
  }, 1000), [ignoreHashtagCasingSuggestions]);

  const getQuoteSuggestions = useCallback(debounce((text: string) => {
    dispatch(async (_, getState) => {
      const state = getState();
      const compose = state.compose[composeId];

      if (!features.quotePosts || compose?.quote) return;

      const ids = getStatusIdsFromLinksInContent(text);

      let quoteId: string | undefined;

      for (const id of ids) {
        if (compose?.dismissed_quotes.includes(id)) continue;

        if (state.statuses[id]) {
          quoteId = id;
          break;
        }

        const status = await dispatch(fetchStatus(id, intl));

        if (status) {
          quoteId = status.id;
          break;
        }
      }

      if (quoteId) dispatch(addSuggestedQuote(composeId, quoteId));
    });
  }, 2000), []);

  const detectLanguage = useCallback(debounce(async (text: string) => {
    dispatch(async (dispatch, getState) => {
      const state = getState();
      const compose = state.compose[composeId];

      if (!features.postLanguages || features.languageDetection || compose?.language) return;

      const wordsLength = text.split(/\s+/).length;

      if (wordsLength < 4) return;

      if (!lidModel) {
        // eslint-disable-next-line import/extensions
        const { getLIDModel } = await import('fasttext.wasm.js/common');
        lidModel = await getLIDModel();
      }
      if (!lidModel.model) await lidModel.load();
      const { alpha2, possibility } = await lidModel.identify(text.replace(/\s+/i, ' '));

      if (alpha2 && possibility > 0.5) {
        dispatch(addSuggestedLanguage(composeId, alpha2));
      }
    });
  }, 750), []);

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
        dispatch(setEditorState(composeId, data, text));
        checkUrls(editorState);
        checkHashtagCasingSuggestions(editorState);
        getQuoteSuggestions(plainText);
        detectLanguage(plainText);
      });
    });
  }, [editor]);

  return null;
};

export { StatePlugin as default };
