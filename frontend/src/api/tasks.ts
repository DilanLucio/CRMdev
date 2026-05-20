import { api } from './client';
import type { TaskDto, TaskListItemDto } from '../types/dto';

export const tasksApi = {
  list: async (): Promise<TaskListItemDto[]> =>
    (await api.get<TaskListItemDto[]>('/tasks')).data,

  toggle: async (id: string): Promise<TaskDto> =>
    (await api.patch<TaskDto>(`/tasks/${id}/toggle`)).data,

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};
