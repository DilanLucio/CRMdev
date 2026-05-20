using System.Diagnostics;
using DevCRM.Application.Common;
using DevCRM.Application.Diagnostics;
using DevCRM.Application.Opportunities.Dtos;
using DevCRM.Domain.Entities;
using DevCRM.Domain.Interfaces;
using FluentValidation;

namespace DevCRM.Application.Opportunities.Services;

public class OpportunityService : IOpportunityService
{
    private static readonly HashSet<(OpportunityStatus From, OpportunityStatus To)> AllowedTransitions =
    [
        (OpportunityStatus.AiGenerated, OpportunityStatus.Evaluating),
        (OpportunityStatus.AiGenerated, OpportunityStatus.Discarded),
        (OpportunityStatus.Evaluating,  OpportunityStatus.Contacted),
        (OpportunityStatus.Evaluating,  OpportunityStatus.Discarded),
    ];

    private readonly IOpportunityRepository _repo;
    private readonly IOpportunityAuditRepository _audit;
    private readonly OpportunityMetrics _metrics;

    public OpportunityService(
        IOpportunityRepository repo,
        IOpportunityAuditRepository audit,
        OpportunityMetrics metrics)
    {
        _repo    = repo;
        _audit   = audit;
        _metrics = metrics;
    }

    public async Task<OpportunityDto> IngestAsync(CreateOpportunityDto dto, CancellationToken ct = default)
    {
        if (dto.ExternalLeadId is not null)
        {
            var existing = await _repo.GetByExternalLeadIdAsync(dto.ExternalLeadId, ct);
            if (existing is not null)
                return Map(existing);
        }

        var sw = Stopwatch.StartNew();

        var opportunity = new Opportunity
        {
            Id                     = Guid.NewGuid(),
            CompanyName            = dto.CompanyName,
            ContactName            = dto.ContactName,
            ContactEmail           = dto.ContactEmail,
            DevelopmentPossibility = dto.DevelopmentPossibility,
            ExternalLeadId         = dto.ExternalLeadId,
            Status                 = OpportunityStatus.AiGenerated,
            CreatedAt              = DateTime.UtcNow,
            UpdatedAt              = DateTime.UtcNow,
        };

        await _repo.AddAsync(opportunity, ct);
        await _repo.SaveChangesAsync(ct);
        sw.Stop();

        await _audit.AddAsync(new OpportunityAuditLog
        {
            Id            = Guid.NewGuid(),
            OpportunityId = opportunity.Id,
            Action        = "Ingested",
            OldStatus     = null,
            NewStatus     = opportunity.Status,
            Actor         = "agent",
            At            = DateTime.UtcNow,
        }, ct);
        await _audit.SaveChangesAsync(ct);

        _metrics.RecordIngested(opportunity.Status.ToString());
        _metrics.RecordIngestDuration(sw.Elapsed.TotalMilliseconds);

        return Map(opportunity);
    }

    public async Task<IReadOnlyList<OpportunityDto>> GetAllAsync(OpportunityStatus? status = null, CancellationToken ct = default)
    {
        var list = await _repo.GetAllAsync(status, ct);
        return list.Select(Map).ToList();
    }

    public async Task<OpportunityDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var o = await _repo.GetByIdAsync(id, ct);
        return o is null ? null : Map(o);
    }

    public async Task<OpportunityDto> UpdateStatusAsync(Guid id, UpdateOpportunityStatusDto dto, CancellationToken ct = default)
    {
        var opportunity = await _repo.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Opportunity), id);

        if (!AllowedTransitions.Contains((opportunity.Status, dto.Status)))
            throw new ValidationException(
                $"Transition from {opportunity.Status} to {dto.Status} is not allowed.");

        var oldStatus = opportunity.Status;
        opportunity.Status        = dto.Status;
        opportunity.DiscardReason = dto.DiscardReason;
        opportunity.UpdatedAt     = DateTime.UtcNow;

        _repo.Update(opportunity);
        await _repo.SaveChangesAsync(ct);

        await _audit.AddAsync(new OpportunityAuditLog
        {
            Id            = Guid.NewGuid(),
            OpportunityId = opportunity.Id,
            Action        = "StatusChanged",
            OldStatus     = oldStatus,
            NewStatus     = opportunity.Status,
            Actor         = "human",
            At            = DateTime.UtcNow,
        }, ct);
        await _audit.SaveChangesAsync(ct);

        _metrics.RecordStatusChanged(oldStatus.ToString(), dto.Status.ToString());

        return Map(opportunity);
    }

    private static OpportunityDto Map(Opportunity o) => new(
        o.Id, o.CompanyName, o.ContactName, o.ContactEmail,
        o.DevelopmentPossibility, o.ExternalLeadId, o.Status,
        o.CreatedAt, o.UpdatedAt, o.DiscardReason);
}
