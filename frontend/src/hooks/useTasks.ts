import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../api/tasks';

export const taskKeys = {
  all: ['tasks'] as const,
  list: () => [...taskKeys.all, 'list'] as const,
};

export function useTasks() {
  return useQuery({
    queryKey: taskKeys.list(),
    queryFn: tasksApi.list,
  });
}

export function useToggleTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.toggle(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.list() }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.list() }),
  });
}
