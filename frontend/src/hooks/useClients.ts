import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clientsApi } from '../api/clients';
import type { CreateClientDto, UpdateClientDto } from '../types/dto';

export const clientKeys = {
  all: ['clients'] as const,
  list: () => [...clientKeys.all, 'list'] as const,
  detail: (id: string) => [...clientKeys.all, 'detail', id] as const,
};

export function useClients() {
  return useQuery({
    queryKey: clientKeys.list(),
    queryFn: clientsApi.list,
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateClientDto) => clientsApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: clientKeys.list() }),
  });
}

export function useUpdateClient(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateClientDto) => clientsApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clientKeys.list() });
      qc.invalidateQueries({ queryKey: clientKeys.detail(id) });
    },
  });
}
