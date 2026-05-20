using DevCRM.Domain.Entities;
using DevCRM.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DevCRM.Infrastructure.Persistence.Repositories;

public class ProjectTaskRepository : IProjectTaskRepository
{
    private readonly DevCrmDbContext _db;
    public ProjectTaskRepository(DevCrmDbContext db) => _db = db;

    public Task<ProjectTask?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        _db.ProjectTasks.FirstOrDefaultAsync(t => t.Id == id, ct);

    public async Task AddAsync(ProjectTask task, CancellationToken ct = default) =>
        await _db.ProjectTasks.AddAsync(task, ct);

    public void Update(ProjectTask task) => _db.ProjectTasks.Update(task);

    public Task<int> SaveChangesAsync(CancellationToken ct = default) => _db.SaveChangesAsync(ct);
}
