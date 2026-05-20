using DevCRM.Domain.Entities;
using DevCRM.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DevCRM.Infrastructure.Persistence.Repositories;

public class ClientRepository : IClientRepository
{
    private readonly DevCrmDbContext _db;
    public ClientRepository(DevCrmDbContext db) => _db = db;

    public async Task<IReadOnlyList<Client>> GetAllAsync(CancellationToken ct = default) =>
        await _db.Clients.AsNoTracking().OrderBy(c => c.Name).ToListAsync(ct);

    public Task<Client?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        _db.Clients.FirstOrDefaultAsync(c => c.Id == id, ct);

    public async Task AddAsync(Client client, CancellationToken ct = default) =>
        await _db.Clients.AddAsync(client, ct);

    public void Update(Client client) => _db.Clients.Update(client);
    public void Delete(Client client) => _db.Clients.Remove(client);

    public Task<int> SaveChangesAsync(CancellationToken ct = default) => _db.SaveChangesAsync(ct);
}
