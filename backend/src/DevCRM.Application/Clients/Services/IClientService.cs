using DevCRM.Application.Clients.Dtos;

namespace DevCRM.Application.Clients.Services;

public interface IClientService
{
    Task<IReadOnlyList<ClientDto>> GetAllAsync(CancellationToken ct = default);
    Task<ClientDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<ClientDto> CreateAsync(CreateClientDto dto, CancellationToken ct = default);
    Task<ClientDto> UpdateAsync(Guid id, UpdateClientDto dto, CancellationToken ct = default);
}
