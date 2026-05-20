namespace DevCRM.Domain.Entities;

public class ProjectTask
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string Description { get; set; } = null!;
    public bool IsCompleted { get; set; }
    public DateTime CreatedAt { get; set; }

    public Project Project { get; set; } = null!;
}
