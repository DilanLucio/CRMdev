using DevCRM.Domain.Entities;

namespace DevCRM.Application.Opportunities.Dtos;

public record OpportunityDto(
    Guid Id,
    string CompanyName,
    string ContactName,
    string ContactEmail,
    string DevelopmentPossibility,
    string? ExternalLeadId,
    OpportunityStatus Status,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    string? DiscardReason);

public record CreateOpportunityDto(
    string CompanyName,
    string ContactName,
    string ContactEmail,
    string DevelopmentPossibility,
    string? ExternalLeadId);

public record UpdateOpportunityStatusDto(
    OpportunityStatus Status,
    string? DiscardReason);
