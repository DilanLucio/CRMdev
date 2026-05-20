using DevCRM.Application.Tasks.Dtos;
using DevCRM.Domain.Entities;

namespace DevCRM.Application.Projects.Dtos;

public class ProjectListItemDto
{
    public Guid Id { get; init; }
    public string Title { get; init; } = null!;
    public ProjectType Type { get; init; }
    public string ClientName { get; init; } = null!;
    public decimal Price { get; init; }
    public PricingModel PricingModel { get; init; }
    public DateTime? NextPaymentDate { get; init; }
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public string? HostingProvider { get; init; }
    public bool IsActive { get; init; }
    public DateTime WarrantyEndDate => EndDate.AddMonths(3);
    public DateTime HostingRenewalDate => EndDate.AddYears(1);
    public int DaysLeftForWarranty => (int)(WarrantyEndDate - DateTime.UtcNow).TotalDays;
    public int DaysUntilHostingRenewal => (int)(HostingRenewalDate - DateTime.UtcNow).TotalDays;
    public bool HasPendingTasks { get; init; }
}

public class ProjectDetailsDto
{
    public Guid Id { get; init; }
    public string Title { get; init; } = null!;
    public ProjectType Type { get; init; }
    public List<string> Services { get; init; } = new();
    public Guid ClientId { get; init; }
    public string ClientName { get; init; } = null!;
    public decimal Price { get; init; }
    public string PriceFormatted => Price.ToString("C0");
    public PricingModel PricingModel { get; init; }
    public DateTime? NextPaymentDate { get; init; }
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public DateTime WarrantyEndDate => EndDate.AddMonths(3);
    public DateTime HostingRenewalDate => EndDate.AddYears(1);
    public int DaysLeftForWarranty => (int)(WarrantyEndDate - DateTime.UtcNow).TotalDays;
    public int DaysUntilHostingRenewal => (int)(HostingRenewalDate - DateTime.UtcNow).TotalDays;
    public string? DriveLink { get; init; }
    public string? GitHubRepoUrl { get; init; }
    public string? HostingProvider { get; init; }
    public string? ExternalDatabase { get; init; }
    public string? Notes { get; init; }
    public bool IsActive { get; init; }
    public List<TaskDto> Tasks { get; init; } = new();
}

public record CreateProjectDto(
    Guid? ClientId,
    CreateClientInlineDto? NewClient,
    string Title,
    ProjectType Type,
    List<string>? Services,
    decimal Price,
    PricingModel PricingModel,
    DateTime? NextPaymentDate,
    DateTime StartDate,
    DateTime EndDate,
    string? DriveLink,
    string? GitHubRepoUrl,
    string? HostingProvider,
    string? ExternalDatabase,
    string? Notes);

public record CreateClientInlineDto(string Name, string ContactNumber, string? Email);

public record UpdateProjectDto(
    string Title,
    ProjectType Type,
    List<string>? Services,
    decimal Price,
    PricingModel PricingModel,
    DateTime? NextPaymentDate,
    DateTime StartDate,
    DateTime EndDate,
    string? DriveLink,
    string? GitHubRepoUrl,
    string? HostingProvider,
    string? ExternalDatabase,
    string? Notes,
    bool IsActive);
