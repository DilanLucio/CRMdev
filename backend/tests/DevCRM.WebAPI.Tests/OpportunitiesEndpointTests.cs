using System.Net;
using System.Net.Http.Json;
using DevCRM.Application.Opportunities.Dtos;
using DevCRM.Application.Opportunities.Services;
using DevCRM.Domain.Entities;
using FluentAssertions;
using FluentValidation;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Moq;

namespace DevCRM.WebAPI.Tests;

public class OpportunitiesEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private const string TestApiKey = "test-api-key-123";

    private static readonly OpportunityDto _aiGeneratedDto = new(
        Guid.Parse("11111111-1111-1111-1111-111111111111"),
        "Acme Corp", "Jane Doe", "jane@acme.com",
        "## ERP integration", "lead-1",
        OpportunityStatus.AiGenerated,
        DateTime.UtcNow, DateTime.UtcNow, null);

    private static readonly OpportunityDto _evaluatingDto = _aiGeneratedDto with
    {
        Status = OpportunityStatus.Evaluating,
    };

    private readonly HttpClient _client;
    private readonly Mock<IOpportunityService> _mockService;

    public OpportunitiesEndpointTests(WebApplicationFactory<Program> factory)
    {
        _mockService = new Mock<IOpportunityService>();

        _mockService
            .Setup(s => s.IngestAsync(It.IsAny<CreateOpportunityDto>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(_aiGeneratedDto);

        _mockService
            .Setup(s => s.GetAllAsync(It.IsAny<OpportunityStatus?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<OpportunityDto> { _aiGeneratedDto });

        _mockService
            .Setup(s => s.UpdateStatusAsync(
                It.IsAny<Guid>(),
                It.Is<UpdateOpportunityStatusDto>(d => d.Status == OpportunityStatus.Evaluating),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(_evaluatingDto);

        _mockService
            .Setup(s => s.UpdateStatusAsync(
                It.IsAny<Guid>(),
                It.Is<UpdateOpportunityStatusDto>(d => d.Status == OpportunityStatus.Contacted),
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(new ValidationException(
                "Transition from AiGenerated to Contacted is not allowed."));

        _client = factory.WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Test");
            builder.UseSetting("Ingestion:ApiKeys:0", TestApiKey);
            builder.ConfigureTestServices(services =>
            {
                services.RemoveAll<IOpportunityService>();
                services.AddScoped(_ => _mockService.Object);
            });
        }).CreateClient();
    }

    private static CreateOpportunityDto ValidDto(string? externalLeadId = null) => new(
        "Acme Corp", "Jane Doe", "jane@acme.com",
        "## ERP integration\nClient needs it.", externalLeadId);

    [Fact]
    public async Task Post_WithoutApiKey_Returns401()
    {
        var res = await _client.PostAsJsonAsync("/api/opportunities", ValidDto());
        res.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Post_WithWrongApiKey_Returns403()
    {
        var req = new HttpRequestMessage(HttpMethod.Post, "/api/opportunities")
        {
            Headers = { { "X-Api-Key", "wrong-key" } },
            Content = JsonContent.Create(ValidDto()),
        };
        var res = await _client.SendAsync(req);
        res.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task Post_ValidPayload_Returns201AndAiGeneratedStatus()
    {
        var req = new HttpRequestMessage(HttpMethod.Post, "/api/opportunities")
        {
            Headers = { { "X-Api-Key", TestApiKey } },
            Content = JsonContent.Create(ValidDto("lead-new-1")),
        };
        var res = await _client.SendAsync(req);

        res.StatusCode.Should().Be(HttpStatusCode.Created);
        var dto = await res.Content.ReadFromJsonAsync<OpportunityDto>();
        dto!.Status.Should().Be(OpportunityStatus.AiGenerated);
        dto.CompanyName.Should().Be("Acme Corp");
    }

    [Fact]
    public async Task Post_DuplicateExternalLeadId_Returns201_SameId()
    {
        HttpRequestMessage Req() => new(HttpMethod.Post, "/api/opportunities")
        {
            Headers = { { "X-Api-Key", TestApiKey } },
            Content = JsonContent.Create(ValidDto("lead-idem-1")),
        };

        var first = await (await _client.SendAsync(Req())).Content.ReadFromJsonAsync<OpportunityDto>();
        var second = await (await _client.SendAsync(Req())).Content.ReadFromJsonAsync<OpportunityDto>();

        second!.Id.Should().Be(first!.Id);
    }

    [Fact]
    public async Task Post_InvalidEmail_Returns400()
    {
        var badDto = new CreateOpportunityDto("Acme", "Jane", "not-email", "## ERP", null);
        var req = new HttpRequestMessage(HttpMethod.Post, "/api/opportunities")
        {
            Headers = { { "X-Api-Key", TestApiKey } },
            Content = JsonContent.Create(badDto),
        };
        var res = await _client.SendAsync(req);
        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Get_ListByStatus_FiltersCorrectly()
    {
        var res = await _client.GetAsync($"/api/opportunities?status={(int)OpportunityStatus.AiGenerated}");
        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var list = await res.Content.ReadFromJsonAsync<List<OpportunityDto>>();
        list.Should().NotBeEmpty();
        list!.All(o => o.Status == OpportunityStatus.AiGenerated).Should().BeTrue();
    }

    [Fact]
    public async Task Put_Status_FromAiGeneratedToEvaluating_Returns200()
    {
        var updateDto = new UpdateOpportunityStatusDto(OpportunityStatus.Evaluating, null);
        var res = await _client.PutAsJsonAsync(
            $"/api/opportunities/{_aiGeneratedDto.Id}/status", updateDto);

        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var updated = await res.Content.ReadFromJsonAsync<OpportunityDto>();
        updated!.Status.Should().Be(OpportunityStatus.Evaluating);
    }

    [Fact]
    public async Task Put_Status_InvalidTransition_Returns400()
    {
        var updateDto = new UpdateOpportunityStatusDto(OpportunityStatus.Contacted, null);
        var res = await _client.PutAsJsonAsync(
            $"/api/opportunities/{_aiGeneratedDto.Id}/status", updateDto);

        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Get_Metrics_ExposesPrometheusEndpoint()
    {
        var res = await _client.GetAsync("/metrics");
        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await res.Content.ReadAsStringAsync();
        body.Should().Contain("# TYPE");
    }
}
