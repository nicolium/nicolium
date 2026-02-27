import { describe, expect, it } from 'vitest';

import { isDefaultAvatar, isDefaultHeader } from '@/utils/accounts';

describe('isDefaultHeader', () => {
  it('detects GoToSocial default header', () => {
    expect(isDefaultHeader('https://gts.mkljczk.pl/assets/default_header.webp')).toBe(true);
  });

  it('detects NeoDB default headers', () => {
    expect(isDefaultHeader('https://neodb.social/static/img/missing.5fa23ea9f65e.png')).toBe(true);
  });
});

describe('isDefaultAvatar', () => {
  it('detects GoToSocial default avatar', () => {
    expect(
      isDefaultAvatar('https://gts.mkljczk.pl/assets/default_avatars/GoToSocial_icon4.webp'),
    ).toBe(true);
  });

  it('returns false for non-default avatar', () => {
    expect(
      isDefaultAvatar(
        'https://example.com/fileserver/01Z0G3Q7MWJ7DKMFYA2DDZ9T32/attachment/original/01KGZ1PKJF1JJ4GVKRBB2F2QME.jpegavatar.jpg',
      ),
    ).toBe(false);
  });
});
