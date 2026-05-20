using DevCRM.Application.Tasks.Dtos;

namespace DevCRM.Application.Tasks.Services;

public interface ITaskService
{
    Task<IReadOnlyList<TaskListItemDto>> GetAllAsync(CancellationToken ct = default);
    Task<TaskDto> AddToProjectAsync(Guid projectId, CreateTaskDto dto, CancellationToken ct = default);
    Task<TaskDto> CompleteAsync(Guid taskId, CancellationToken ct = default);
    Task<TaskDto> ToggleAsync(Guid taskId, CancellationToken ct = default);
    Task DeleteAsync(Guid taskId, CancellationToken ct = default);
}
