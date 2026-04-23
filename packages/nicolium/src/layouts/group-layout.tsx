import iconEyeSlash from '@phosphor-icons/core/regular/eye-slash.svg';
import { Outlet, useLocation } from '@tanstack/react-router';
import React, { useMemo } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import GroupHeader from '@/components/groups/group-header';
import { AsideContent } from '@/components/navigation/aside-content';
import Column from '@/components/ui/column';
import Icon from '@/components/ui/icon';
import Layout from '@/components/ui/layout';
import Tabs, { type Item } from '@/components/ui/tabs';
import Text from '@/components/ui/text';
import { useGroupQuery } from '@/queries/groups/use-group';
import { useGroupMembershipRequestsQuery } from '@/queries/groups/use-group-members';
import { layouts } from '@/router';

const messages = defineMessages({
  all: { id: 'group.tabs.all', defaultMessage: 'All' },
  members: { id: 'group.tabs.members', defaultMessage: 'Members' },
  media: { id: 'group.tabs.media', defaultMessage: 'Media' },
});

const PrivacyBlankslate = () => (
  <div className='flex flex-col items-center gap-4 py-10'>
    <div className='rounded-full bg-gray-200 p-3 dark:bg-gray-800'>
      <Icon src={iconEyeSlash} className='size-6 text-gray-600 dark:text-gray-600' />
    </div>

    <Text theme='muted'>
      <FormattedMessage
        id='group.private.message'
        defaultMessage='Content is only visible to group members'
      />
    </Text>
  </div>
);

/** Layout to display a group. */
const GroupLayout = () => {
  const { groupId } = layouts.group.useParams();

  const intl = useIntl();
  const location = useLocation();

  const { data: group } = useGroupQuery(groupId, true);
  const { data: membershipRequests = [] } = useGroupMembershipRequestsQuery(groupId);

  const isMember = !!group?.relationship?.member;
  const isPrivate = group?.locked;

  const tabItems = useMemo(() => {
    const items: Array<Item> = [
      {
        text: intl.formatMessage(messages.all),
        to: '/groups/$groupId',
        params: { groupId },
        name: '/groups/$groupId',
      },
    ];

    items.push(
      {
        text: intl.formatMessage(messages.media),
        to: '/groups/$groupId/media',
        params: { groupId },
        name: '/groups/$groupId/media',
      },
      {
        text: intl.formatMessage(messages.members),
        to: '/groups/$groupId/members',
        params: { groupId },
        name: '/groups/$groupId/members',
        count: membershipRequests.length,
      },
    );

    return items;
  }, [membershipRequests.length, groupId]);

  const renderChildren = () => {
    if (!isMember && isPrivate) {
      return <PrivacyBlankslate />;
    } else {
      return <Outlet />;
    }
  };

  return (
    <>
      <Layout.Main>
        <Column size='lg' label={group ? group.display_name : ''} withHeader={false}>
          <GroupHeader key={`group-header-${groupId}`} group={group} />

          <Tabs key={`group-tabs-${groupId}`} items={tabItems} activeItem={location.pathname} />

          {renderChildren()}
        </Column>
      </Layout.Main>

      <Layout.Aside>
        <AsideContent layout='group' group={group} />
      </Layout.Aside>
    </>
  );
};

export { GroupLayout as default };
