using DevCRM.Domain.Entities;
using DevCRM.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DevCRM.Infrastructure.Persistence.Repositories;

public class OpportunityRepository : IOpportunityRepository
{
    private readonly DevCrmDbContext _db;
    public OpportunityRepository(DevCrmDbContext db) => _db = db;

    public async Task AddAsync(Opportunity opportunity, CancellationToken ct = default) =>
        await _db.Opportunities.AddAsync(opportunity, ct);

    public Task<Opportunity?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        _db.Opportunities.FirstOrDefaultAsync(o => o.Id == id, ct);

    public async Task<IReadOnlyList<Opportunity>> GetAllAsync(OpportunityStatus? status = null, CancellationToken ct = default)
    {
        var query = _db.Opportunities.AsNoTracking();
        if (status.HasValue)
            query = query.Where(o => o.Status == status.Value);
        return await query.OrderByDescending(o => o.CreatedAt).ToListAsync(ct);
    }

    public Task<Opportunity?> GetByExternalLeadIdAsync(string externalLeadId, CancellationToken ct = default) =>
        _db.Opportunities.FirstOrDefaultAsync(o => o.ExternalLeadId == externalLeadId, ct);

    public void Update(Opportunity opportunity) => _db.Opportunities.Update(opportunity);

    public Task<int> SaveChangesAsync(CancellationToken ct = default) => _db.SaveChangesAsync(ct);
}
