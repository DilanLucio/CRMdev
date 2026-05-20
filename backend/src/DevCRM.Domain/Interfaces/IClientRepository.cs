using DevCRM.Domain.Entities;

namespace DevCRM.Domain.Interfaces;

public interface IClientRepository
{
    Task<IReadOnlyList<Client>> GetAllAsync(CancellationToken ct = default);
    Task<Client?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(Client client, CancellationToken ct = default);
    void Update(Client client);
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
