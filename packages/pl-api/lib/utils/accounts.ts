/** Default header filenames from various backends */
const DEFAULT_HEADERS: Array<string | RegExp> = [
  '/assets/default_header.webp', // GoToSocial
  '/headers/original/missing.png', // Hollo, Mastodon
  '/api/v1/accounts/identicon', // Mitra
  /\/static\/img\/missing\.[a-z0-9]+\.png$/, // NeoDB
  '/storage/headers/missing.png', // Pixelfed
  '/images/banner.png', // Pleroma
  '/assets/transparent.png', // Iceshrimp.net
];

/** Check if the avatar is a default avatar */
const isDefaultHeader = (url: string = '') =>
  url === '' ||
  DEFAULT_HEADERS.some((header) =>
    typeof header === 'string' ? url.endsWith(header) : header.test(url),
  );

/** Default avatar filenames from various backends */
const DEFAULT_AVATARS: Array<string | RegExp> = [
  /\/assets\/default_avatars\/GoToSocial_icon[1-6]\.webp$/, // GoToSocial
  '/avatars/original/missing.png', // Hollo, Mastodon
  '/api/v1/accounts/identicon', // Mitra
  '/s/img/avatar.svg', // NeoDB
  '/avatars/default.jpg', // Pixelfed
  '/images/avi.png', // Pleroma
];

/** Check if the avatar is a default avatar */
const isDefaultAvatar = (url: string = '') =>
  url === '' ||
  DEFAULT_AVATARS.some((avatar) =>
    typeof avatar === 'string' ? url.endsWith(avatar) : avatar.test(url),
  );

export { isDefaultHeader, isDefaultAvatar };
