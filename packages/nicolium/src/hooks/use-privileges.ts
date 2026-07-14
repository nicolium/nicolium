import { useOwnAccount } from '@/hooks/use-own-account';

type Privilege =
  | 'announcements_manage_announcements'
  | 'emoji_manage_emoji'
  | 'instances_delete'
  | 'messages_delete'
  | 'messages_read'
  | 'moderation_log_read'
  | 'reports_manage_reports'
  | 'statistics_read'
  | 'users_delete'
  | 'users_manage_activation_state'
  | 'users_manage_credentials'
  | 'users_manage_invites'
  | 'users_manage_tags'
  | 'users_read';

const usePrivileges = () => {
  const { data: account } = useOwnAccount();
  const privileges = account?.privileges;

  return {
    privileges,
    hasPrivilege: (privilege: Privilege) => !privileges || privileges.includes(privilege),
  };
};

export { usePrivileges, type Privilege };
