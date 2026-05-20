using DevCRM.Application.Opportunities.Dtos;
using DevCRM.Domain.Entities;

namespace DevCRM.Application.Opportunities.Services;

public interface IOpportunityService
{
    Task<OpportunityDto> IngestAsync(CreateOpportunityDto dto, CancellationToken ct = default);
    Task<IReadOnlyList<OpportunityDto>> GetAllAsync(OpportunityStatus? status = null, CancellationToken ct = default);
    Task<OpportunityDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<OpportunityDto> UpdateStatusAsync(Guid id, UpdateOpportunityStatusDto dto, CancellationToken ct = default);
}
