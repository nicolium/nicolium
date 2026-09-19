// Adapted from Pluraldawn by Exa Skye, licensed under AGPLv3
// https://exa.y2k.diy/garden/pluraldawn/

import { decode as decodePng, toRGBA8 } from '@cantoo/upng';
import { decompressSync } from 'fflate';

const FONT_STYLE_NAMES = ['normal', 'smallcaps', 'small', 'monospace'];

const UNPROXIED_AVATARS: Array<{ test: RegExp; rewrite: (proxied: RegExpExecArray) => string }> = [
  {
    test: /^(https:\/\/[^/]+\/proxy\/avatar\.)webp(\?url=https%3A%2F%2F.*)&avatar=1$/,
    rewrite: (proxied) => `${proxied[1]}png${proxied[2]}`,
  },
  {
    test: /^(https:\/\/[^/]+\/.*)\/attachment\/small\/(.*)\.(webp|jpe?g)$/,
    rewrite: (proxied) => `${proxied[1]}/attachment/original/${proxied[2]}.png`,
  },
  {
    test: /^(https?:\/\/[^/]+\/api\/v2\/cache\/avatar\/[^?#/]+)(?:[?#].*)?$/,
    rewrite: (proxied) => `${proxied[1]}?format=original`,
  },
];

const decode = (
  buffer: Uint8Array<ArrayBuffer>,
  useNewPixelFormat: boolean,
  magic: string,
  nulTerminated: boolean,
) => {
  let j = 0;
  let valid = false;
  for (let i = buffer.length - 1; i >= 0; i -= 4) {
    const r = buffer[i - 3];
    const g = buffer[i - 2];
    const b = buffer[i - 1];
    let byte;
    if (useNewPixelFormat) {
      byte = ((r & 7) << 5) | ((g & 3) << 3) | (b & 7);
    } else {
      byte = ((r & 3) << 6) | ((g & 7) << 3) | (b & 7);
    }
    if (nulTerminated && byte === 0) break;
    buffer[j] = byte;
    if (j === magic.length) {
      valid = true;
      for (let k = 0; k < magic.length; k++) {
        if (buffer[k] !== magic.charCodeAt(k)) {
          valid = false;
          break;
        }
      }
      if (!valid) break;
    }
    j++;
  }
  return valid ? j : -1;
};

const readGroup = (
  cursor: {
    buf: Uint8Array<ArrayBufferLike>;
    i: number;
  },
  prefixes?: Array<string>,
) => {
  if (cursor.buf[cursor.i] === 0x04) return null;
  const td = new TextDecoder();
  const out = [];
  let buf = [];
  let pfx = null;
  while (true) {
    const b = cursor.buf[cursor.i++];
    if (b === 0x1e || b === 0x1d) {
      let str = td.decode(new Uint8Array(buf));
      if (pfx) str = pfx + str;
      const spl = str.split('\u001F');
      if (spl.length === 1) {
        out.push(spl[0]);
      } else {
        out.push(spl);
      }
      buf = [];
      if (b === 0x1d) break;
    } else if (buf.length === 0 && b === 0x10) {
      if (!prefixes) throw new Error("Can't decode data link escape in this group type.");
      const i = cursor.buf[cursor.i++];
      pfx = prefixes[i];
    } else {
      buf.push(b);
    }
  }
  return out;
};

const decodePlDw2 = (buffer: Uint8Array<ArrayBuffer>) => {
  const len = decode(buffer, true, 'PlDw2', false);
  if (len <= 0) return null;

  const decomp = decompressSync(buffer.slice(5, len));
  const cur = { buf: decomp, i: 0 };

  const ids = readGroup(cur);
  const names = readGroup(cur);
  const indicators = readGroup(cur);
  const fonts = readGroup(cur, FONT_STYLE_NAMES);

  const members: Array<{ id: string; name: string; emoji: string; font: string }> = [];

  if (!ids || !names || !indicators) return { members };

  for (let i = 0; i < ids.length; i++) {
    members.push({
      id: ids[i] as string,
      name: names[i] as string,
      emoji: indicators[i] as string,
      font: fonts ? (fonts[i] as string) : 'normal',
    });
  }
  return { members };
};

const decodePlDon = (buffer: Uint8Array<ArrayBuffer>) => {
  const td = new TextDecoder();
  const len = decode(buffer, false, 'PlDon', true);
  if (len > 0) return JSON.parse(td.decode(buffer.slice(5, len)));
  return null;
};

const getRGBA8Buffer = async (blob: Blob): Promise<Uint8Array<ArrayBuffer>> => {
  const mime = blob.type;

  if (mime === 'image/png') {
    const img = decodePng(await blob.arrayBuffer());
    const rgba = toRGBA8(img);
    return new Uint8Array(rgba[0]);
  }

  if (typeof ImageDecoder !== 'undefined') {
    if (!mime.startsWith('image/')) {
      throw new Error(`Invalid mimetype ${mime}`);
    }
    const idec = new ImageDecoder({ data: blob.stream(), type: mime });
    const { image } = await idec.decode();
    const buffer = new Uint8Array(image.allocationSize({ format: 'RGBA' }));
    await image.copyTo(buffer, { format: 'RGBA' });
    return buffer;
  }

  const bm = await createImageBitmap(blob);
  const c = new OffscreenCanvas(bm.width, bm.height);
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error("shouldn't happen lol");
  ctx.drawImage(bm, 0, 0);
  const id = ctx.getImageData(0, 0, bm.width, bm.height, {
    pixelFormat: 'rgba-unorm8',
  });
  return id.data as unknown as Uint8Array<ArrayBuffer>;
};

const unproxyAvatars = (avurl: string) => {
  for (const { test, rewrite } of UNPROXIED_AVATARS) {
    const m = test.exec(avurl);
    if (m) {
      const rewritten = rewrite(m);
      return rewritten;
    }
  }
  return avurl;
};

const decodeSystemFromAvatar = async (avatarUrl: string) => {
  try {
    if (avatarUrl.startsWith('data:')) return [];

    const rewritten = unproxyAvatars(avatarUrl);

    let blob;
    blob = await fetch(rewritten, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
    }).then((res) => res.blob());

    let buffer;
    buffer = await getRGBA8Buffer(blob);

    let json: {
      members: Array<{
        id: string;
        emoji: string;
        name: string;
      }>;
    } | null = null;
    try {
      json = decodePlDw2(buffer);
    } catch (e) {}
    if (!json) {
      json = decodePlDon(buffer);
    }

    return json?.members?.filter((m) => m.id && m.emoji && m.name) || [];
  } catch (e) {
    return [];
  }
};

type PluraldawnSystem = Awaited<ReturnType<typeof decodeSystemFromAvatar>>;

export { decodeSystemFromAvatar, type PluraldawnSystem };
