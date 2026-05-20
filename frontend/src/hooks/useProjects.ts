import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../api/projects';
import type { CreateProjectDto, CreateTaskDto, UpdateProjectDto } from '../types/dto';

export const projectKeys = {
  all: ['projects'] as const,
  list: () => [...projectKeys.all, 'list'] as const,
  inactive: () => [...projectKeys.all, 'inactive'] as const,
  detail: (id: string) => [...projectKeys.all, 'detail', id] as const,
};

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.list(),
    queryFn: projectsApi.list,
  });
}

export function useInactiveProjects() {
  return useQuery({
    queryKey: projectKeys.inactive(),
    queryFn: projectsApi.listInactive,
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: projectKeys.detail(id ?? ''),
    queryFn: () => projectsApi.byId(id!),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateProjectDto) => projectsApi.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.list() });
      qc.invalidateQueries({ queryKey: projectKeys.inactive() });
    },
  });
}

export function useUpdateProject(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateProjectDto) => projectsApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.detail(id) });
      qc.invalidateQueries({ queryKey: projectKeys.list() });
      qc.invalidateQueries({ queryKey: projectKeys.inactive() });
    },
  });
}

export function useDeactivateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.deactivate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.list() });
      qc.invalidateQueries({ queryKey: projectKeys.inactive() });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.deletePermanent(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.list() });
      qc.invalidateQueries({ queryKey: projectKeys.inactive() });
    },
  });
}

export function useDeleteProjectWithClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.deleteWithClient(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.list() });
      qc.invalidateQueries({ queryKey: projectKeys.inactive() });
    },
  });
}

export function useAddTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTaskDto) => projectsApi.addTask(projectId, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.detail(projectId) }),
  });
}

export function useCompleteTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => projectsApi.completeTask(taskId),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.detail(projectId) }),
  });
}
