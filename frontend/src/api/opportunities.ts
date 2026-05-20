import { api } from './client';
import type { OpportunityDto, OpportunityStatusValue, UpdateOpportunityStatusDto } from '../types/dto';

export const opportunitiesApi = {
  list: async (status?: OpportunityStatusValue): Promise<OpportunityDto[]> =>
    (await api.get<OpportunityDto[]>('/opportunities', { params: status !== undefined ? { status } : undefined })).data,

  byId: async (id: string): Promise<OpportunityDto> =>
    (await api.get<OpportunityDto>(`/opportunities/${id}`)).data,

  updateStatus: async (id: string, dto: UpdateOpportunityStatusDto): Promise<OpportunityDto> =>
    (await api.put<OpportunityDto>(`/opportunities/${id}/status`, dto)).data,
};
