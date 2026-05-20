import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { opportunitiesApi } from '../api/opportunities';
import type { OpportunityStatusValue, UpdateOpportunityStatusDto } from '../types/dto';

export const opportunityKeys = {
  all: ['opportunities'] as const,
  list: (status?: OpportunityStatusValue) => [...opportunityKeys.all, 'list', status] as const,
  detail: (id: string) => [...opportunityKeys.all, 'detail', id] as const,
};

export function useOpportunities(status?: OpportunityStatusValue) {
  return useQuery({
    queryKey: opportunityKeys.list(status),
    queryFn: () => opportunitiesApi.list(status),
  });
}

export function useOpportunity(id: string) {
  return useQuery({
    queryKey: opportunityKeys.detail(id),
    queryFn: () => opportunitiesApi.byId(id),
    enabled: Boolean(id),
  });
}

export function useUpdateOpportunityStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateOpportunityStatusDto) => opportunitiesApi.updateStatus(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: opportunityKeys.all });
    },
  });
}
