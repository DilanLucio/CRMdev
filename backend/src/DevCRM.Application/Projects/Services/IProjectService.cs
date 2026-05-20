using DevCRM.Application.Projects.Dtos;

namespace DevCRM.Application.Projects.Services;

public interface IProjectService
{
    Task<IReadOnlyList<ProjectListItemDto>> GetAllAsync(CancellationToken ct = default);
    Task<ProjectDetailsDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<ProjectDetailsDto> CreateAsync(CreateProjectDto dto, CancellationToken ct = default);
    Task<ProjectDetailsDto> UpdateAsync(Guid id, UpdateProjectDto dto, CancellationToken ct = default);
    Task DeactivateAsync(Guid id, CancellationToken ct = default);
}
