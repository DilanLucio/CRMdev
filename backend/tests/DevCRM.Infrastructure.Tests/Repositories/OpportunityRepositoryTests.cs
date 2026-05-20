using DevCRM.Domain.Entities;
using DevCRM.Infrastructure.Persistence;
using DevCRM.Infrastructure.Persistence.Repositories;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace DevCRM.Infrastructure.Tests.Repositories;

public class OpportunityRepositoryTests : IDisposable
{
    private readonly DevCrmDbContext _db;
    private readonly OpportunityRepository _repo;

    public OpportunityRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<DevCrmDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _db = new DevCrmDbContext(options);
        _repo = new OpportunityRepository(_db);
    }

    public void Dispose() => _db.Dispose();

    private static Opportunity MakeOpportunity(string? externalLeadId = null,
        OpportunityStatus status = OpportunityStatus.AiGenerated) => new()
    {
        Id = Guid.NewGuid(),
        CompanyName = "Acme",
        ContactName = "Jane",
        ContactEmail = "jane@acme.com",
        DevelopmentPossibility = "## ERP",
        ExternalLeadId = externalLeadId,
        Status = status,
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow,
    };

    [Fact]
    public async Task AddAsync_PersistsAndSaveChangesReturnsOne()
    {
        var o = MakeOpportunity();
        await _repo.AddAsync(o);
        var saved = await _repo.SaveChangesAsync();

        saved.Should().Be(1);
        var found = await _repo.GetByIdAsync(o.Id);
        found.Should().NotBeNull();
        found!.CompanyName.Should().Be("Acme");
    }

    [Fact]
    public async Task GetByExternalLeadIdAsync_ReturnsMatch()
    {
        var o = MakeOpportunity("lead-abc");
        await _repo.AddAsync(o);
        await _repo.SaveChangesAsync();

        var found = await _repo.GetByExternalLeadIdAsync("lead-abc");
        found.Should().NotBeNull();
        found!.Id.Should().Be(o.Id);
    }

    [Fact]
    public async Task GetByExternalLeadIdAsync_NullArg_ReturnsNull()
    {
        var found = await _repo.GetByExternalLeadIdAsync("nonexistent");
        found.Should().BeNull();
    }

    [Fact]
    public async Task GetAllAsync_FiltersByStatus()
    {
        await _repo.AddAsync(MakeOpportunity(status: OpportunityStatus.AiGenerated));
        await _repo.AddAsync(MakeOpportunity(status: OpportunityStatus.Evaluating));
        await _repo.AddAsync(MakeOpportunity(status: OpportunityStatus.Discarded));
        await _repo.SaveChangesAsync();

        var aiGenerated = await _repo.GetAllAsync(OpportunityStatus.AiGenerated);
        aiGenerated.Should().HaveCount(1);

        var all = await _repo.GetAllAsync();
        all.Should().HaveCount(3);
    }

    [Fact]
    public async Task GetAllAsync_NoFilter_ReturnsAll()
    {
        await _repo.AddAsync(MakeOpportunity());
        await _repo.AddAsync(MakeOpportunity());
        await _repo.SaveChangesAsync();

        var all = await _repo.GetAllAsync();
        all.Should().HaveCount(2);
    }
}
