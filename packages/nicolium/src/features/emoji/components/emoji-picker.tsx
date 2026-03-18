import spritesheetURL from 'emoji-datasource/img/twitter/sheets/32.png';
import { Picker as EmojiPicker } from 'emoji-mart';
import React, { useRef, useEffect } from 'react';

import { joinPublicPath } from '@/utils/static';

import data from '../data';

const getSpritesheetURL = () => spritesheetURL;

const getImageURL = (set: string, name: string) => joinPublicPath(`/packs/emoji/${name}.svg`);

const Picker: React.FC<any> = (props) => {
  const ref = useRef(null);

  useEffect(() => {
    const input = { ...props, data, ref, autoFocus: true, getImageURL, getSpritesheetURL };

    new EmojiPicker(input);
  }, []);

  return <div ref={ref} />;
};

export { Picker as default };
