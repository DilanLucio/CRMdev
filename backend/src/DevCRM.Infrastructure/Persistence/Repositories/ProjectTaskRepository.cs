using DevCRM.Domain.Entities;
using DevCRM.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DevCRM.Infrastructure.Persistence.Repositories;

public class ProjectTaskRepository : IProjectTaskRepository
{
    private readonly DevCrmDbContext _db;
    public ProjectTaskRepository(DevCrmDbContext db) => _db = db;

    public async Task<IReadOnlyList<ProjectTask>> GetAllWithProjectAsync(CancellationToken ct = default) =>
        await _db.ProjectTasks
            .AsNoTracking()
            .Include(t => t.Project).ThenInclude(p => p.Client)
            .OrderBy(t => t.IsCompleted)
            .ThenByDescending(t => t.CreatedAt)
            .ToListAsync(ct);

    public Task<ProjectTask?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        _db.ProjectTasks.FirstOrDefaultAsync(t => t.Id == id, ct);

    public async Task AddAsync(ProjectTask task, CancellationToken ct = default) =>
        await _db.ProjectTasks.AddAsync(task, ct);

    public void Update(ProjectTask task) => _db.ProjectTasks.Update(task);

    public void Delete(ProjectTask task) => _db.ProjectTasks.Remove(task);

    public Task<int> SaveChangesAsync(CancellationToken ct = default) => _db.SaveChangesAsync(ct);
}
