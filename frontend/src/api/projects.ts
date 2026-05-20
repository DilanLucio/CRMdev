import { api } from './client';
import type {
  CreateProjectDto,
  CreateTaskDto,
  ProjectDetailsDto,
  ProjectListItemDto,
  ReadmeResponse,
  TaskDto,
  UpdateProjectDto,
} from '../types/dto';

export const projectsApi = {
  list: async (): Promise<ProjectListItemDto[]> =>
    (await api.get<ProjectListItemDto[]>('/projects')).data,

  byId: async (id: string): Promise<ProjectDetailsDto> =>
    (await api.get<ProjectDetailsDto>(`/projects/${id}`)).data,

  create: async (dto: CreateProjectDto): Promise<ProjectDetailsDto> =>
    (await api.post<ProjectDetailsDto>('/projects', dto)).data,

  update: async (id: string, dto: UpdateProjectDto): Promise<ProjectDetailsDto> =>
    (await api.put<ProjectDetailsDto>(`/projects/${id}`, dto)).data,

  deactivate: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },

  addTask: async (projectId: string, dto: CreateTaskDto): Promise<TaskDto> =>
    (await api.post<TaskDto>(`/projects/${projectId}/tasks`, dto)).data,

  completeTask: async (taskId: string): Promise<TaskDto> =>
    (await api.patch<TaskDto>(`/tasks/${taskId}/complete`)).data,

  readme: async (id: string): Promise<ReadmeResponse> =>
    (await api.get<ReadmeResponse>(`/projects/${id}/readme`)).data,
};
