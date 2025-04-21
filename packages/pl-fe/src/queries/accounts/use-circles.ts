import { useMutation, useQuery } from '@tanstack/react-query';

import { useClient } from 'pl-fe/hooks/use-client';
import { useFeatures } from 'pl-fe/hooks/use-features';

import { queryClient } from '../client';

import type { Circle } from 'pl-api';

const useCircles = <T>(
  select?: ((data: Array<Circle>) => T),
) => {
  const client = useClient();
  const features = useFeatures();

  return useQuery({
    queryKey: ['circles'],
    queryFn: () => client.circles.fetchCircles(),
    enabled: features.circles,
    select,
  });
};

const useCircle = (circleId?: string) => useCircles((data) => circleId ? data.find(circle => circle.id === circleId) : undefined);

const useCreateCircle = () => {
  const client = useClient();

  return useMutation({
    mutationKey: ['circles', 'create'],
    mutationFn: (title: string) => client.circles.createCircle(title),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['circles'] }),
  });
};

const useDeleteCircle = () => {
  const client = useClient();

  return useMutation({
    mutationKey: ['circles', 'delete'],
    mutationFn: (circleId: string) => client.circles.deleteCircle(circleId),
    onSuccess: (_, deletedCircleId) => {
      queryClient.setQueryData<Array<Circle>>(
        ['circles'],
        (prevData) => prevData?.filter(({ id }) => id !== deletedCircleId),
      );
    },
  });
};

const useUpdateCircle = (circleId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['circles', 'update', circleId],
    mutationFn: (title: string) => client.circles.updateCircle(circleId, title),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['circles'] }),
  });
};

export { useCircles, useCircle, useCreateCircle, useDeleteCircle, useUpdateCircle };
