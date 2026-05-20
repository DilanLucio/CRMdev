using DevCRM.Domain.Entities;

namespace DevCRM.Domain.Interfaces;

public interface IOpportunityRepository
{
    Task AddAsync(Opportunity opportunity, CancellationToken ct = default);
    Task<Opportunity?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<Opportunity>> GetAllAsync(OpportunityStatus? status = null, CancellationToken ct = default);
    Task<Opportunity?> GetByExternalLeadIdAsync(string externalLeadId, CancellationToken ct = default);
    void Update(Opportunity opportunity);
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
