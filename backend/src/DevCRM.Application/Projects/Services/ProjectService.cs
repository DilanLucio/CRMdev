using DevCRM.Application.Common;
using DevCRM.Application.Projects.Dtos;
using DevCRM.Application.Tasks.Dtos;
using DevCRM.Domain.Entities;
using DevCRM.Domain.Interfaces;

namespace DevCRM.Application.Projects.Services;

public class ProjectService : IProjectService
{
    private readonly IProjectRepository _projectRepo;
    private readonly IClientRepository _clientRepo;

    public ProjectService(IProjectRepository projectRepo, IClientRepository clientRepo)
    {
        _projectRepo = projectRepo;
        _clientRepo = clientRepo;
    }

    public async Task<IReadOnlyList<ProjectListItemDto>> GetAllAsync(CancellationToken ct = default)
    {
        var projects = await _projectRepo.GetAllActiveAsync(ct);
        return projects.Select(p => new ProjectListItemDto
        {
            Id = p.Id,
            Title = p.Title,
            Type = p.Type,
            ClientName = p.Client.Name,
            Price = p.Price,
            PricingModel = p.PricingModel,
            NextPaymentDate = p.NextPaymentDate,
            StartDate = p.StartDate,
            EndDate = p.EndDate,
            HostingProvider = p.HostingProvider,
            IsActive = p.IsActive,
            HasPendingTasks = p.Tasks.Any(t => !t.IsCompleted)
        })
        .OrderBy(p => p.DaysUntilHostingRenewal)
        .ThenBy(p => p.DaysLeftForWarranty)
        .ToList();
    }

    public async Task<IReadOnlyList<ProjectListItemDto>> GetAllInactiveAsync(CancellationToken ct = default)
    {
        var projects = await _projectRepo.GetAllInactiveAsync(ct);
        return projects.Select(p => new ProjectListItemDto
        {
            Id = p.Id,
            Title = p.Title,
            Type = p.Type,
            ClientName = p.Client.Name,
            Price = p.Price,
            PricingModel = p.PricingModel,
            NextPaymentDate = p.NextPaymentDate,
            StartDate = p.StartDate,
            EndDate = p.EndDate,
            HostingProvider = p.HostingProvider,
            IsActive = p.IsActive,
            HasPendingTasks = p.Tasks.Any(t => !t.IsCompleted)
        })
        .OrderByDescending(p => p.EndDate)
        .ToList();
    }

    public async Task<ProjectDetailsDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var p = await _projectRepo.GetByIdWithTasksAsync(id, ct);
        return p is null ? null : MapDetails(p);
    }

    public async Task<ProjectDetailsDto> CreateAsync(CreateProjectDto dto, CancellationToken ct = default)
    {
        Guid clientId;
        if (dto.ClientId.HasValue)
        {
            var existing = await _clientRepo.GetByIdAsync(dto.ClientId.Value, ct)
                ?? throw new NotFoundException(nameof(Client), dto.ClientId.Value);
            clientId = existing.Id;
        }
        else
        {
            var newClient = new Client
            {
                Id = Guid.NewGuid(),
                Name = dto.NewClient!.Name,
                ContactNumber = dto.NewClient.ContactNumber,
                Email = dto.NewClient.Email,
                CreatedAt = DateTime.UtcNow
            };
            await _clientRepo.AddAsync(newClient, ct);
            clientId = newClient.Id;
        }

        var project = new Project
        {
            Id = Guid.NewGuid(),
            ClientId = clientId,
            Title = dto.Title,
            Type = dto.Type,
            Services = SerializeServices(dto.Services),
            Price = dto.Price,
            PricingModel = dto.PricingModel,
            NextPaymentDate = dto.NextPaymentDate,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            DriveLink = dto.DriveLink,
            GitHubRepoUrl = dto.GitHubRepoUrl,
            HostingProvider = dto.HostingProvider,
            ExternalDatabase = dto.ExternalDatabase,
            Notes = dto.Notes,
            IsActive = true
        };
        await _projectRepo.AddAsync(project, ct);
        await _projectRepo.SaveChangesAsync(ct);

        var loaded = await _projectRepo.GetByIdWithTasksAsync(project.Id, ct)!;
        return MapDetails(loaded!);
    }

    public async Task<ProjectDetailsDto> UpdateAsync(Guid id, UpdateProjectDto dto, CancellationToken ct = default)
    {
        var project = await _projectRepo.GetByIdAsync(id, ct) ?? throw new NotFoundException(nameof(Project), id);
        project.Title = dto.Title;
        project.Type = dto.Type;
        project.Services = SerializeServices(dto.Services);
        project.Price = dto.Price;
        project.PricingModel = dto.PricingModel;
        project.NextPaymentDate = dto.NextPaymentDate;
        project.StartDate = dto.StartDate;
        project.EndDate = dto.EndDate;
        project.DriveLink = dto.DriveLink;
        project.GitHubRepoUrl = dto.GitHubRepoUrl;
        project.HostingProvider = dto.HostingProvider;
        project.ExternalDatabase = dto.ExternalDatabase;
        project.Notes = dto.Notes;
        project.IsActive = dto.IsActive;
        _projectRepo.Update(project);
        await _projectRepo.SaveChangesAsync(ct);

        var loaded = await _projectRepo.GetByIdWithTasksAsync(project.Id, ct);
        return MapDetails(loaded!);
    }

    public async Task DeactivateAsync(Guid id, CancellationToken ct = default)
    {
        var project = await _projectRepo.GetByIdAsync(id, ct) ?? throw new NotFoundException(nameof(Project), id);
        project.IsActive = false;
        _projectRepo.Update(project);
        await _projectRepo.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var project = await _projectRepo.GetByIdAsync(id, ct) ?? throw new NotFoundException(nameof(Project), id);
        _projectRepo.Delete(project);
        await _projectRepo.SaveChangesAsync(ct);
    }

    public async Task DeleteWithClientAsync(Guid id, CancellationToken ct = default)
    {
        var project = await _projectRepo.GetByIdAsync(id, ct) ?? throw new NotFoundException(nameof(Project), id);
        var clientId = project.ClientId;
        _projectRepo.Delete(project);
        await _projectRepo.SaveChangesAsync(ct);
        var client = await _clientRepo.GetByIdAsync(clientId, ct);
        if (client is not null)
        {
            _clientRepo.Delete(client);
            await _clientRepo.SaveChangesAsync(ct);
        }
    }

    private static string? SerializeServices(List<string>? services)
    {
        if (services is null || services.Count == 0) return null;
        return string.Join(',', services.Select(s => s.Trim()).Where(s => s.Length > 0));
    }

    private static List<string> DeserializeServices(string? csv)
    {
        if (string.IsNullOrWhiteSpace(csv)) return new List<string>();
        return csv.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();
    }

    private static ProjectDetailsDto MapDetails(Project p) => new()
    {
        Id = p.Id,
        Title = p.Title,
        Type = p.Type,
        Services = DeserializeServices(p.Services),
        ClientId = p.ClientId,
        ClientName = p.Client.Name,
        Price = p.Price,
        PricingModel = p.PricingModel,
        NextPaymentDate = p.NextPaymentDate,
        StartDate = p.StartDate,
        EndDate = p.EndDate,
        DriveLink = p.DriveLink,
        GitHubRepoUrl = p.GitHubRepoUrl,
        HostingProvider = p.HostingProvider,
        ExternalDatabase = p.ExternalDatabase,
        Notes = p.Notes,
        IsActive = p.IsActive,
        Tasks = p.Tasks
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new TaskDto(t.Id, t.ProjectId, t.Description, t.IsCompleted, t.CreatedAt))
            .ToList()
    };
}
