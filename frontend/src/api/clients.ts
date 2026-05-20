import { api } from './client';
import type { ClientDto, CreateClientDto } from '../types/dto';

export const clientsApi = {
  list: async (): Promise<ClientDto[]> =>
    (await api.get<ClientDto[]>('/clients')).data,

  create: async (dto: CreateClientDto): Promise<ClientDto> =>
    (await api.post<ClientDto>('/clients', dto)).data,
};
