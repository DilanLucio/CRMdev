using DevCRM.Application.Tasks.Dtos;

namespace DevCRM.Application.Tasks.Services;

public interface ITaskService
{
    Task<TaskDto> AddToProjectAsync(Guid projectId, CreateTaskDto dto, CancellationToken ct = default);
    Task<TaskDto> CompleteAsync(Guid taskId, CancellationToken ct = default);
}
