import type { Group as BaseGroup } from 'pl-api';

const normalizeGroup = (group: BaseGroup) => {
  const missingAvatar = require('pl-fe/assets/images/avatar-missing.png');
  const missingHeader = require('pl-fe/assets/images/header-missing.png');

  return {
    ...group,
    avatar: group.avatar || group.avatar_static || missingAvatar,
    header: group.header || group.header_static || missingHeader,
  };
};

type Group = ReturnType<typeof normalizeGroup>;

export { normalizeGroup, type Group };
