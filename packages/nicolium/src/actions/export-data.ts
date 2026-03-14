import { defineMessages } from 'react-intl';

import toast from '@/toast';

import type { Account, PaginatedResponse, PlApiClient } from 'pl-api';

const messages = defineMessages({
  blocksSuccess: {
    id: 'export_data.success.blocks',
    defaultMessage: 'Blocks exported successfully',
  },
  followersSuccess: {
    id: 'export_data.success.followers',
    defaultMessage: 'Followers exported successfully',
  },
  mutesSuccess: { id: 'export_data.success.mutes', defaultMessage: 'Mutes exported successfully' },
});

const fileExport = (content: string, fileName: string) => {
  const fileToDownload = document.createElement('a');

  fileToDownload.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(content));
  fileToDownload.setAttribute('download', fileName);
  fileToDownload.style.display = 'none';
  document.body.appendChild(fileToDownload);
  fileToDownload.click();
  document.body.removeChild(fileToDownload);
};

const listAccounts = async (response: PaginatedResponse<Account>) => {
  const followings = response.items;
  let accounts = [];
  while (response.next) {
    response = await response.next();
    Array.prototype.push.apply(followings, response.items);
  }

  accounts = followings.map((account) => account.fqn);
  return Array.from(new Set(accounts));
};

const exportFollows = async (client: PlApiClient) => {
  const response = await client.accounts.getAccountFollowing(me, { limit: 40 });
  const followings = await listAccounts(response);
  const followingsCsv = followings.map((fqn) => fqn + ',true');
  followingsCsv.unshift('Account address,Show boosts');
  fileExport(followingsCsv.join('\n'), 'export_followings.csv');

  toast.success(messages.followersSuccess);
};

const exportBlocks = async (client: PlApiClient) => {
  const response = await client.filtering.getBlocks({ limit: 40 });
  const blocks = await listAccounts(response);
  fileExport(blocks.join('\n'), 'export_block.csv');

  toast.success(messages.blocksSuccess);
};

const exportMutes = async (client: PlApiClient) => {
  const response = await client.filtering.getMutes({ limit: 40 });
  const mutes = await listAccounts(response);
  fileExport(mutes.join('\n'), 'export_mutes.csv');

  toast.success(messages.mutesSuccess);
};

export { exportFollows, exportBlocks, exportMutes };
