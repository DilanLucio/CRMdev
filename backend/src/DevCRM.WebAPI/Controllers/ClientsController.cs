using DevCRM.Application.Clients.Dtos;
using DevCRM.Application.Clients.Services;
using Microsoft.AspNetCore.Mvc;

namespace DevCRM.WebAPI.Controllers;

[ApiController]
[Route("api/clients")]
public class ClientsController : ControllerBase
{
    private readonly IClientService _service;
    public ClientsController(IClientService service) => _service = service;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ClientDto>>> GetAll(CancellationToken ct) =>
        Ok(await _service.GetAllAsync(ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ClientDto>> GetById(Guid id, CancellationToken ct)
    {
        var client = await _service.GetByIdAsync(id, ct);
        return client is null ? NotFound() : Ok(client);
    }

    [HttpPost]
    public async Task<ActionResult<ClientDto>> Create([FromBody] CreateClientDto dto, CancellationToken ct)
    {
        var created = await _service.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ClientDto>> Update(Guid id, [FromBody] UpdateClientDto dto, CancellationToken ct) =>
        Ok(await _service.UpdateAsync(id, dto, ct));
}
