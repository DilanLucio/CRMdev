using DevCRM.Domain.Entities;

namespace DevCRM.Domain.Interfaces;

public interface IOpportunityAuditRepository
{
    Task AddAsync(OpportunityAuditLog log, CancellationToken ct = default);
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
