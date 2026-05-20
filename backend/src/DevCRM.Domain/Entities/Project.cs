namespace DevCRM.Domain.Entities;

public class Project
{
    public Guid Id { get; set; }
    public Guid ClientId { get; set; }
    public string Title { get; set; } = null!;
    public decimal Price { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? DriveLink { get; set; }
    public string? GitHubRepoUrl { get; set; }
    public string HostingProvider { get; set; } = null!;
    public string? ExternalDatabase { get; set; }
    public bool IsActive { get; set; }

    public Client Client { get; set; } = null!;
    public ICollection<ProjectTask> Tasks { get; set; } = new List<ProjectTask>();
}
