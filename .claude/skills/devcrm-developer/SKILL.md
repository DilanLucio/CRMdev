---
name: devcrm-developer
description: "Use when implementing code for DevCRM. Covers C# Clean Architecture patterns (handlers, repos, DTOs, controllers), React component patterns (TanStack Query hooks, Tailwind UI, skeleton loaders, react-markdown), and anti-patterns to evitar."
---

# DevCRM – Developer Skill

## Contexto del Proyecto
DevCRM: CRM para gestión de clientes y proyectos con garantías, alertas de hosting y README de GitHub. Backend .NET 8/9 Clean Architecture + Frontend React + TypeScript + Tailwind.

---

## C# – Patrones de Implementación

### DTO de Respuesta Principal

```csharp
public class ProjectDetailsDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string ClientName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string PriceFormatted => Price.ToString("C0"); // "$25,000"

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime WarrantyEndDate => EndDate.AddMonths(3);
    public DateTime HostingRenewalDate => EndDate.AddYears(1);

    public int DaysLeftForWarranty =>
        Math.Max(0, (WarrantyEndDate - DateTime.UtcNow).Days);
    public int DaysUntilHostingRenewal =>
        Math.Max(0, (HostingRenewalDate - DateTime.UtcNow).Days);

    public bool IsWarrantyExpired => DateTime.UtcNow > WarrantyEndDate;
    public bool HasHostingAlert => DaysUntilHostingRenewal < 30;
    public bool HasWarrantyAlert => DaysLeftForWarranty < 15 && Tasks.Any(t => !t.IsCompleted);

    public string? DriveLink { get; set; }
    public string? GitHubRepoUrl { get; set; }
    public string HostingProvider { get; set; } = string.Empty;
    public string? ExternalDatabase { get; set; }

    public List<TaskDto> Tasks { get; set; } = new();
}

public class TaskDto
{
    public Guid Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
    public string Category { get; set; } = string.Empty;    // Sales, Dev, Design, Ops
    public string GroupType { get; set; } = string.Empty;   // Milestone, WarrantyPending, PostWarranty
    public bool IsCompleted { get; set; }
    public List<string> AssigneeAvatarUrls { get; set; } = new();
}
```

### Query Handler (CQRS con MediatR)

```csharp
// Application/Projects/Queries/GetProjectDetails/GetProjectDetailsQuery.cs
public record GetProjectDetailsQuery(Guid ProjectId) : IRequest<ProjectDetailsDto>;

public class GetProjectDetailsHandler : IRequestHandler<GetProjectDetailsQuery, ProjectDetailsDto>
{
    private readonly IProjectRepository _repo;

    public GetProjectDetailsHandler(IProjectRepository repo) => _repo = repo;

    public async Task<ProjectDetailsDto> Handle(GetProjectDetailsQuery request, CancellationToken ct)
    {
        var project = await _repo.GetByIdWithTasksAsync(request.ProjectId, ct)
            ?? throw new NotFoundException(nameof(Project), request.ProjectId);

        return new ProjectDetailsDto
        {
            Id = project.Id,
            Title = project.Title,
            ClientName = project.Client.Name,
            Price = project.Price,
            StartDate = project.StartDate,
            EndDate = project.EndDate,
            DriveLink = project.DriveLink,
            GitHubRepoUrl = project.GitHubRepoUrl,
            HostingProvider = project.HostingProvider,
            ExternalDatabase = project.ExternalDatabase,
            Tasks = project.Tasks.Select(t => new TaskDto
            {
                Id = t.Id,
                Description = t.Description,
                IsCompleted = t.IsCompleted,
                CreatedAt = t.CreatedAt,
            }).ToList()
        };
    }
}
```

### Servicio GitHub README

```csharp
// Infrastructure/GitHub/GitHubService.cs
public class GitHubService : IGitHubService
{
    private readonly HttpClient _http;

    public GitHubService(HttpClient http) => _http = http;

    public async Task<string?> GetReadmeAsync(string repoUrl, CancellationToken ct)
    {
        // repoUrl formato: "usuario/repo"
        var url = $"https://api.github.com/repos/{repoUrl}/readme";
        var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Add("Accept", "application/vnd.github.v3.raw");

        var response = await _http.SendAsync(request, ct);
        if (!response.IsSuccessStatusCode) return null;

        return await response.Content.ReadAsStringAsync(ct);
    }
}
```

```csharp
// Program.cs – registro del HttpClient
builder.Services.AddHttpClient<IGitHubService, GitHubService>(client =>
{
    client.DefaultRequestHeaders.Add("User-Agent", "DevCRM/1.0");
    // Token opcional para repos privados
    var token = builder.Configuration["GitHub:Token"];
    if (!string.IsNullOrEmpty(token))
        client.DefaultRequestHeaders.Add("Authorization", $"Bearer {token}");
});
```

### Controller

```csharp
[ApiController]
[Route("api/projects")]
public class ProjectsController : ControllerBase
{
    private readonly IMediator _mediator;
    public ProjectsController(IMediator mediator) => _mediator = mediator;

    [HttpGet("{id}")]
    public async Task<ActionResult<ProjectDetailsDto>> GetById(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetProjectDetailsQuery(id), ct);
        return Ok(result);
    }

    [HttpGet("{id}/readme")]
    public async Task<ActionResult<string>> GetReadme(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetProjectReadmeQuery(id), ct);
        return result is null ? NotFound() : Ok(result);
    }
}
```

---

## React – Patrones de Implementación

### Hook TanStack Query para detalle de proyecto

```typescript
// hooks/useProjectDetails.ts
import { useQuery } from '@tanstack/react-query';
import { fetchProjectDetails } from '../api/projects';
import type { ProjectDetailsDto } from '../types';

export function useProjectDetails(projectId: string) {
  return useQuery<ProjectDetailsDto>({
    queryKey: ['project', projectId],
    queryFn: () => fetchProjectDetails(projectId),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
```

### Hook para README de GitHub

```typescript
// hooks/useReadme.ts
import { useQuery } from '@tanstack/react-query';
import { fetchProjectReadme } from '../api/projects';

export function useReadme(projectId: string, enabled: boolean) {
  return useQuery<string>({
    queryKey: ['readme', projectId],
    queryFn: () => fetchProjectReadme(projectId),
    enabled,
    staleTime: 1000 * 60 * 15, // 15 minutos
  });
}
```

### Componente Badge de alerta

```typescript
// components/ui/AlertBadge.tsx
interface AlertBadgeProps {
  hasWarrantyAlert: boolean;
  hasHostingAlert: boolean;
  daysLeftWarranty: number;
  daysUntilHosting: number;
}

export function AlertBadge({ hasWarrantyAlert, hasHostingAlert, daysLeftWarranty, daysUntilHosting }: AlertBadgeProps) {
  if (hasHostingAlert) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
        🔴 Hosting en {daysUntilHosting}d
      </span>
    );
  }
  if (hasWarrantyAlert) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">
        🟡 Garantía en {daysLeftWarranty}d
      </span>
    );
  }
  return null;
}
```

### Skeleton Loader

```typescript
// components/ui/ProjectDetailsSkeleton.tsx
export function ProjectDetailsSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-6">
      <div className="h-8 w-1/2 rounded-lg bg-slate-200" />
      <div className="h-4 w-1/3 rounded bg-slate-200" />
      <div className="mt-6 space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-5 w-5 rounded bg-slate-200" />
            <div className="h-4 flex-1 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### README Preview con react-markdown

```typescript
// components/github/ReadmePreview.tsx
import ReactMarkdown from 'react-markdown';
import { useReadme } from '../../hooks/useReadme';

interface ReadmePreviewProps { projectId: string; }

export function ReadmePreview({ projectId }: ReadmePreviewProps) {
  const { data: readme, isLoading } = useReadme(projectId, true);

  if (isLoading) return <div className="animate-pulse h-40 rounded-lg bg-slate-100" />;
  if (!readme) return <p className="text-sm text-slate-400">No README disponible.</p>;

  return (
    <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-100 p-4">
      <ReactMarkdown className="prose prose-slate prose-sm max-w-none">
        {readme}
      </ReactMarkdown>
    </div>
  );
}
```

---

## Anti-patrones a Evitar

| Anti-patrón | Corrección |
|---|---|
| Calcular `WarrantyEndDate` en BD o en el frontend | Siempre en el DTO del backend con `EndDate.AddMonths(3)` |
| Usar `DateTime.Now` en el servidor | Usar `DateTime.UtcNow` siempre |
| Llamar `/readme` en el listado del dashboard | Solo en la vista de detalle del proyecto (`enabled: !!projectId`) |
| Renderizar Markdown como `dangerouslySetInnerHTML` | Usar `react-markdown` con `prose prose-slate` |
| Guardar el contenido del README en la BD | Siempre fetch en tiempo real desde GitHub |
| Eliminar registros con DELETE físico | Soft delete: `IsActive = false` |
