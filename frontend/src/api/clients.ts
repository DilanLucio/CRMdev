import { api } from './client';
import type { ClientDto, CreateClientDto, UpdateClientDto } from '../types/dto';

export const clientsApi = {
  list: async (): Promise<ClientDto[]> =>
    (await api.get<ClientDto[]>('/clients')).data,

  byId: async (id: string): Promise<ClientDto> =>
    (await api.get<ClientDto>(`/clients/${id}`)).data,

  create: async (dto: CreateClientDto): Promise<ClientDto> =>
    (await api.post<ClientDto>('/clients', dto)).data,

  update: async (id: string, dto: UpdateClientDto): Promise<ClientDto> =>
    (await api.put<ClientDto>(`/clients/${id}`, dto)).data,
};
