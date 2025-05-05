import type { GroupMember, GroupRelationship, Relationship } from 'pl-api';
import type { Account } from 'pl-fe/normalizers/account';
import type { Group } from 'pl-fe/normalizers/group';

enum Entities {
  ACCOUNTS = 'Accounts',
  GROUPS = 'Groups',
  GROUP_MEMBERSHIPS = 'GroupMemberships',
  GROUP_RELATIONSHIPS = 'GroupRelationships',
  RELATIONSHIPS = 'Relationships',
}

interface EntityTypes {
  [Entities.ACCOUNTS]: Account;
  [Entities.GROUPS]: Group;
  [Entities.GROUP_MEMBERSHIPS]: GroupMember;
  [Entities.GROUP_RELATIONSHIPS]: GroupRelationship;
  [Entities.RELATIONSHIPS]: Relationship;
}

export { Entities, type EntityTypes };
