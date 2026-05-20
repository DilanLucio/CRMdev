using DevCRM.Domain.Entities;

namespace DevCRM.Domain.Interfaces;

public interface IProjectRepository
{
    Task<IReadOnlyList<Project>> GetAllActiveAsync(CancellationToken ct = default);
    Task<IReadOnlyList<Project>> GetAllInactiveAsync(CancellationToken ct = default);
    Task<Project?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Project?> GetByIdWithTasksAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(Project project, CancellationToken ct = default);
    void Update(Project project);
    void Delete(Project project);
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
