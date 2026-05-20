namespace DevCRM.Domain.Entities;

public class Opportunity
{
    public Guid Id { get; set; }
    public string CompanyName { get; set; } = null!;
    public string ContactName { get; set; } = null!;
    public string ContactEmail { get; set; } = null!;
    public string DevelopmentPossibility { get; set; } = null!;
    public string? ExternalLeadId { get; set; }
    public OpportunityStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string? DiscardReason { get; set; }
}
