import { useQuery } from '@tanstack/react-query';
import { clientsApi } from '../api/clients';

export const clientKeys = {
  all: ['clients'] as const,
  list: () => [...clientKeys.all, 'list'] as const,
};

export function useClients() {
  return useQuery({
    queryKey: clientKeys.list(),
    queryFn: clientsApi.list,
  });
}
