using DevCRM.Application.Clients.Dtos;
using DevCRM.Application.Common;
using DevCRM.Domain.Entities;
using DevCRM.Domain.Interfaces;

namespace DevCRM.Application.Clients.Services;

public class ClientService : IClientService
{
    private readonly IClientRepository _repo;
    public ClientService(IClientRepository repo) => _repo = repo;

    public async Task<IReadOnlyList<ClientDto>> GetAllAsync(CancellationToken ct = default)
    {
        var clients = await _repo.GetAllAsync(ct);
        return clients.Select(Map).ToList();
    }

    public async Task<ClientDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var c = await _repo.GetByIdAsync(id, ct);
        return c is null ? null : Map(c);
    }

    public async Task<ClientDto> CreateAsync(CreateClientDto dto, CancellationToken ct = default)
    {
        var client = new Client
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            ContactNumber = dto.ContactNumber,
            Email = dto.Email,
            CreatedAt = DateTime.UtcNow
        };
        await _repo.AddAsync(client, ct);
        await _repo.SaveChangesAsync(ct);
        return Map(client);
    }

    public async Task<ClientDto> UpdateAsync(Guid id, UpdateClientDto dto, CancellationToken ct = default)
    {
        var client = await _repo.GetByIdAsync(id, ct) ?? throw new NotFoundException(nameof(Client), id);
        client.Name = dto.Name;
        client.ContactNumber = dto.ContactNumber;
        client.Email = dto.Email;
        _repo.Update(client);
        await _repo.SaveChangesAsync(ct);
        return Map(client);
    }

    private static ClientDto Map(Client c) => new(c.Id, c.Name, c.ContactNumber, c.Email, c.CreatedAt);
}
