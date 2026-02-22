import type { Account } from 'pl-api';

enum Entities {
  ACCOUNTS = 'Accounts',
}

interface EntityTypes {
  [Entities.ACCOUNTS]: Account;
}

export { Entities, type EntityTypes };
