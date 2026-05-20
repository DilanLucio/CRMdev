using DevCRM.Application.Common;
using DevCRM.Application.Tasks.Dtos;
using DevCRM.Domain.Entities;
using DevCRM.Domain.Interfaces;

namespace DevCRM.Application.Tasks.Services;

public class TaskService : ITaskService
{
    private readonly IProjectTaskRepository _taskRepo;
    private readonly IProjectRepository _projectRepo;

    public TaskService(IProjectTaskRepository taskRepo, IProjectRepository projectRepo)
    {
        _taskRepo = taskRepo;
        _projectRepo = projectRepo;
    }

    public async Task<TaskDto> AddToProjectAsync(Guid projectId, CreateTaskDto dto, CancellationToken ct = default)
    {
        var project = await _projectRepo.GetByIdAsync(projectId, ct) ?? throw new NotFoundException(nameof(Project), projectId);

        var task = new ProjectTask
        {
            Id = Guid.NewGuid(),
            ProjectId = project.Id,
            Description = dto.Description,
            IsCompleted = false,
            CreatedAt = DateTime.UtcNow
        };
        await _taskRepo.AddAsync(task, ct);
        await _taskRepo.SaveChangesAsync(ct);
        return Map(task);
    }

    public async Task<IReadOnlyList<TaskListItemDto>> GetAllAsync(CancellationToken ct = default)
    {
        var tasks = await _taskRepo.GetAllWithProjectAsync(ct);
        return tasks.Select(t => new TaskListItemDto(
            t.Id, t.ProjectId,
            t.Project.Title, t.Project.Client.Name,
            t.Description, t.IsCompleted, t.CreatedAt
        )).ToList();
    }

    public async Task<TaskDto> CompleteAsync(Guid taskId, CancellationToken ct = default)
    {
        var task = await _taskRepo.GetByIdAsync(taskId, ct) ?? throw new NotFoundException(nameof(ProjectTask), taskId);
        task.IsCompleted = true;
        _taskRepo.Update(task);
        await _taskRepo.SaveChangesAsync(ct);
        return Map(task);
    }

    public async Task<TaskDto> ToggleAsync(Guid taskId, CancellationToken ct = default)
    {
        var task = await _taskRepo.GetByIdAsync(taskId, ct) ?? throw new NotFoundException(nameof(ProjectTask), taskId);
        task.IsCompleted = !task.IsCompleted;
        _taskRepo.Update(task);
        await _taskRepo.SaveChangesAsync(ct);
        return Map(task);
    }

    public async Task DeleteAsync(Guid taskId, CancellationToken ct = default)
    {
        var task = await _taskRepo.GetByIdAsync(taskId, ct) ?? throw new NotFoundException(nameof(ProjectTask), taskId);
        _taskRepo.Delete(task);
        await _taskRepo.SaveChangesAsync(ct);
    }

    private static TaskDto Map(ProjectTask t) => new(t.Id, t.ProjectId, t.Description, t.IsCompleted, t.CreatedAt);
}
