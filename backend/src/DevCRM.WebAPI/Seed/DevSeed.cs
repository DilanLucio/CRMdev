using DevCRM.Domain.Entities;
using DevCRM.Infrastructure.Persistence;

namespace DevCRM.WebAPI.Seed;

public static class DevSeed
{
    public static void Run(DevCrmDbContext db)
    {
        if (db.Projects.Any()) return;

        var client = new Client
        {
            Id = Guid.NewGuid(),
            Name = "Acme Corp",
            ContactNumber = "+52 33 1234 5678",
            Email = "ops@acme.test",
            CreatedAt = DateTime.UtcNow,
        };

        var project = new Project
        {
            Id = Guid.NewGuid(),
            ClientId = client.Id,
            Title = "Acme Marketing Site",
            Price = 25_000m,
            StartDate = DateTime.UtcNow.AddMonths(-4),
            EndDate = DateTime.UtcNow.AddDays(-10),
            HostingProvider = "Vercel",
            ExternalDatabase = "Upstash Redis",
            GitHubRepoUrl = "vercel/next.js",
            DriveLink = null,
            IsActive = true,
        };

        var tasks = new[]
        {
            new ProjectTask { Id = Guid.NewGuid(), ProjectId = project.Id, Description = "Lanzar sitio en producción", IsCompleted = true, CreatedAt = DateTime.UtcNow.AddDays(-15) },
            new ProjectTask { Id = Guid.NewGuid(), ProjectId = project.Id, Description = "Corregir bug en exportación PDF", IsCompleted = false, CreatedAt = DateTime.UtcNow.AddDays(-5) },
            new ProjectTask { Id = Guid.NewGuid(), ProjectId = project.Id, Description = "Revisar rendimiento de imágenes", IsCompleted = false, CreatedAt = DateTime.UtcNow.AddDays(-3) },
            new ProjectTask { Id = Guid.NewGuid(), ProjectId = project.Id, Description = "Renovación anual de hosting", IsCompleted = false, CreatedAt = DateTime.UtcNow },
        };

        db.Clients.Add(client);
        db.Projects.Add(project);
        db.ProjectTasks.AddRange(tasks);
        db.SaveChanges();
    }
}
