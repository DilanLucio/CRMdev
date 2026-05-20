using DevCRM.Domain.Entities;

namespace DevCRM.Domain.Interfaces;

public interface IProjectTaskRepository
{
    Task<IReadOnlyList<ProjectTask>> GetAllWithProjectAsync(CancellationToken ct = default);
    Task<ProjectTask?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(ProjectTask task, CancellationToken ct = default);
    void Update(ProjectTask task);
    void Delete(ProjectTask task);
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
