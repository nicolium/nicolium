import { Entities } from '@/entity-store/entities';
import { useEntities } from '@/entity-store/hooks/use-entities';
import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';

import { useGroupRelationships } from './use-group-relationships';

import type { Group } from 'pl-api';

const useGroups = () => {
  const client = useClient();
  const features = useFeatures();

  const { entities, ...result } = useEntities<Group, Group>(
    [Entities.GROUPS, 'search', ''],
    () => client.experimental.groups.getGroups(),
    { enabled: features.groups },
  );
  const { relationships } = useGroupRelationships(
    ['search', ''],
    entities.map(entity => entity.id),
  );

  const groups = entities.map((group) => ({
    ...group,
    relationship: relationships[group.id] || null,
  }));

  return {
    ...result,
    groups,
  };
};

export { useGroups };
