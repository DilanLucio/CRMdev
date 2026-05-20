namespace DevCRM.Domain.Entities;

public class OpportunityAuditLog
{
    public Guid Id { get; set; }
    public Guid OpportunityId { get; set; }
    public string Action { get; set; } = null!;
    public OpportunityStatus? OldStatus { get; set; }
    public OpportunityStatus? NewStatus { get; set; }
    public string Actor { get; set; } = null!;
    public DateTime At { get; set; }
}
