/**
 * This source code is derived from code from Meta Platforms, Inc.
 * and affiliates, licensed under the MIT license located in the
 * LICENSE file in the /src/features/compose/editor directory.
 */

import {
  TRANSFORMERS as DEFAULT_TRANSFORMERS,
  type ElementTransformer,
  type TextMatchTransformer,
} from '@lexical/markdown';
import {
  $createHorizontalRuleNode,
  $isHorizontalRuleNode,
  HorizontalRuleNode,
} from '@lexical/react/LexicalHorizontalRuleNode';

import { $createImageNode, $isImageNode, ImageNode } from '../nodes/image-node';

import type { LexicalNode } from 'lexical';

const IMAGE_TRANSFORMER: TextMatchTransformer = {
  dependencies: [ImageNode],
  export: (node) => {
    if ($isImageNode(node)) {
      const src = node.getSrc();
      const alt = node.getAltText();
      return `![${alt.replaceAll(/([[\]])/g, '\\$1')}](${src})`;
    }
    return null;
  },
  importRegExp: /!(?:\[([^[]*)\])(?:\(([^(]+)\))/,
  regExp: /!(?:\[([^[]*)\])(?:\(([^(]+)\))$/,
  replace: (textNode, match) => {
    const [, altText, src] = match;
    const imageNode = $createImageNode({
      altText,
      src,
    });
    textNode.replace(imageNode);
  },
  type: 'text-match',
};

const HORIZONTAL_RULE_TRANSFORMER: ElementTransformer = {
  dependencies: [HorizontalRuleNode],
  export: (node: LexicalNode) => {
    return $isHorizontalRuleNode(node) ? '***' : null;
  },
  regExp: /^(---|\*\*\*|___)\s?$/,
  replace: (parentNode, _1, _2, isImport) => {
    const line = $createHorizontalRuleNode();

    // TODO: Get rid of isImport flag
    if (isImport || parentNode.getNextSibling() !== null) {
      parentNode.replace(line);
    } else {
      parentNode.insertBefore(line);
    }

    line.selectNext();
  },
  type: 'element',
};

const TRANSFORMERS = [...DEFAULT_TRANSFORMERS, HORIZONTAL_RULE_TRANSFORMER, IMAGE_TRANSFORMER];

export { TRANSFORMERS };
