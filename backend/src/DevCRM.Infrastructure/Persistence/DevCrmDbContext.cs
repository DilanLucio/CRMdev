using DevCRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DevCRM.Infrastructure.Persistence;

public class DevCrmDbContext : DbContext
{
    public DevCrmDbContext(DbContextOptions<DevCrmDbContext> options) : base(options) { }

    public DbSet<Client> Clients => Set<Client>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectTask> ProjectTasks => Set<ProjectTask>();
    public DbSet<Opportunity> Opportunities => Set<Opportunity>();
    public DbSet<OpportunityAuditLog> OpportunityAuditLogs => Set<OpportunityAuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(DevCrmDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
