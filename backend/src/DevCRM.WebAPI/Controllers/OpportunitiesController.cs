using DevCRM.Application.Opportunities.Dtos;
using DevCRM.Application.Opportunities.Services;
using DevCRM.Domain.Entities;
using DevCRM.WebAPI.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace DevCRM.WebAPI.Controllers;

[ApiController]
[Route("api/opportunities")]
public class OpportunitiesController : ControllerBase
{
    private readonly IOpportunityService _service;
    public OpportunitiesController(IOpportunityService service) => _service = service;

    [HttpPost]
    [ApiKeyAuth]
    [EnableRateLimiting("ingest")]
    [ProducesResponseType<OpportunityDto>(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<OpportunityDto>> Ingest([FromBody] CreateOpportunityDto dto, CancellationToken ct)
    {
        var created = await _service.IngestAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpGet]
    [ProducesResponseType<IReadOnlyList<OpportunityDto>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<OpportunityDto>>> GetAll(
        [FromQuery] OpportunityStatus? status, CancellationToken ct) =>
        Ok(await _service.GetAllAsync(status, ct));

    [HttpGet("{id:guid}")]
    [ProducesResponseType<OpportunityDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OpportunityDto>> GetById(Guid id, CancellationToken ct)
    {
        var o = await _service.GetByIdAsync(id, ct);
        return o is null ? NotFound() : Ok(o);
    }

    [HttpPut("{id:guid}/status")]
    [ProducesResponseType<OpportunityDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OpportunityDto>> UpdateStatus(
        Guid id, [FromBody] UpdateOpportunityStatusDto dto, CancellationToken ct) =>
        Ok(await _service.UpdateStatusAsync(id, dto, ct));
}
