import { Divider, useTheme } from '@mkljczk/react-native-paper';
import RenderHtml, {
  defaultSystemFonts,
  HTMLContentModel,
  HTMLElementModel,
  type TNode,
  type DomVisitorCallbacks,
  type MixedStyleDeclaration,
} from '@native-html/render';
import { Link } from '@react-navigation/native';
import { type ChildNode, Element, Text, isText } from 'domhandler';
import { prepend, removeElement, replaceElement } from 'domutils';
import React, { useMemo } from 'react';
import { useWindowDimensions, Image } from 'react-native';

import { useAccount } from '@/queries/accounts/use-account';
import { makeEmojiMap } from '@/utils/emojis';
import { multiplyFontSizes } from '@/utils/themes';

import type { CustomEmoji, Mention } from 'pl-api';

const validEmojiChar = (c: string) => /^[a-zA-Z0-9_.-]$/.test(c);

const nodesToText = (nodes: Array<ChildNode>): string =>
  nodes
    .map((node) =>
      node.type === 'text'
        ? node.data
        : node.type === 'tag'
          ? nodesToText(node.children as Array<ChildNode>)
          : '',
    )
    .join('');

const customHTMLElementModels = {
  emoji: HTMLElementModel.fromCustomModel({
    tagName: 'emoji',
    contentModel: HTMLContentModel.mixed,
  }),
  'account-link': HTMLElementModel.fromCustomModel({
    tagName: 'account-link',
    contentModel: HTMLContentModel.mixed,
  }),
  'hashtag-link': HTMLElementModel.fromCustomModel({
    tagName: 'hashtag-link',
    contentModel: HTMLContentModel.mixed,
  }),
};

interface IEmoji {
  tnode: TNode;
}

const Emoji: React.FC<IEmoji> = ({ tnode }) => {
  const size = tnode.getNativeStyles().lineHeight;

  return (
    <Image
      source={{ uri: tnode.attributes.src }}
      accessibilityLabel={tnode.attributes.title}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  );
};

interface IPartialAccountLink {
  accountId: string;
}

const PartialAccountLink: React.FC<IPartialAccountLink> = ({ accountId }) => {
  const { data: account } = useAccount(accountId);

  if (!account) return null;

  return (
    <Link screen='accounts' params={{ screen: 'view', params: { id: accountId } }}>
      @{account?.username}
    </Link>
  );
};

interface IAccountLink {
  tnode: TNode;
}

const AccountLink: React.FC<IAccountLink> = ({ tnode }) => {
  const accountId = tnode.attributes['data-account-id'];
  const username = tnode.attributes['data-username'];

  if (!username) return <PartialAccountLink accountId={accountId} />;

  return (
    <Link screen='accounts' params={{ screen: 'view', params: { id: accountId } }}>
      @{username}
    </Link>
  );
};

interface IHashtagLink {
  tnode: TNode;
}

const HashtagLink: React.FC<IHashtagLink> = ({ tnode }) => {
  const tag = tnode.attributes['data-hashtag'];

  return (
    <Link screen='hashtags' params={{ tag }}>
      #{tag}
    </Link>
  );
};

interface IStyledHtml {
  html: string;
  emojis?: Array<CustomEmoji>;
  mentions?: Array<Mention>;
  sizeMultiplier?: number;
}

const StyledHtml: React.FC<IStyledHtml> = ({ html, emojis, mentions, sizeMultiplier = 1 }) => {
  const { colors, fonts } = useTheme();
  const { width } = useWindowDimensions();

  const {
    baseStyle,
    tagsStyles,
    classesStyles,
  }: {
    baseStyle: MixedStyleDeclaration;
    tagsStyles: Readonly<Record<string, MixedStyleDeclaration>>;
    classesStyles: Readonly<Record<string, MixedStyleDeclaration>>;
  } = useMemo(() => {
    const baseTypescale = multiplyFontSizes(fonts.bodyMedium, sizeMultiplier);

    return {
      baseStyle: {
        color: colors.onBackground,
        ...baseTypescale,
      },
      tagsStyles: {
        h1: {
          ...multiplyFontSizes(fonts.headlineLarge, sizeMultiplier),
          color: colors.onSurface,
          marginVertical: 12 * sizeMultiplier,
        },
        h2: {
          ...multiplyFontSizes(fonts.headlineMedium, sizeMultiplier),
          color: colors.onSurface,
          marginVertical: 10 * sizeMultiplier,
        },
        h3: {
          ...multiplyFontSizes(fonts.headlineSmall, sizeMultiplier),
          color: colors.onSurface,
          marginVertical: 8 * sizeMultiplier,
        },
        h4: {
          ...multiplyFontSizes(fonts.titleLarge, sizeMultiplier),
          color: colors.onSurface,
          marginVertical: 8 * sizeMultiplier,
        },
        h5: {
          ...multiplyFontSizes(fonts.titleMedium, sizeMultiplier),
          color: colors.onSurface,
          marginVertical: 6 * sizeMultiplier,
        },
        h6: {
          ...multiplyFontSizes(fonts.titleSmall, sizeMultiplier),
          color: colors.onSurface,
          marginVertical: 6 * sizeMultiplier,
        },
        p: { marginTop: 0, marginBottom: 12 * sizeMultiplier },
        a: { color: colors.primary, textDecorationLine: 'none' },
      },
      classesStyles: {
        'last-paragraph': { marginBottom: 0 },
      },
    };
  }, [colors, fonts, sizeMultiplier]);

  const domVisitors = useMemo((): DomVisitorCallbacks | undefined => {
    const emojiMap = makeEmojiMap(emojis || []);

    return {
      onElement: (element) => {
        if (element.tagName === 'p' && element.parent) {
          const children = element.parent.children.filter((element) => element.type === 'tag');

          if (element === children.at(-1)) {
            if (element.attribs.class) element.attribs.class += ' last-paragraph';
            else element.attribs.class = 'last-paragraph';
          }
        }

        if (element.tagName === 'a') {
          const classList = element.attribs.class?.split(' ') || [];

          if (mentions && classList.includes('mention')) {
            const mention = mentions.find(({ url }) => element.attribs.href === url);

            if (mention) {
              replaceElement(
                element,
                new Element('account-link', {
                  'data-account-id': mention.id,
                  'data-acct': mention.acct,
                  'data-username': mention.username,
                }),
              );
              return;
            }
          } else if (element.attribs['data-user']) {
            replaceElement(
              element,
              new Element('account-link', {
                'data-account-id': element.attribs['data-user'],
              }),
            );
            return;
          } else if (classList.includes('hashtag') || element.attribs.rel === 'tag') {
            const hashtag = nodesToText(element.children);
            if (hashtag) {
              replaceElement(
                element,
                new Element('hashtag-link', {
                  'data-hashtag': hashtag.replace(/^#/, ''),
                }),
              );
              return;
            }
          }
        }

        if (!emojis?.length) return;

        const textElements = element.children.filter((value): value is Text => isText(value));

        for (const textElement of textElements) {
          const nodes: Array<Text | Element> = [];
          let replaced = false;

          let text = '';
          let stack = '';
          let open = false;

          const clearStack = () => {
            if (stack.length) text += stack;
            open = false;
            stack = '';
          };

          for (const c of Array.from(textElement.data)) {
            if (c === ':') {
              if (!open) {
                clearStack();
              }

              stack += c;

              // we see another : we convert it and clear the stack buffer
              if (open) {
                const emoji = stack.length >= 3 ? emojiMap[stack] : undefined;

                if (emoji?.static_url) {
                  if (text.length) nodes.push(new Text(text));
                  text = '';
                  nodes.push(
                    new Element('emoji', {
                      src: emoji.static_url,
                      title: stack,
                    }),
                  );
                  replaced = true;
                } else {
                  text += stack;
                }
                stack = '';
              }

              open = !open;
            } else {
              stack += c;

              if (open && !validEmojiChar(c)) {
                clearStack();
              }
            }
          }

          if (!replaced) continue;

          if (stack.length) text += stack;
          if (text.length) nodes.push(new Text(text));
          text = '';

          for (const node of nodes) {
            prepend(textElement, node);
          }
          removeElement(textElement);
        }
      },
    };
  }, [emojis, mentions]);

  return (
    <RenderHtml
      contentWidth={width}
      source={{ html }}
      baseStyle={baseStyle}
      tagsStyles={tagsStyles}
      classesStyles={classesStyles}
      systemFonts={[...defaultSystemFonts, fonts.bodyMedium.fontFamily]}
      customHTMLElementModels={customHTMLElementModels}
      renderers={{
        hr: Divider,
        emoji: Emoji,
        'account-link': AccountLink,
        'hashtag-link': HashtagLink,
      }}
      domVisitors={domVisitors}
    />
  );
};

export { StyledHtml };
