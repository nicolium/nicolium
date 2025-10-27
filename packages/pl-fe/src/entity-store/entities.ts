import type { Account, Group, GroupMember, GroupRelationship } from 'pl-api';

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
