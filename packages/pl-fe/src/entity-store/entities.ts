import type { GroupMember, GroupRelationship, Group } from 'pl-api';
import type { Account } from 'pl-fe/normalizers/account';

enum Entities {
  ACCOUNTS = 'Accounts',
  GROUPS = 'Groups',
  GROUP_MEMBERSHIPS = 'GroupMemberships',
  GROUP_RELATIONSHIPS = 'GroupRelationships',
}

interface EntityTypes {
  [Entities.ACCOUNTS]: Account;
  [Entities.GROUPS]: Group;
  [Entities.GROUP_MEMBERSHIPS]: GroupMember;
  [Entities.GROUP_RELATIONSHIPS]: GroupRelationship;
}

export { Entities, type EntityTypes };
