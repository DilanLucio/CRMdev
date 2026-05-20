namespace DevCRM.Domain.Entities;

public class Client
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string ContactNumber { get; set; } = null!;
    public string? Email { get; set; }
    public DateTime CreatedAt { get; set; }

    public ICollection<Project> Projects { get; set; } = new List<Project>();
}
