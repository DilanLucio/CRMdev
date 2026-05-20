using DevCRM.Application.Diagnostics;
using DevCRM.Application.Opportunities.Dtos;
using DevCRM.Application.Opportunities.Services;
using DevCRM.Domain.Entities;
using DevCRM.Domain.Interfaces;
using FluentAssertions;
using FluentValidation;
using Moq;

namespace DevCRM.Application.Tests.Opportunities;

public class OpportunityServiceTests
{
    private static CreateOpportunityDto ValidCreate(string? externalLeadId = null) => new(
        "Acme Corp", "Jane Doe", "jane@acme.com",
        "## Summary\nNeeds ERP.", externalLeadId);

    private static Opportunity ExistingOpportunity(string externalLeadId) => new()
    {
        Id = Guid.NewGuid(),
        CompanyName = "Acme Corp",
        ContactName = "Jane Doe",
        ContactEmail = "jane@acme.com",
        DevelopmentPossibility = "## Summary\nNeeds ERP.",
        ExternalLeadId = externalLeadId,
        Status = OpportunityStatus.AiGenerated,
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow,
    };

    private static OpportunityService Build(
        IOpportunityRepository repo,
        IOpportunityAuditRepository? auditRepo = null)
    {
        var audit = auditRepo ?? MockAudit().Object;
        return new OpportunityService(repo, audit, new OpportunityMetrics());
    }

    private static Mock<IOpportunityAuditRepository> MockAudit()
    {
        var m = new Mock<IOpportunityAuditRepository>();
        m.Setup(r => r.AddAsync(It.IsAny<OpportunityAuditLog>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        m.Setup(r => r.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
        return m;
    }

    [Fact]
    public async Task Ingest_NewLead_PersistsWithAiGeneratedStatus()
    {
        var repo = new Mock<IOpportunityRepository>();
        repo.Setup(r => r.GetByExternalLeadIdAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Opportunity?)null);
        repo.Setup(r => r.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        var service = Build(repo.Object);
        var dto = await service.IngestAsync(ValidCreate("lead-1"));

        dto.Status.Should().Be(OpportunityStatus.AiGenerated);
        dto.CompanyName.Should().Be("Acme Corp");
        repo.Verify(r => r.AddAsync(It.IsAny<Opportunity>(), It.IsAny<CancellationToken>()), Times.Once);
        repo.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Ingest_DuplicateExternalLeadId_ReturnsExistingNotDuplicate()
    {
        var existing = ExistingOpportunity("lead-dup");
        var repo = new Mock<IOpportunityRepository>();
        repo.Setup(r => r.GetByExternalLeadIdAsync("lead-dup", It.IsAny<CancellationToken>()))
            .ReturnsAsync(existing);

        var service = Build(repo.Object);
        var dto = await service.IngestAsync(ValidCreate("lead-dup"));

        dto.Id.Should().Be(existing.Id);
        repo.Verify(r => r.AddAsync(It.IsAny<Opportunity>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task UpdateStatus_AiGeneratedToContacted_ThrowsValidation()
    {
        var opportunity = ExistingOpportunity("lead-x");
        var repo = new Mock<IOpportunityRepository>();
        repo.Setup(r => r.GetByIdAsync(opportunity.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(opportunity);

        var service = Build(repo.Object);

        await service.Invoking(s => s.UpdateStatusAsync(
                opportunity.Id,
                new UpdateOpportunityStatusDto(OpportunityStatus.Contacted, null)))
            .Should().ThrowAsync<ValidationException>();
    }

    [Fact]
    public async Task UpdateStatus_ValidTransition_AiGeneratedToEvaluating_Succeeds()
    {
        var opportunity = ExistingOpportunity("lead-y");
        var repo = new Mock<IOpportunityRepository>();
        repo.Setup(r => r.GetByIdAsync(opportunity.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(opportunity);
        repo.Setup(r => r.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        var service = Build(repo.Object);
        var result = await service.UpdateStatusAsync(
            opportunity.Id,
            new UpdateOpportunityStatusDto(OpportunityStatus.Evaluating, null));

        result.Status.Should().Be(OpportunityStatus.Evaluating);
    }
}
