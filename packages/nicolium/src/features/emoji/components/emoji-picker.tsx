import spritesheetURL from 'emoji-datasource/img/twitter/sheets/32.png';
import { Picker as EmojiPicker } from 'emoji-mart';
import React, { useRef, useEffect } from 'react';

import { joinPublicPath } from '@/utils/static';

import data from '../data';

import pickerStyles from './styles.scss?inline';

const getSpritesheetURL = () => spritesheetURL;

const getImageURL = (set: string, name: string) => joinPublicPath(`/packs/emoji/${name}.svg`);

const Picker: React.FC<any> = (props) => {
  const ref = useRef(null);

  useEffect(() => {
    const input = { ...props, data, ref, autoFocus: true, getImageURL, getSpritesheetURL };

    const emojiPicker = new EmojiPicker(input);

    const sheet = new CSSStyleSheet();
    sheet.replaceSync(pickerStyles);
    (emojiPicker as any as HTMLElement).shadowRoot!.adoptedStyleSheets = [sheet];
  }, []);

  return <div ref={ref} />;
};

export { Picker as default };
