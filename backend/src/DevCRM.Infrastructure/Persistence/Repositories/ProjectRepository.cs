using DevCRM.Domain.Entities;
using DevCRM.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DevCRM.Infrastructure.Persistence.Repositories;

public class ProjectRepository : IProjectRepository
{
    private readonly DevCrmDbContext _db;
    public ProjectRepository(DevCrmDbContext db) => _db = db;

    public async Task<IReadOnlyList<Project>> GetAllActiveAsync(CancellationToken ct = default) =>
        await _db.Projects
            .AsNoTracking()
            .Include(p => p.Client)
            .Include(p => p.Tasks)
            .Where(p => p.IsActive)
            .OrderBy(p => p.EndDate)
            .ToListAsync(ct);

    public Task<Project?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        _db.Projects.FirstOrDefaultAsync(p => p.Id == id, ct);

    public Task<Project?> GetByIdWithTasksAsync(Guid id, CancellationToken ct = default) =>
        _db.Projects
            .Include(p => p.Client)
            .Include(p => p.Tasks)
            .FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task AddAsync(Project project, CancellationToken ct = default) =>
        await _db.Projects.AddAsync(project, ct);

    public void Update(Project project) => _db.Projects.Update(project);

    public Task<int> SaveChangesAsync(CancellationToken ct = default) => _db.SaveChangesAsync(ct);
}
