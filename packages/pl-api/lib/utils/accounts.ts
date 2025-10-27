/** Default header filenames from various backends */
const DEFAULT_HEADERS: string[] = [
  '/assets/default_header.webp', // GoToSocial
  '/headers/original/missing.png', // Mastodon
  '/api/v1/accounts/identicon', // Mitra
  '/images/banner.png', // Pleroma
  '/assets/transparent.png', // Iceshrimp.net
];

/** Check if the avatar is a default avatar */
const isDefaultHeader = (url: string = '') =>  url === '' || DEFAULT_HEADERS.some(header => url.endsWith(header));

/** Default avatar filenames from various backends */
const DEFAULT_AVATARS = [
  ...([1, 2, 3, 4, 5, 6].map(i => `/assets/default_avatars/GoToSocial_icon${i}.webp`)), // GoToSocial
  '/avatars/original/missing.png', // Mastodon
  '/api/v1/accounts/identicon', // Mitra
  '/images/avi.png', // Pleroma
];

/** Check if the avatar is a default avatar */
const isDefaultAvatar = (url: string = '') => url === '' || DEFAULT_AVATARS.some(avatar => url.endsWith(avatar));

export {
  isDefaultHeader,
  isDefaultAvatar,
};
