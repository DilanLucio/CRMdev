import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '../api/projects';

export function useReadme(projectId: string | undefined, hasRepo: boolean) {
  return useQuery({
    queryKey: ['projects', 'readme', projectId],
    queryFn: () => projectsApi.readme(projectId!),
    enabled: !!projectId && hasRepo,
    staleTime: 5 * 60 * 1000,
  });
}
