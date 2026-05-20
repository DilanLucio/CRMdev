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
            ClientName = p.Client.Name,
            Price = p.Price,
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
            Price = dto.Price,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            DriveLink = dto.DriveLink,
            GitHubRepoUrl = dto.GitHubRepoUrl,
            HostingProvider = dto.HostingProvider,
            ExternalDatabase = dto.ExternalDatabase,
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
        project.Price = dto.Price;
        project.StartDate = dto.StartDate;
        project.EndDate = dto.EndDate;
        project.DriveLink = dto.DriveLink;
        project.GitHubRepoUrl = dto.GitHubRepoUrl;
        project.HostingProvider = dto.HostingProvider;
        project.ExternalDatabase = dto.ExternalDatabase;
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

    private static ProjectDetailsDto MapDetails(Project p) => new()
    {
        Id = p.Id,
        Title = p.Title,
        ClientId = p.ClientId,
        ClientName = p.Client.Name,
        Price = p.Price,
        StartDate = p.StartDate,
        EndDate = p.EndDate,
        DriveLink = p.DriveLink,
        GitHubRepoUrl = p.GitHubRepoUrl,
        HostingProvider = p.HostingProvider,
        ExternalDatabase = p.ExternalDatabase,
        IsActive = p.IsActive,
        Tasks = p.Tasks
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new TaskDto(t.Id, t.ProjectId, t.Description, t.IsCompleted, t.CreatedAt))
            .ToList()
    };
}
