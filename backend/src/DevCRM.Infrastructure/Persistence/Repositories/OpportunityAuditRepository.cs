using DevCRM.Domain.Entities;
using DevCRM.Domain.Interfaces;

namespace DevCRM.Infrastructure.Persistence.Repositories;

public class OpportunityAuditRepository : IOpportunityAuditRepository
{
    private readonly DevCrmDbContext _ctx;
    public OpportunityAuditRepository(DevCrmDbContext ctx) => _ctx = ctx;

    public async Task AddAsync(OpportunityAuditLog log, CancellationToken ct = default)
        => await _ctx.OpportunityAuditLogs.AddAsync(log, ct);

    public Task<int> SaveChangesAsync(CancellationToken ct = default)
        => _ctx.SaveChangesAsync(ct);
}
