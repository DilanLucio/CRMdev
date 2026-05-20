namespace DevCRM.Application.Tasks.Dtos;

public record TaskDto(Guid Id, Guid ProjectId, string Description, bool IsCompleted, DateTime CreatedAt);

public record TaskListItemDto(
    Guid Id,
    Guid ProjectId,
    string ProjectTitle,
    string ClientName,
    string Description,
    bool IsCompleted,
    DateTime CreatedAt
);

public record CreateTaskDto(string Description);
