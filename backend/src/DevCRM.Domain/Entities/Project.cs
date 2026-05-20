namespace DevCRM.Domain.Entities;

public enum ProjectType
{
    LandingPage = 0,
    ErpCrm = 1,
    Servicios = 2
}

public enum PricingModel
{
    OneTime = 0,
    Monthly = 1,
    Subscription = 2
}

public class Project
{
    public Guid Id { get; set; }
    public Guid ClientId { get; set; }
    public string Title { get; set; } = null!;
    public ProjectType Type { get; set; }
    public string? Services { get; set; }
    public decimal Price { get; set; }
    public PricingModel PricingModel { get; set; }
    public DateTime? NextPaymentDate { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? DriveLink { get; set; }
    public string? GitHubRepoUrl { get; set; }
    public string? HostingProvider { get; set; }
    public string? ExternalDatabase { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; }

    public Client Client { get; set; } = null!;
    public ICollection<ProjectTask> Tasks { get; set; } = new List<ProjectTask>();
}
