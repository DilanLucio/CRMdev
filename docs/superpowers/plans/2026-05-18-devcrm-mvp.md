# DevCRM MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build DevCRM MVP — a .NET 8 Clean Architecture backend (EF Core + SQL Server Express) and a React + Vite + TypeScript frontend (Nexus Dashboard design system) covering project/client/task CRUD, automatic warranty/hosting alerts, and GitHub README embedding.

**Architecture:** Backend = Clean Architecture (Domain, Application, Infrastructure, WebAPI) with CQRS via MediatR, FluentValidation, EF Core 8 + SQL Server Express. Frontend = Vite + React 18 + TS + Tailwind + TanStack Query + react-markdown, 3-column layout (Sidebar / Workspace / Details Pane). Each phase = one isolated agent run + one git commit + green build + passing tests.

**Tech Stack:**
- Backend: .NET 8 SDK, EF Core 8, SQL Server Express (`Server=.\SQLEXPRESS`), MediatR, FluentValidation, AutoMapper, xUnit + FluentAssertions + Moq + Microsoft.EntityFrameworkCore.InMemory
- Frontend: Vite 5, React 18, TypeScript 5, Tailwind 3, TanStack Query 5, react-router-dom 6, react-markdown, axios, Vitest + React Testing Library + MSW
- Tooling: git + GitHub CLI (`gh`), Conventional Commits

**Per-phase workflow (every phase, no exceptions):**
1. Spawn agent via `Agent` tool with `subagent_type: claude` and the phase's listed skill loaded.
2. Agent runs TDD per `superpowers:test-driven-development` (Red → Green → Refactor).
3. Verify compile: `dotnet build` (backend phases) and/or `npm run build && npx tsc --noEmit` (frontend phases) — must exit 0.
4. Run tests: `dotnet test` and/or `npm test -- --run`.
5. Commit with Conventional Commit message (one commit per phase).
6. Push to GitHub (`git push origin main`).

**Repo conventions:**
- Solution at repo root: `DevCRM.sln`
- Backend folders: `backend/src/{Domain,Application,Infrastructure,WebAPI}` and `backend/tests/{Domain.Tests,Application.Tests,Infrastructure.Tests,WebAPI.Tests}`
- Frontend folder: `frontend/`
- Connection string (dev): `Server=.\SQLEXPRESS;Database=DevCRM;Trusted_Connection=True;TrustServerCertificate=True;`

---

## File Structure (target end state)

```
CRM/
├── DevCRM.sln
├── .gitignore
├── README.md
├── backend/
│   ├── src/
│   │   ├── DevCRM.Domain/
│   │   │   ├── Entities/{Client.cs, Project.cs, ProjectTask.cs}
│   │   │   ├── Enums/{TaskGroupType.cs, TaskCategory.cs}
│   │   │   └── Common/Result.cs
│   │   ├── DevCRM.Application/
│   │   │   ├── DTOs/{ClientDto.cs, ProjectDto.cs, ProjectDetailsDto.cs, TaskDto.cs, CreateProjectDto.cs}
│   │   │   ├── Features/Projects/{Commands,Queries,Validators}
│   │   │   ├── Features/Clients/{Commands,Queries,Validators}
│   │   │   ├── Features/Tasks/{Commands,Queries}
│   │   │   ├── Interfaces/{IApplicationDbContext.cs, IGitHubReadmeService.cs}
│   │   │   └── Mapping/ApplicationMappingProfile.cs
│   │   ├── DevCRM.Infrastructure/
│   │   │   ├── Persistence/{ApplicationDbContext.cs, Configurations/*.cs, Migrations/}
│   │   │   ├── Services/GitHubReadmeService.cs
│   │   │   └── DependencyInjection.cs
│   │   └── DevCRM.WebAPI/
│   │       ├── Controllers/{ClientsController.cs, ProjectsController.cs, TasksController.cs}
│   │       ├── Middleware/ExceptionHandlingMiddleware.cs
│   │       ├── Program.cs
│   │       └── appsettings.{json,Development.json}
│   └── tests/
│       ├── DevCRM.Domain.Tests/
│       ├── DevCRM.Application.Tests/
│       ├── DevCRM.Infrastructure.Tests/
│       └── DevCRM.WebAPI.Tests/
├── frontend/
│   ├── package.json, vite.config.ts, tsconfig.json, tailwind.config.js, postcss.config.js, index.html
│   ├── src/
│   │   ├── main.tsx, App.tsx, index.css
│   │   ├── routes/{Dashboard.tsx, ProjectDetails.tsx, Clients.tsx}
│   │   ├── components/layout/{Sidebar.tsx, Workspace.tsx, DetailsPane.tsx}
│   │   ├── components/ui/{Badge.tsx, Skeleton.tsx, Accordion.tsx, AvatarStack.tsx}
│   │   ├── components/project/{ProjectHeader.tsx, TaskRow.tsx, ReadmePreview.tsx, WarrantyAlert.tsx}
│   │   ├── api/{client.ts, projects.ts, clients.ts, tasks.ts}
│   │   ├── hooks/{useProjects.ts, useProjectDetails.ts, useClients.ts}
│   │   ├── types/{project.ts, client.ts, task.ts}
│   │   └── lib/{format.ts, dates.ts}
│   └── tests/
│       ├── setup.ts
│       ├── mocks/{handlers.ts, server.ts}
│       └── components/*.test.tsx
└── docs/ (existing)
```

---

## Phase 0 — Repo & Solution Bootstrap

**Agent:** `claude` (no domain skill needed)
**Skill:** none
**Compile gate:** `git status` clean after commit.

**Files:**
- Create: `.gitignore`, `README.md`, `DevCRM.sln`
- Create: empty folders `backend/src`, `backend/tests`, `frontend`

- [ ] **Step 1:** Init git repo and configure default branch.
```bash
git init -b main
```

- [ ] **Step 2:** Write `.gitignore` covering .NET, Node, Vite, VS, Rider, OS junk. Use the standard GitHub templates concatenated (VisualStudio + Node).

- [ ] **Step 3:** Write `README.md` with one-line description and "see docs/" pointer.

- [ ] **Step 4:** Create empty solution.
```bash
dotnet new sln -n DevCRM -o .
mkdir backend/src backend/tests frontend
```

- [ ] **Step 5:** Create GitHub repo and push.
```bash
gh repo create DevCRM --private --source . --remote origin
git add .gitignore README.md DevCRM.sln
git commit -m "chore: bootstrap repo and empty solution"
git push -u origin main
```

- [ ] **Step 6:** Verify: `git log --oneline` shows one commit; `gh repo view` returns repo.

---

## Phase 1 — Domain Layer (Entities + Value Rules)

**Agent:** `claude` with `devcrm-architect` + `devcrm-developer` skills loaded.
**Skill invocation:** Architect reviews entity design before code; developer implements.
**Compile gate:** `dotnet build backend/src/DevCRM.Domain`
**Test gate:** `dotnet test backend/tests/DevCRM.Domain.Tests`

**Files:**
- Create: `backend/src/DevCRM.Domain/DevCRM.Domain.csproj`
- Create: `backend/src/DevCRM.Domain/Entities/Client.cs`
- Create: `backend/src/DevCRM.Domain/Entities/Project.cs`
- Create: `backend/src/DevCRM.Domain/Entities/ProjectTask.cs`
- Create: `backend/src/DevCRM.Domain/Enums/TaskGroupType.cs`
- Create: `backend/src/DevCRM.Domain/Enums/TaskCategory.cs`
- Create: `backend/tests/DevCRM.Domain.Tests/DevCRM.Domain.Tests.csproj`
- Create: `backend/tests/DevCRM.Domain.Tests/ProjectTests.cs`

- [ ] **Step 1:** Scaffold projects and add to solution.
```bash
dotnet new classlib -n DevCRM.Domain -o backend/src/DevCRM.Domain -f net8.0
dotnet new xunit -n DevCRM.Domain.Tests -o backend/tests/DevCRM.Domain.Tests -f net8.0
dotnet sln add backend/src/DevCRM.Domain backend/tests/DevCRM.Domain.Tests
dotnet add backend/tests/DevCRM.Domain.Tests reference backend/src/DevCRM.Domain
dotnet add backend/tests/DevCRM.Domain.Tests package FluentAssertions
```

- [ ] **Step 2:** Write failing test `ProjectTests.cs`:
```csharp
using FluentAssertions;
using DevCRM.Domain.Entities;

namespace DevCRM.Domain.Tests;

public class ProjectTests
{
    [Fact]
    public void WarrantyEndDate_Should_Be_EndDate_Plus_3_Months()
    {
        var project = new Project { EndDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) };
        project.WarrantyEndDate.Should().Be(new DateTime(2026, 4, 1, 0, 0, 0, DateTimeKind.Utc));
    }

    [Fact]
    public void HostingRenewalDate_Should_Be_EndDate_Plus_1_Year()
    {
        var project = new Project { EndDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) };
        project.HostingRenewalDate.Should().Be(new DateTime(2027, 1, 1, 0, 0, 0, DateTimeKind.Utc));
    }
}
```

- [ ] **Step 3:** Run `dotnet test backend/tests/DevCRM.Domain.Tests`. Expected: FAIL (class not exists).

- [ ] **Step 4:** Create enums.
```csharp
// TaskGroupType.cs
namespace DevCRM.Domain.Enums;
public enum TaskGroupType { Milestone, WarrantyPending, PostWarranty }

// TaskCategory.cs
namespace DevCRM.Domain.Enums;
public enum TaskCategory { Sales, Dev, Design, Ops }
```

- [ ] **Step 5:** Create entities.
```csharp
// Client.cs
namespace DevCRM.Domain.Entities;
public class Client
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string ContactNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<Project> Projects { get; set; } = new List<Project>();
}

// Project.cs
namespace DevCRM.Domain.Entities;
public class Project
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ClientId { get; set; }
    public Client Client { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? DriveLink { get; set; }
    public string? GitHubRepoUrl { get; set; }
    public string HostingProvider { get; set; } = string.Empty;
    public string? ExternalDatabase { get; set; }
    public bool IsActive { get; set; } = true;
    public ICollection<ProjectTask> Tasks { get; set; } = new List<ProjectTask>();

    public DateTime WarrantyEndDate => EndDate.AddMonths(3);
    public DateTime HostingRenewalDate => EndDate.AddYears(1);
}

// ProjectTask.cs
using DevCRM.Domain.Enums;
namespace DevCRM.Domain.Entities;
public class ProjectTask
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
    public TaskCategory Category { get; set; }
    public TaskGroupType GroupType { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
```

- [ ] **Step 6:** Run `dotnet test backend/tests/DevCRM.Domain.Tests`. Expected: PASS (2 tests).

- [ ] **Step 7:** Compile gate: `dotnet build`. Expected: exit 0.

- [ ] **Step 8:** Commit + push.
```bash
git add backend/ DevCRM.sln
git commit -m "feat(domain): add Client, Project, ProjectTask entities with warranty/hosting computed dates"
git push
```

---

## Phase 2 — Application Layer (DTOs, CQRS, Validation)

**Agent:** `claude` with `devcrm-developer` skill loaded.
**Compile gate:** `dotnet build backend/src/DevCRM.Application`
**Test gate:** `dotnet test backend/tests/DevCRM.Application.Tests`

**Files:**
- Create: `backend/src/DevCRM.Application/DevCRM.Application.csproj`
- Create: `backend/src/DevCRM.Application/DTOs/{ClientDto.cs, ProjectDto.cs, ProjectDetailsDto.cs, TaskDto.cs, CreateProjectDto.cs, CreateClientDto.cs}`
- Create: `backend/src/DevCRM.Application/Interfaces/{IApplicationDbContext.cs, IGitHubReadmeService.cs}`
- Create: `backend/src/DevCRM.Application/Features/Projects/Commands/CreateProjectCommand.cs`
- Create: `backend/src/DevCRM.Application/Features/Projects/Queries/GetProjectByIdQuery.cs`
- Create: `backend/src/DevCRM.Application/Features/Projects/Queries/GetProjectsQuery.cs`
- Create: `backend/src/DevCRM.Application/Features/Projects/Validators/CreateProjectValidator.cs`
- Create: `backend/src/DevCRM.Application/Mapping/ApplicationMappingProfile.cs`
- Create: `backend/src/DevCRM.Application/DependencyInjection.cs`
- Create: `backend/tests/DevCRM.Application.Tests/DevCRM.Application.Tests.csproj`
- Create: `backend/tests/DevCRM.Application.Tests/Projects/CreateProjectValidatorTests.cs`
- Create: `backend/tests/DevCRM.Application.Tests/Projects/GetProjectByIdHandlerTests.cs`

- [ ] **Step 1:** Scaffold + packages.
```bash
dotnet new classlib -n DevCRM.Application -o backend/src/DevCRM.Application -f net8.0
dotnet new xunit -n DevCRM.Application.Tests -o backend/tests/DevCRM.Application.Tests -f net8.0
dotnet sln add backend/src/DevCRM.Application backend/tests/DevCRM.Application.Tests
dotnet add backend/src/DevCRM.Application reference backend/src/DevCRM.Domain
dotnet add backend/src/DevCRM.Application package MediatR
dotnet add backend/src/DevCRM.Application package FluentValidation
dotnet add backend/src/DevCRM.Application package FluentValidation.DependencyInjectionExtensions
dotnet add backend/src/DevCRM.Application package AutoMapper
dotnet add backend/src/DevCRM.Application package Microsoft.EntityFrameworkCore --version 8.0.10
dotnet add backend/tests/DevCRM.Application.Tests reference backend/src/DevCRM.Application
dotnet add backend/tests/DevCRM.Application.Tests package FluentAssertions
dotnet add backend/tests/DevCRM.Application.Tests package Moq
dotnet add backend/tests/DevCRM.Application.Tests package Microsoft.EntityFrameworkCore.InMemory --version 8.0.10
```

- [ ] **Step 2:** Create DTOs (mirror `desing.md §3`).
```csharp
// ProjectDetailsDto.cs
namespace DevCRM.Application.DTOs;
public class ProjectDetailsDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string ClientName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string PriceFormatted => Price.ToString("C0");
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime WarrantyEndDate { get; set; }
    public DateTime HostingRenewalDate { get; set; }
    public int DaysLeftForWarranty { get; set; }
    public string? DriveLink { get; set; }
    public string? GitHubRepoUrl { get; set; }
    public string HostingProvider { get; set; } = string.Empty;
    public string? ExternalDatabase { get; set; }
    public List<TaskDto> Tasks { get; set; } = new();
}

// TaskDto.cs
namespace DevCRM.Application.DTOs;
public class TaskDto
{
    public Guid Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
    public string Category { get; set; } = string.Empty;
    public string GroupType { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    public List<string> AssigneeAvatarUrls { get; set; } = new();
}

// CreateProjectDto.cs
namespace DevCRM.Application.DTOs;
public class CreateProjectDto
{
    public Guid? ClientId { get; set; }
    public CreateClientDto? NewClient { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? DriveLink { get; set; }
    public string? GitHubRepoUrl { get; set; }
    public string HostingProvider { get; set; } = string.Empty;
    public string? ExternalDatabase { get; set; }
}

// CreateClientDto.cs
namespace DevCRM.Application.DTOs;
public class CreateClientDto
{
    public string Name { get; set; } = string.Empty;
    public string ContactNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
}

// ClientDto.cs
namespace DevCRM.Application.DTOs;
public class ClientDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ContactNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
}

// ProjectDto.cs (list rows on dashboard)
namespace DevCRM.Application.DTOs;
public class ProjectDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string ClientName { get; set; } = string.Empty;
    public DateTime EndDate { get; set; }
    public DateTime WarrantyEndDate { get; set; }
    public DateTime HostingRenewalDate { get; set; }
    public int DaysLeftForWarranty { get; set; }
    public int DaysLeftForHostingRenewal { get; set; }
    public bool IsActive { get; set; }
}
```

- [ ] **Step 3:** Create interfaces.
```csharp
// IApplicationDbContext.cs
using DevCRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;
namespace DevCRM.Application.Interfaces;
public interface IApplicationDbContext
{
    DbSet<Client> Clients { get; }
    DbSet<Project> Projects { get; }
    DbSet<ProjectTask> ProjectTasks { get; }
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}

// IGitHubReadmeService.cs
namespace DevCRM.Application.Interfaces;
public interface IGitHubReadmeService
{
    Task<string?> GetReadmeMarkdownAsync(string repoUrl, CancellationToken ct = default);
}
```

- [ ] **Step 4:** Write failing validator test.
```csharp
// CreateProjectValidatorTests.cs
using DevCRM.Application.DTOs;
using DevCRM.Application.Features.Projects.Validators;
using FluentAssertions;
namespace DevCRM.Application.Tests.Projects;
public class CreateProjectValidatorTests
{
    private readonly CreateProjectValidator _sut = new();

    [Fact]
    public void Should_Fail_When_Title_Empty()
    {
        var dto = new CreateProjectDto { Title = "", HostingProvider = "Vercel", StartDate = DateTime.UtcNow, EndDate = DateTime.UtcNow.AddDays(30), Price = 1000, ClientId = Guid.NewGuid() };
        var result = _sut.Validate(dto);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateProjectDto.Title));
    }

    [Fact]
    public void Should_Fail_When_EndDate_Before_StartDate()
    {
        var dto = new CreateProjectDto { Title = "X", HostingProvider = "Vercel", StartDate = DateTime.UtcNow, EndDate = DateTime.UtcNow.AddDays(-1), Price = 1000, ClientId = Guid.NewGuid() };
        _sut.Validate(dto).IsValid.Should().BeFalse();
    }

    [Fact]
    public void Should_Fail_When_No_Client_Provided()
    {
        var dto = new CreateProjectDto { Title = "X", HostingProvider = "Vercel", StartDate = DateTime.UtcNow, EndDate = DateTime.UtcNow.AddDays(30), Price = 1000 };
        _sut.Validate(dto).IsValid.Should().BeFalse();
    }
}
```

- [ ] **Step 5:** Run tests → FAIL (validator missing).

- [ ] **Step 6:** Implement validator.
```csharp
// CreateProjectValidator.cs
using DevCRM.Application.DTOs;
using FluentValidation;
namespace DevCRM.Application.Features.Projects.Validators;
public class CreateProjectValidator : AbstractValidator<CreateProjectDto>
{
    public CreateProjectValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(150);
        RuleFor(x => x.HostingProvider).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Price).GreaterThanOrEqualTo(0);
        RuleFor(x => x.EndDate).GreaterThanOrEqualTo(x => x.StartDate)
            .WithMessage("EndDate must be on/after StartDate");
        RuleFor(x => x).Must(x => x.ClientId.HasValue || x.NewClient is not null)
            .WithMessage("Either ClientId or NewClient must be supplied");
        When(x => x.NewClient is not null, () =>
        {
            RuleFor(x => x.NewClient!.Name).NotEmpty();
            RuleFor(x => x.NewClient!.ContactNumber).NotEmpty();
        });
    }
}
```

- [ ] **Step 7:** Implement commands/queries.
```csharp
// CreateProjectCommand.cs
using DevCRM.Application.DTOs;
using MediatR;
namespace DevCRM.Application.Features.Projects.Commands;
public record CreateProjectCommand(CreateProjectDto Dto) : IRequest<Guid>;

public class CreateProjectHandler : IRequestHandler<CreateProjectCommand, Guid>
{
    private readonly Interfaces.IApplicationDbContext _db;
    public CreateProjectHandler(Interfaces.IApplicationDbContext db) => _db = db;

    public async Task<Guid> Handle(CreateProjectCommand request, CancellationToken ct)
    {
        var dto = request.Dto;
        Guid clientId;
        if (dto.ClientId.HasValue) clientId = dto.ClientId.Value;
        else
        {
            var client = new Domain.Entities.Client
            {
                Name = dto.NewClient!.Name,
                ContactNumber = dto.NewClient.ContactNumber,
                Email = dto.NewClient.Email
            };
            _db.Clients.Add(client);
            clientId = client.Id;
        }
        var project = new Domain.Entities.Project
        {
            ClientId = clientId,
            Title = dto.Title,
            Price = dto.Price,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            DriveLink = dto.DriveLink,
            GitHubRepoUrl = dto.GitHubRepoUrl,
            HostingProvider = dto.HostingProvider,
            ExternalDatabase = dto.ExternalDatabase
        };
        _db.Projects.Add(project);
        await _db.SaveChangesAsync(ct);
        return project.Id;
    }
}

// GetProjectByIdQuery.cs
using DevCRM.Application.DTOs;
using DevCRM.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
namespace DevCRM.Application.Features.Projects.Queries;
public record GetProjectByIdQuery(Guid Id) : IRequest<ProjectDetailsDto?>;

public class GetProjectByIdHandler : IRequestHandler<GetProjectByIdQuery, ProjectDetailsDto?>
{
    private readonly IApplicationDbContext _db;
    public GetProjectByIdHandler(IApplicationDbContext db) => _db = db;

    public async Task<ProjectDetailsDto?> Handle(GetProjectByIdQuery req, CancellationToken ct)
    {
        var p = await _db.Projects
            .Include(x => x.Client)
            .Include(x => x.Tasks)
            .FirstOrDefaultAsync(x => x.Id == req.Id, ct);
        if (p is null) return null;
        return new ProjectDetailsDto
        {
            Id = p.Id,
            Title = p.Title,
            ClientName = p.Client.Name,
            Price = p.Price,
            StartDate = p.StartDate,
            EndDate = p.EndDate,
            WarrantyEndDate = p.WarrantyEndDate,
            HostingRenewalDate = p.HostingRenewalDate,
            DaysLeftForWarranty = (int)(p.WarrantyEndDate - DateTime.UtcNow).TotalDays,
            DriveLink = p.DriveLink,
            GitHubRepoUrl = p.GitHubRepoUrl,
            HostingProvider = p.HostingProvider,
            ExternalDatabase = p.ExternalDatabase,
            Tasks = p.Tasks.Select(t => new TaskDto
            {
                Id = t.Id,
                Description = t.Description,
                DueDate = t.DueDate,
                Category = t.Category.ToString(),
                GroupType = t.GroupType.ToString(),
                IsCompleted = t.IsCompleted
            }).ToList()
        };
    }
}

// GetProjectsQuery.cs
using DevCRM.Application.DTOs;
using DevCRM.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
namespace DevCRM.Application.Features.Projects.Queries;
public record GetProjectsQuery() : IRequest<List<ProjectDto>>;

public class GetProjectsHandler : IRequestHandler<GetProjectsQuery, List<ProjectDto>>
{
    private readonly IApplicationDbContext _db;
    public GetProjectsHandler(IApplicationDbContext db) => _db = db;

    public async Task<List<ProjectDto>> Handle(GetProjectsQuery _, CancellationToken ct)
    {
        var list = await _db.Projects.Include(p => p.Client).ToListAsync(ct);
        var now = DateTime.UtcNow;
        return list.Select(p => new ProjectDto
        {
            Id = p.Id,
            Title = p.Title,
            ClientName = p.Client.Name,
            EndDate = p.EndDate,
            WarrantyEndDate = p.WarrantyEndDate,
            HostingRenewalDate = p.HostingRenewalDate,
            DaysLeftForWarranty = (int)(p.WarrantyEndDate - now).TotalDays,
            DaysLeftForHostingRenewal = (int)(p.HostingRenewalDate - now).TotalDays,
            IsActive = p.IsActive
        })
        .OrderBy(p => p.DaysLeftForWarranty < 30 ? 0 : 1)
        .ThenBy(p => p.DaysLeftForHostingRenewal)
        .ToList();
    }
}
```

- [ ] **Step 8:** DependencyInjection registration.
```csharp
// DependencyInjection.cs
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;
namespace DevCRM.Application;
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var asm = Assembly.GetExecutingAssembly();
        services.AddMediatR(c => c.RegisterServicesFromAssembly(asm));
        services.AddValidatorsFromAssembly(asm);
        services.AddAutoMapper(asm);
        return services;
    }
}
```

- [ ] **Step 9:** Write handler test using InMemory provider.
```csharp
// GetProjectByIdHandlerTests.cs
using DevCRM.Application.Features.Projects.Queries;
using DevCRM.Application.Interfaces;
using DevCRM.Domain.Entities;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
namespace DevCRM.Application.Tests.Projects;

public class GetProjectByIdHandlerTests
{
    private class TestDb : DbContext, IApplicationDbContext
    {
        public TestDb(DbContextOptions o) : base(o) { }
        public DbSet<Client> Clients => Set<Client>();
        public DbSet<Project> Projects => Set<Project>();
        public DbSet<ProjectTask> ProjectTasks => Set<ProjectTask>();
    }

    [Fact]
    public async Task Returns_Null_When_Project_Not_Found()
    {
        var opts = new DbContextOptionsBuilder<TestDb>().UseInMemoryDatabase("test-notfound").Options;
        await using var db = new TestDb(opts);
        var sut = new GetProjectByIdHandler(db);
        var result = await sut.Handle(new GetProjectByIdQuery(Guid.NewGuid()), default);
        result.Should().BeNull();
    }

    [Fact]
    public async Task Returns_Dto_With_Warranty_And_Hosting_Dates()
    {
        var opts = new DbContextOptionsBuilder<TestDb>().UseInMemoryDatabase("test-ok").Options;
        await using var db = new TestDb(opts);
        var client = new Client { Name = "Acme", ContactNumber = "+52" };
        var project = new Project
        {
            Client = client, ClientId = client.Id, Title = "Site",
            StartDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            EndDate = new DateTime(2026, 2, 1, 0, 0, 0, DateTimeKind.Utc),
            HostingProvider = "Vercel", Price = 1000
        };
        db.Clients.Add(client); db.Projects.Add(project);
        await db.SaveChangesAsync();
        var sut = new GetProjectByIdHandler(db);
        var dto = await sut.Handle(new GetProjectByIdQuery(project.Id), default);
        dto.Should().NotBeNull();
        dto!.WarrantyEndDate.Should().Be(new DateTime(2026, 5, 1, 0, 0, 0, DateTimeKind.Utc));
        dto.HostingRenewalDate.Should().Be(new DateTime(2027, 2, 1, 0, 0, 0, DateTimeKind.Utc));
    }
}
```

- [ ] **Step 10:** `dotnet test` → all green.

- [ ] **Step 11:** `dotnet build` → exit 0.

- [ ] **Step 12:** Commit + push.
```bash
git add backend/ DevCRM.sln
git commit -m "feat(application): add CQRS handlers, DTOs, validators for Projects"
git push
```

---

## Phase 3 — Infrastructure Layer (EF Core + SQL Server Express + GitHub Service)

**Agent:** `claude` with `devcrm-developer` skill.
**Compile gate:** `dotnet build backend/src/DevCRM.Infrastructure`
**Test gate:** `dotnet test backend/tests/DevCRM.Infrastructure.Tests`

**Files:**
- Create: `backend/src/DevCRM.Infrastructure/DevCRM.Infrastructure.csproj`
- Create: `backend/src/DevCRM.Infrastructure/Persistence/ApplicationDbContext.cs`
- Create: `backend/src/DevCRM.Infrastructure/Persistence/Configurations/{ClientConfiguration.cs, ProjectConfiguration.cs, ProjectTaskConfiguration.cs}`
- Create: `backend/src/DevCRM.Infrastructure/Services/GitHubReadmeService.cs`
- Create: `backend/src/DevCRM.Infrastructure/DependencyInjection.cs`
- Create: `backend/tests/DevCRM.Infrastructure.Tests/Services/GitHubReadmeServiceTests.cs`

- [ ] **Step 1:** Scaffold + packages.
```bash
dotnet new classlib -n DevCRM.Infrastructure -o backend/src/DevCRM.Infrastructure -f net8.0
dotnet new xunit -n DevCRM.Infrastructure.Tests -o backend/tests/DevCRM.Infrastructure.Tests -f net8.0
dotnet sln add backend/src/DevCRM.Infrastructure backend/tests/DevCRM.Infrastructure.Tests
dotnet add backend/src/DevCRM.Infrastructure reference backend/src/DevCRM.Application backend/src/DevCRM.Domain
dotnet add backend/src/DevCRM.Infrastructure package Microsoft.EntityFrameworkCore --version 8.0.10
dotnet add backend/src/DevCRM.Infrastructure package Microsoft.EntityFrameworkCore.SqlServer --version 8.0.10
dotnet add backend/src/DevCRM.Infrastructure package Microsoft.EntityFrameworkCore.Design --version 8.0.10
dotnet add backend/tests/DevCRM.Infrastructure.Tests reference backend/src/DevCRM.Infrastructure
dotnet add backend/tests/DevCRM.Infrastructure.Tests package FluentAssertions
dotnet add backend/tests/DevCRM.Infrastructure.Tests package Moq
dotnet add backend/tests/DevCRM.Infrastructure.Tests package RichardSzalay.MockHttp
```

- [ ] **Step 2:** ApplicationDbContext.
```csharp
using DevCRM.Application.Interfaces;
using DevCRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;
namespace DevCRM.Infrastructure.Persistence;
public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> opts) : base(opts) { }
    public DbSet<Client> Clients => Set<Client>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectTask> ProjectTasks => Set<ProjectTask>();
    protected override void OnModelCreating(ModelBuilder b)
    {
        b.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        base.OnModelCreating(b);
    }
}
```

- [ ] **Step 3:** EF configurations (one per entity). Match `pbl.md §3` column types.
```csharp
// ClientConfiguration.cs
using DevCRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
namespace DevCRM.Infrastructure.Persistence.Configurations;
public class ClientConfiguration : IEntityTypeConfiguration<Client>
{
    public void Configure(EntityTypeBuilder<Client> e)
    {
        e.ToTable("Clients");
        e.HasKey(x => x.Id);
        e.Property(x => x.Name).HasMaxLength(150).IsRequired();
        e.Property(x => x.ContactNumber).HasMaxLength(20).IsRequired();
        e.Property(x => x.Email).HasMaxLength(100);
        e.Property(x => x.CreatedAt).IsRequired();
    }
}

// ProjectConfiguration.cs
using DevCRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
namespace DevCRM.Infrastructure.Persistence.Configurations;
public class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> e)
    {
        e.ToTable("Projects");
        e.HasKey(x => x.Id);
        e.Property(x => x.Title).HasMaxLength(150).IsRequired();
        e.Property(x => x.Price).HasColumnType("decimal(18,2)").IsRequired();
        e.Property(x => x.DriveLink).HasMaxLength(2048);
        e.Property(x => x.GitHubRepoUrl).HasMaxLength(2048);
        e.Property(x => x.HostingProvider).HasMaxLength(100).IsRequired();
        e.Property(x => x.ExternalDatabase).HasMaxLength(100);
        e.Property(x => x.IsActive).IsRequired();
        e.Ignore(x => x.WarrantyEndDate);
        e.Ignore(x => x.HostingRenewalDate);
        e.HasOne(x => x.Client).WithMany(c => c.Projects).HasForeignKey(x => x.ClientId).OnDelete(DeleteBehavior.Restrict);
    }
}

// ProjectTaskConfiguration.cs
using DevCRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
namespace DevCRM.Infrastructure.Persistence.Configurations;
public class ProjectTaskConfiguration : IEntityTypeConfiguration<ProjectTask>
{
    public void Configure(EntityTypeBuilder<ProjectTask> e)
    {
        e.ToTable("ProjectTasks");
        e.HasKey(x => x.Id);
        e.Property(x => x.Description).HasMaxLength(500).IsRequired();
        e.Property(x => x.Category).HasConversion<string>().HasMaxLength(50);
        e.Property(x => x.GroupType).HasConversion<string>().HasMaxLength(50);
        e.HasOne(x => x.Project).WithMany(p => p.Tasks).HasForeignKey(x => x.ProjectId).OnDelete(DeleteBehavior.Cascade);
    }
}
```

- [ ] **Step 4:** Write failing GitHub readme test (use `MockHttp`).
```csharp
// GitHubReadmeServiceTests.cs
using System.Net;
using DevCRM.Infrastructure.Services;
using FluentAssertions;
using RichardSzalay.MockHttp;
namespace DevCRM.Infrastructure.Tests.Services;

public class GitHubReadmeServiceTests
{
    [Fact]
    public async Task Returns_Readme_Markdown_When_Repo_Url_Valid()
    {
        var mockHttp = new MockHttpMessageHandler();
        mockHttp.When("https://api.github.com/repos/owner/repo/readme")
                .Respond("application/vnd.github.raw", "# Hello\nfrom test");
        var client = mockHttp.ToHttpClient();
        client.BaseAddress = new Uri("https://api.github.com/");
        var sut = new GitHubReadmeService(client);
        var md = await sut.GetReadmeMarkdownAsync("https://github.com/owner/repo");
        md.Should().StartWith("# Hello");
    }

    [Fact]
    public async Task Returns_Null_When_404()
    {
        var mockHttp = new MockHttpMessageHandler();
        mockHttp.When("https://api.github.com/repos/owner/missing/readme")
                .Respond(HttpStatusCode.NotFound);
        var client = mockHttp.ToHttpClient();
        client.BaseAddress = new Uri("https://api.github.com/");
        var sut = new GitHubReadmeService(client);
        var md = await sut.GetReadmeMarkdownAsync("https://github.com/owner/missing");
        md.Should().BeNull();
    }
}
```

- [ ] **Step 5:** Run → FAIL.

- [ ] **Step 6:** Implement service.
```csharp
// GitHubReadmeService.cs
using System.Net.Http.Headers;
using DevCRM.Application.Interfaces;
namespace DevCRM.Infrastructure.Services;
public class GitHubReadmeService : IGitHubReadmeService
{
    private readonly HttpClient _http;
    public GitHubReadmeService(HttpClient http) => _http = http;

    public async Task<string?> GetReadmeMarkdownAsync(string repoUrl, CancellationToken ct = default)
    {
        var slug = ExtractOwnerRepo(repoUrl);
        if (slug is null) return null;
        using var req = new HttpRequestMessage(HttpMethod.Get, $"repos/{slug}/readme");
        req.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/vnd.github.raw"));
        using var res = await _http.SendAsync(req, ct);
        if (!res.IsSuccessStatusCode) return null;
        return await res.Content.ReadAsStringAsync(ct);
    }

    private static string? ExtractOwnerRepo(string url)
    {
        if (string.IsNullOrWhiteSpace(url)) return null;
        var clean = url.Replace("https://github.com/", "").TrimEnd('/');
        var parts = clean.Split('/');
        return parts.Length >= 2 ? $"{parts[0]}/{parts[1]}" : null;
    }
}
```

- [ ] **Step 7:** DependencyInjection.
```csharp
// DependencyInjection.cs
using DevCRM.Application.Interfaces;
using DevCRM.Infrastructure.Persistence;
using DevCRM.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
namespace DevCRM.Infrastructure;
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration cfg)
    {
        services.AddDbContext<ApplicationDbContext>(o =>
            o.UseSqlServer(cfg.GetConnectionString("DefaultConnection")));
        services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<ApplicationDbContext>());
        services.AddHttpClient<IGitHubReadmeService, GitHubReadmeService>(c =>
        {
            c.BaseAddress = new Uri("https://api.github.com/");
            c.DefaultRequestHeaders.UserAgent.ParseAdd("DevCRM/1.0");
        });
        return services;
    }
}
```

- [ ] **Step 8:** Run `dotnet test` → green. Run `dotnet build` → exit 0.

- [ ] **Step 9:** Commit + push.
```bash
git add backend/ DevCRM.sln
git commit -m "feat(infrastructure): add EF Core SqlServer DbContext, configs, and GitHub README service"
git push
```

---

## Phase 4 — WebAPI Layer + Migrations + Manual Smoke

**Agent:** `claude` with `devcrm-developer` skill.
**Compile gate:** `dotnet build backend/src/DevCRM.WebAPI`
**Test gate:** `dotnet test backend/tests/DevCRM.WebAPI.Tests`
**DB gate:** `dotnet ef database update` succeeds against SQL Server Express.

**Files:**
- Create: `backend/src/DevCRM.WebAPI/DevCRM.WebAPI.csproj`
- Create: `backend/src/DevCRM.WebAPI/Program.cs`
- Create: `backend/src/DevCRM.WebAPI/Middleware/ExceptionHandlingMiddleware.cs`
- Create: `backend/src/DevCRM.WebAPI/Controllers/{ProjectsController.cs, ClientsController.cs, TasksController.cs}`
- Create: `backend/src/DevCRM.WebAPI/appsettings.json`
- Create: `backend/src/DevCRM.WebAPI/appsettings.Development.json`
- Create: `backend/src/DevCRM.Infrastructure/Persistence/Migrations/` (generated)
- Create: `backend/tests/DevCRM.WebAPI.Tests/Controllers/ProjectsControllerTests.cs`

- [ ] **Step 1:** Scaffold WebAPI.
```bash
dotnet new webapi -n DevCRM.WebAPI -o backend/src/DevCRM.WebAPI -f net8.0 --use-controllers
dotnet new xunit -n DevCRM.WebAPI.Tests -o backend/tests/DevCRM.WebAPI.Tests -f net8.0
dotnet sln add backend/src/DevCRM.WebAPI backend/tests/DevCRM.WebAPI.Tests
dotnet add backend/src/DevCRM.WebAPI reference backend/src/DevCRM.Application backend/src/DevCRM.Infrastructure
dotnet add backend/src/DevCRM.WebAPI package Swashbuckle.AspNetCore
dotnet add backend/tests/DevCRM.WebAPI.Tests reference backend/src/DevCRM.WebAPI
dotnet add backend/tests/DevCRM.WebAPI.Tests package Microsoft.AspNetCore.Mvc.Testing --version 8.0.10
dotnet add backend/tests/DevCRM.WebAPI.Tests package FluentAssertions
dotnet add backend/tests/DevCRM.WebAPI.Tests package Microsoft.EntityFrameworkCore.InMemory --version 8.0.10
```

- [ ] **Step 2:** `appsettings.json` connection string.
```json
{
  "Logging": { "LogLevel": { "Default": "Information" } },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Server=.\\SQLEXPRESS;Database=DevCRM;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

- [ ] **Step 3:** Program.cs wiring.
```csharp
using DevCRM.Application;
using DevCRM.Infrastructure;
using DevCRM.WebAPI.Middleware;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.WithOrigins("http://localhost:5173").AllowAnyHeader().AllowAnyMethod()));
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();
app.UseMiddleware<ExceptionHandlingMiddleware>();
if (app.Environment.IsDevelopment()) { app.UseSwagger(); app.UseSwaggerUI(); }
app.UseCors();
app.MapControllers();
app.Run();

public partial class Program { }
```

- [ ] **Step 4:** Exception middleware.
```csharp
using System.Net;
using System.Text.Json;
using FluentValidation;
namespace DevCRM.WebAPI.Middleware;
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    public ExceptionHandlingMiddleware(RequestDelegate next) => _next = next;
    public async Task InvokeAsync(HttpContext ctx)
    {
        try { await _next(ctx); }
        catch (ValidationException vex)
        {
            ctx.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            ctx.Response.ContentType = "application/json";
            await ctx.Response.WriteAsync(JsonSerializer.Serialize(new { errors = vex.Errors.Select(e => new { e.PropertyName, e.ErrorMessage }) }));
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            ctx.Response.ContentType = "application/json";
            await ctx.Response.WriteAsync(JsonSerializer.Serialize(new { error = ex.Message }));
        }
    }
}
```

- [ ] **Step 5:** Controllers.
```csharp
// ProjectsController.cs
using DevCRM.Application.DTOs;
using DevCRM.Application.Features.Projects.Commands;
using DevCRM.Application.Features.Projects.Queries;
using DevCRM.Application.Interfaces;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Mvc;
namespace DevCRM.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IValidator<CreateProjectDto> _validator;
    private readonly IGitHubReadmeService _readme;

    public ProjectsController(IMediator m, IValidator<CreateProjectDto> v, IGitHubReadmeService r)
    { _mediator = m; _validator = v; _readme = r; }

    [HttpGet] public async Task<IActionResult> List() => Ok(await _mediator.Send(new GetProjectsQuery()));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var p = await _mediator.Send(new GetProjectByIdQuery(id));
        return p is null ? NotFound() : Ok(p);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProjectDto dto)
    {
        await _validator.ValidateAndThrowAsync(dto);
        var id = await _mediator.Send(new CreateProjectCommand(dto));
        return CreatedAtAction(nameof(Get), new { id }, new { id });
    }

    [HttpGet("{id:guid}/readme")]
    public async Task<IActionResult> Readme(Guid id)
    {
        var p = await _mediator.Send(new GetProjectByIdQuery(id));
        if (p is null) return NotFound();
        if (string.IsNullOrWhiteSpace(p.GitHubRepoUrl)) return Ok(new { markdown = (string?)null });
        var md = await _readme.GetReadmeMarkdownAsync(p.GitHubRepoUrl);
        return Ok(new { markdown = md });
    }
}

// ClientsController.cs (skeleton for list)
using MediatR;
using Microsoft.AspNetCore.Mvc;
using DevCRM.Application.DTOs;
using DevCRM.Application.Interfaces;
using Microsoft.EntityFrameworkCore;
namespace DevCRM.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClientsController : ControllerBase
{
    private readonly IApplicationDbContext _db;
    public ClientsController(IApplicationDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> List() =>
        Ok(await _db.Clients.Select(c => new ClientDto
        {
            Id = c.Id, Name = c.Name, ContactNumber = c.ContactNumber, Email = c.Email
        }).ToListAsync());
}

// TasksController.cs (toggle complete)
using MediatR;
using Microsoft.AspNetCore.Mvc;
using DevCRM.Application.Interfaces;
namespace DevCRM.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly IApplicationDbContext _db;
    public TasksController(IApplicationDbContext db) => _db = db;

    [HttpPatch("{id:guid}/toggle")]
    public async Task<IActionResult> Toggle(Guid id, CancellationToken ct)
    {
        var t = await _db.ProjectTasks.FindAsync(new object[] { id }, ct);
        if (t is null) return NotFound();
        t.IsCompleted = !t.IsCompleted;
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }
}
```

- [ ] **Step 6:** Add initial migration & apply to SQL Server Express.
```bash
dotnet tool install --global dotnet-ef --version 8.0.10
dotnet ef migrations add InitialCreate --project backend/src/DevCRM.Infrastructure --startup-project backend/src/DevCRM.WebAPI -o Persistence/Migrations
dotnet ef database update --project backend/src/DevCRM.Infrastructure --startup-project backend/src/DevCRM.WebAPI
```

- [ ] **Step 7:** Write WebAPI integration test using `WebApplicationFactory` with InMemory DB override.
```csharp
// ProjectsControllerTests.cs
using System.Net;
using DevCRM.Application.Interfaces;
using DevCRM.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
namespace DevCRM.WebAPI.Tests.Controllers;

public class ProjectsControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;
    public ProjectsControllerTests(WebApplicationFactory<Program> f)
    {
        _client = f.WithWebHostBuilder(b => b.ConfigureServices(s =>
        {
            var dbDesc = s.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
            if (dbDesc is not null) s.Remove(dbDesc);
            s.AddDbContext<ApplicationDbContext>(o => o.UseInMemoryDatabase("api-test"));
        })).CreateClient();
    }

    [Fact]
    public async Task GET_projects_returns_200_with_empty_list_initially()
    {
        var res = await _client.GetAsync("/api/projects");
        res.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GET_unknown_project_returns_404()
    {
        var res = await _client.GetAsync($"/api/projects/{Guid.NewGuid()}");
        res.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
```

- [ ] **Step 8:** `dotnet test` → all green. `dotnet build` → exit 0. `dotnet run --project backend/src/DevCRM.WebAPI` then hit `/swagger` in browser → confirm endpoints listed → kill server.

- [ ] **Step 9:** Commit + push.
```bash
git add backend/ DevCRM.sln
git commit -m "feat(webapi): controllers, swagger, SqlServer migrations, integration tests"
git push
```

---

## Phase 5 — Frontend Bootstrap (Vite + TS + Tailwind + Nexus tokens)

**Agent:** `claude` with `devcrm-ui` skill.
**Compile gate:** `npm run build` and `npx tsc --noEmit`
**Test gate:** none yet (next phase).

**Files:**
- Create: `frontend/package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`, `index.html`
- Create: `frontend/src/{main.tsx, App.tsx, index.css}`
- Create: `frontend/src/lib/format.ts`

- [ ] **Step 1:** Scaffold Vite app.
```bash
cd frontend
npm create vite@latest . -- --template react-ts
npm install
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
npm install react-router-dom@6 @tanstack/react-query@5 axios react-markdown remark-gfm
npm install -D @types/node
cd ..
```

- [ ] **Step 2:** `tailwind.config.js` — Nexus tokens.
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sidebar: '#1A1C29',
        appbg: '#F8F9FA',
        ink: '#2D3748',
        muted: '#718096'
      }
    }
  },
  plugins: []
};
```

- [ ] **Step 3:** `src/index.css`.
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body { @apply bg-appbg text-ink font-sans antialiased; }
```

- [ ] **Step 4:** `src/lib/format.ts`.
```ts
export const fmtCurrency = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

export const daysBetween = (a: Date, b: Date) =>
  Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
```

- [ ] **Step 5:** `src/main.tsx` and `src/App.tsx`.
```tsx
// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const qc = new QueryClient();
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <BrowserRouter><App /></BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

// App.tsx (placeholder routes; replaced in phase 7)
import { Routes, Route } from 'react-router-dom';
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<div className="p-6">DevCRM</div>} />
    </Routes>
  );
}
```

- [ ] **Step 6:** `npm run build && npx tsc --noEmit` → exit 0.

- [ ] **Step 7:** Commit + push.
```bash
git add frontend/
git commit -m "feat(frontend): Vite + React + TS scaffold with Tailwind Nexus tokens"
git push
```

---

## Phase 6 — Frontend API Client + Types + TanStack Query Hooks

**Agent:** `claude` with `devcrm-developer` skill.
**Compile gate:** `npx tsc --noEmit && npm run build`

**Files:**
- Create: `frontend/src/types/{project.ts, client.ts, task.ts}`
- Create: `frontend/src/api/{client.ts, projects.ts, clients.ts, tasks.ts}`
- Create: `frontend/src/hooks/{useProjects.ts, useProjectDetails.ts, useReadme.ts, useToggleTask.ts}`

- [ ] **Step 1:** Types matching backend DTOs.
```ts
// types/task.ts
export type TaskGroupType = 'Milestone' | 'WarrantyPending' | 'PostWarranty';
export type TaskCategory = 'Sales' | 'Dev' | 'Design' | 'Ops';
export interface TaskDto {
  id: string;
  description: string;
  dueDate?: string | null;
  category: TaskCategory;
  groupType: TaskGroupType;
  isCompleted: boolean;
  assigneeAvatarUrls: string[];
}

// types/client.ts
export interface ClientDto {
  id: string; name: string; contactNumber: string; email?: string | null;
}

// types/project.ts
import type { TaskDto } from './task';
export interface ProjectListItem {
  id: string; title: string; clientName: string; endDate: string;
  warrantyEndDate: string; hostingRenewalDate: string;
  daysLeftForWarranty: number; daysLeftForHostingRenewal: number;
  isActive: boolean;
}
export interface ProjectDetails {
  id: string; title: string; clientName: string;
  price: number; priceFormatted: string;
  startDate: string; endDate: string;
  warrantyEndDate: string; hostingRenewalDate: string; daysLeftForWarranty: number;
  driveLink?: string | null; gitHubRepoUrl?: string | null;
  hostingProvider: string; externalDatabase?: string | null;
  tasks: TaskDto[];
}
```

- [ ] **Step 2:** Axios client.
```ts
// api/client.ts
import axios from 'axios';
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});
```

- [ ] **Step 3:** Endpoints.
```ts
// api/projects.ts
import { api } from './client';
import type { ProjectListItem, ProjectDetails } from '../types/project';
export const fetchProjects = () => api.get<ProjectListItem[]>('/projects').then(r => r.data);
export const fetchProject = (id: string) => api.get<ProjectDetails>(`/projects/${id}`).then(r => r.data);
export const fetchReadme = (id: string) => api.get<{ markdown: string | null }>(`/projects/${id}/readme`).then(r => r.data);

// api/tasks.ts
import { api } from './client';
export const toggleTask = (id: string) => api.patch(`/tasks/${id}/toggle`).then(r => r.data);

// api/clients.ts
import { api } from './client';
import type { ClientDto } from '../types/client';
export const fetchClients = () => api.get<ClientDto[]>('/clients').then(r => r.data);
```

- [ ] **Step 4:** Hooks.
```ts
// hooks/useProjects.ts
import { useQuery } from '@tanstack/react-query';
import { fetchProjects } from '../api/projects';
export const useProjects = () =>
  useQuery({ queryKey: ['projects'], queryFn: fetchProjects });

// hooks/useProjectDetails.ts
import { useQuery } from '@tanstack/react-query';
import { fetchProject } from '../api/projects';
export const useProjectDetails = (id: string | undefined) =>
  useQuery({ queryKey: ['project', id], queryFn: () => fetchProject(id!), enabled: !!id });

// hooks/useReadme.ts
import { useQuery } from '@tanstack/react-query';
import { fetchReadme } from '../api/projects';
export const useReadme = (id: string | undefined) =>
  useQuery({ queryKey: ['readme', id], queryFn: () => fetchReadme(id!), enabled: !!id });

// hooks/useToggleTask.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleTask } from '../api/tasks';
export const useToggleTask = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: toggleTask,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project', projectId] })
  });
};
```

- [ ] **Step 5:** Compile gate → exit 0.

- [ ] **Step 6:** Commit + push.
```bash
git add frontend/
git commit -m "feat(frontend): typed API client and TanStack Query hooks"
git push
```

---

## Phase 7 — Layout + Reusable UI (Sidebar, Workspace, DetailsPane, Badge, Skeleton, Accordion, AvatarStack)

**Agent:** `claude` with `devcrm-ui` skill.
**Compile gate:** `npx tsc --noEmit && npm run build`

**Files:**
- Create: `frontend/src/components/layout/{Sidebar.tsx, Workspace.tsx, DetailsPane.tsx, AppShell.tsx}`
- Create: `frontend/src/components/ui/{Badge.tsx, Skeleton.tsx, Accordion.tsx, AvatarStack.tsx}`

- [ ] **Step 1:** `Badge.tsx`.
```tsx
type Variant = 'success' | 'warn' | 'muted' | 'info';
const map: Record<Variant, string> = {
  success: 'bg-emerald-50 text-emerald-600',
  warn: 'bg-amber-50 text-amber-600',
  muted: 'bg-purple-50 text-purple-600',
  info: 'bg-sky-50 text-sky-600'
};
export function Badge({ variant = 'info', children }: { variant?: Variant; children: React.ReactNode }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${map[variant]}`}>{children}</span>;
}
```

- [ ] **Step 2:** `Skeleton.tsx`, `Accordion.tsx`, `AvatarStack.tsx`.
```tsx
// Skeleton.tsx
export const Skeleton = ({ className = '' }: { className?: string }) =>
  <div className={`animate-pulse bg-slate-100 rounded-md ${className}`} />;

// Accordion.tsx
import { useState, ReactNode } from 'react';
export function Accordion({ title, count, children, defaultOpen = true }:
  { title: string; count?: number; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-100 rounded-xl bg-white mb-4">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 text-left">
        <span className="font-semibold text-slate-800">
          <span className="mr-2 text-emerald-500">{open ? '−' : '+'}</span>
          {title} {count !== undefined && <span className="text-muted text-sm">[{count}]</span>}
        </span>
      </button>
      {open && <div className="px-2 pb-3">{children}</div>}
    </div>
  );
}

// AvatarStack.tsx
export function AvatarStack({ urls }: { urls: string[] }) {
  return (
    <div className="flex -space-x-2">
      {urls.slice(0, 3).map((u, i) => (
        <img key={i} src={u} alt="" className="w-6 h-6 rounded-full ring-2 ring-white object-cover" />
      ))}
      {urls.length > 3 && <span className="w-6 h-6 rounded-full bg-slate-200 ring-2 ring-white text-[10px] flex items-center justify-center text-slate-600">+{urls.length - 3}</span>}
    </div>
  );
}
```

- [ ] **Step 3:** `Sidebar.tsx`.
```tsx
import { NavLink } from 'react-router-dom';
const link = ({ isActive }: { isActive: boolean }) =>
  `block px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800/50 ${isActive ? 'bg-slate-800/60 text-white border-l-2 border-emerald-400' : ''}`;
export function Sidebar() {
  return (
    <aside className="w-64 bg-sidebar text-slate-200 min-h-screen p-4 flex flex-col">
      <div className="text-xl font-bold mb-6 text-white">DevCRM</div>
      <nav className="space-y-1">
        <NavLink to="/" className={link} end>Dashboard</NavLink>
        <NavLink to="/clients" className={link}>Clients</NavLink>
      </nav>
    </aside>
  );
}
```

- [ ] **Step 4:** `DetailsPane.tsx` (placeholder shell — fully filled in Phase 8).
```tsx
import { ReactNode } from 'react';
export function DetailsPane({ children }: { children: ReactNode }) {
  return <aside className="w-96 bg-white border-l border-slate-100 p-6 overflow-y-auto">{children}</aside>;
}
```

- [ ] **Step 5:** `Workspace.tsx`.
```tsx
import { ReactNode } from 'react';
export function Workspace({ children }: { children: ReactNode }) {
  return <main className="flex-1 p-8 overflow-y-auto">{children}</main>;
}
```

- [ ] **Step 6:** `AppShell.tsx`.
```tsx
import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
export function AppShell({ children }: { children: ReactNode }) {
  return <div className="flex min-h-screen">{children ? <><Sidebar />{children}</> : <Sidebar />}</div>;
}
```

- [ ] **Step 7:** Compile gate → exit 0.

- [ ] **Step 8:** Commit + push.
```bash
git add frontend/
git commit -m "feat(frontend): layout shell and Nexus UI primitives (Badge, Accordion, AvatarStack, Skeleton)"
git push
```

---

## Phase 8 — Dashboard + Project Details Page (TDD components)

**Agent:** `claude` with `devcrm-ui` + `devcrm-developer` skills.
**Compile gate:** `npx tsc --noEmit && npm run build`
**Test gate:** Vitest passes (set up in Phase 9 — for this phase, dev-test loop is manual via `npm run dev`).

**Files:**
- Create: `frontend/src/routes/{Dashboard.tsx, ProjectDetails.tsx, Clients.tsx}`
- Create: `frontend/src/components/project/{ProjectHeader.tsx, TaskRow.tsx, ReadmePreview.tsx, WarrantyAlert.tsx, ProjectTabs.tsx}`
- Modify: `frontend/src/App.tsx` (real routes)

- [ ] **Step 1:** Wire routes in `App.tsx`.
```tsx
import { Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Workspace } from './components/layout/Workspace';
import { Dashboard } from './routes/Dashboard';
import { ProjectDetails } from './routes/ProjectDetails';
import { Clients } from './routes/Clients';
export default function App() {
  return (
    <AppShell>
      <Workspace>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route path="/clients" element={<Clients />} />
        </Routes>
      </Workspace>
    </AppShell>
  );
}
```

- [ ] **Step 2:** `Dashboard.tsx` — list with sort emphasis on warranty risk.
```tsx
import { Link } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { Skeleton } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';

export function Dashboard() {
  const { data, isLoading } = useProjects();
  if (isLoading) return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Projects</h1>
      <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-100">
        {data?.map(p => (
          <Link key={p.id} to={`/projects/${p.id}`} className="block px-4 py-3 hover:bg-slate-50 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-800">{p.title}</div>
              <div className="text-sm text-muted">{p.clientName}</div>
            </div>
            <div className="flex gap-2">
              {p.daysLeftForWarranty <= 15 && <Badge variant="warn">Warranty {p.daysLeftForWarranty}d</Badge>}
              {p.daysLeftForHostingRenewal <= 30 && <Badge variant="muted">Hosting {p.daysLeftForHostingRenewal}d</Badge>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3:** `ProjectDetails.tsx` + sub components.
```tsx
// ProjectDetails.tsx
import { useParams, Link } from 'react-router-dom';
import { useProjectDetails } from '../hooks/useProjectDetails';
import { DetailsPane } from '../components/layout/DetailsPane';
import { ProjectHeader } from '../components/project/ProjectHeader';
import { ProjectTabs } from '../components/project/ProjectTabs';
import { Skeleton } from '../components/ui/Skeleton';
import { ReadmePreview } from '../components/project/ReadmePreview';
import { WarrantyAlert } from '../components/project/WarrantyAlert';

export function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useProjectDetails(id);
  return (
    <div className="flex gap-6">
      <div className="flex-1">
        <Link to="/" className="text-sm text-muted">&lt; Back</Link>
        {isLoading || !data ? <Skeleton className="h-10 w-1/2 mt-4" /> : <>
          <ProjectHeader title={data.title} clientName={data.clientName} />
          <ProjectTabs project={data} />
        </>}
      </div>
      <DetailsPane>
        {isLoading || !data ? <Skeleton className="h-40" /> : <>
          <div className="text-emerald-500 text-3xl font-bold">{data.priceFormatted}</div>
          <div className="text-sm text-muted mt-1">Start: {data.startDate.slice(0,10)}</div>
          <div className="text-sm text-muted">End: {data.endDate.slice(0,10)}</div>
          <div className="text-sm text-muted">Warranty End: {data.warrantyEndDate.slice(0,10)}</div>
          <hr className="my-4" />
          <div className="space-y-2 text-sm">
            {data.driveLink && <a className="block text-sky-600" href={data.driveLink} target="_blank" rel="noreferrer">Google Drive</a>}
            {data.gitHubRepoUrl && <a className="block text-sky-600" href={data.gitHubRepoUrl} target="_blank" rel="noreferrer">GitHub Repo</a>}
            <div>Hosting: <span className="text-slate-700">{data.hostingProvider}</span></div>
            {data.externalDatabase && <div>DB: <span className="text-slate-700">{data.externalDatabase}</span></div>}
          </div>
          <hr className="my-4" />
          {id && <ReadmePreview projectId={id} />}
          <WarrantyAlert daysLeftForWarranty={data.daysLeftForWarranty} hostingRenewalDate={data.hostingRenewalDate} />
        </>}
      </DetailsPane>
    </div>
  );
}
```

- [ ] **Step 4:** `ProjectHeader.tsx`, `ProjectTabs.tsx`, `TaskRow.tsx`.
```tsx
// ProjectHeader.tsx
export function ProjectHeader({ title, clientName }: { title: string; clientName: string }) {
  return (
    <div className="flex items-center justify-between mt-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted text-sm">{clientName}</p>
      </div>
      <button className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600">+ Add New</button>
    </div>
  );
}

// TaskRow.tsx
import { Badge } from '../ui/Badge';
import { AvatarStack } from '../ui/AvatarStack';
import { useToggleTask } from '../../hooks/useToggleTask';
import type { TaskDto } from '../../types/task';

const groupVariant: Record<string, 'success' | 'warn' | 'muted'> = {
  Milestone: 'success', WarrantyPending: 'warn', PostWarranty: 'muted'
};
export function TaskRow({ task, projectId }: { task: TaskDto; projectId: string }) {
  const m = useToggleTask(projectId);
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50">
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={task.isCompleted} onChange={() => m.mutate(task.id)} />
        <span className={task.isCompleted ? 'line-through text-muted' : 'text-slate-800'}>{task.description}</span>
      </label>
      <div className="flex items-center gap-3">
        {task.dueDate && <span className="text-xs text-muted">{task.dueDate.slice(0,10)}</span>}
        <Badge variant={groupVariant[task.groupType] ?? 'info'}>{task.category}</Badge>
        <AvatarStack urls={task.assigneeAvatarUrls} />
      </div>
    </div>
  );
}

// ProjectTabs.tsx
import { useState } from 'react';
import { Accordion } from '../ui/Accordion';
import { TaskRow } from './TaskRow';
import type { ProjectDetails } from '../../types/project';
type Tab = 'Overview' | 'TechStack' | 'TasksWarranty' | 'Drive';
export function ProjectTabs({ project }: { project: ProjectDetails }) {
  const [tab, setTab] = useState<Tab>('TasksWarranty');
  const groups: Record<string, typeof project.tasks> = {
    Milestone: project.tasks.filter(t => t.groupType === 'Milestone' && t.isCompleted),
    WarrantyPending: project.tasks.filter(t => t.groupType === 'WarrantyPending'),
    PostWarranty: project.tasks.filter(t => t.groupType === 'PostWarranty')
  };
  return (
    <div>
      <div className="flex gap-6 border-b border-slate-100 mb-6">
        {(['Overview', 'TechStack', 'TasksWarranty', 'Drive'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`pb-2 text-sm ${tab === t ? 'border-b-2 border-emerald-500 font-semibold text-slate-800' : 'text-muted'}`}>{t}</button>
        ))}
      </div>
      {tab === 'TasksWarranty' && <>
        <Accordion title="Completed Milestones" count={groups.Milestone.length}>
          {groups.Milestone.map(t => <TaskRow key={t.id} task={t} projectId={project.id} />)}
        </Accordion>
        <Accordion title="Pending for Warranty" count={groups.WarrantyPending.length}>
          {groups.WarrantyPending.map(t => <TaskRow key={t.id} task={t} projectId={project.id} />)}
        </Accordion>
        <Accordion title="Post-Warranty Reminders" count={groups.PostWarranty.length}>
          {groups.PostWarranty.map(t => <TaskRow key={t.id} task={t} projectId={project.id} />)}
        </Accordion>
      </>}
      {tab !== 'TasksWarranty' && <div className="text-muted">Tab "{tab}" coming soon.</div>}
    </div>
  );
}
```

- [ ] **Step 5:** `ReadmePreview.tsx`, `WarrantyAlert.tsx`.
```tsx
// ReadmePreview.tsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useReadme } from '../../hooks/useReadme';
import { Skeleton } from '../ui/Skeleton';
export function ReadmePreview({ projectId }: { projectId: string }) {
  const { data, isLoading } = useReadme(projectId);
  if (isLoading) return <Skeleton className="h-32" />;
  if (!data?.markdown) return <div className="text-xs text-muted">No README available</div>;
  return (
    <div className="max-h-60 overflow-y-auto prose prose-slate prose-sm">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.markdown}</ReactMarkdown>
    </div>
  );
}

// WarrantyAlert.tsx
import { Badge } from '../ui/Badge';
export function WarrantyAlert({ daysLeftForWarranty, hostingRenewalDate }:
  { daysLeftForWarranty: number; hostingRenewalDate: string }) {
  const hostingDays = Math.floor((new Date(hostingRenewalDate).getTime() - Date.now()) / 86400000);
  return (
    <div className="mt-6 p-3 rounded-lg bg-slate-50 border border-slate-100">
      <div className="text-xs font-semibold text-muted mb-2">Renewal & Warranty</div>
      <div className="flex gap-2 flex-wrap">
        {daysLeftForWarranty <= 15 && <Badge variant="warn">Warranty {daysLeftForWarranty}d</Badge>}
        {hostingDays <= 30 && <Badge variant="muted">Hosting renewal in {hostingDays}d</Badge>}
        {daysLeftForWarranty > 15 && hostingDays > 30 && <Badge variant="success">Healthy</Badge>}
      </div>
    </div>
  );
}
```

- [ ] **Step 6:** `Clients.tsx` (stub list).
```tsx
import { useQuery } from '@tanstack/react-query';
import { fetchClients } from '../api/clients';
export function Clients() {
  const { data, isLoading } = useQuery({ queryKey: ['clients'], queryFn: fetchClients });
  if (isLoading) return <div>Loading…</div>;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Clients</h1>
      <ul className="bg-white rounded-xl divide-y divide-slate-100">
        {data?.map(c => <li key={c.id} className="px-4 py-3">{c.name} — <span className="text-muted text-sm">{c.contactNumber}</span></li>)}
      </ul>
    </div>
  );
}
```

- [ ] **Step 7:** `npm run dev` → visit `http://localhost:5173`, with backend running via `dotnet run --project backend/src/DevCRM.WebAPI`. Verify dashboard loads (empty list OK).

- [ ] **Step 8:** Compile gate → exit 0.

- [ ] **Step 9:** Commit + push.
```bash
git add frontend/
git commit -m "feat(frontend): Dashboard + ProjectDetails with tabs, README preview, warranty alerts"
git push
```

---

## Phase 9 — Frontend Tests (Vitest + RTL + MSW)

**Agent:** `claude` with `devcrm-developer` skill + `superpowers:test-driven-development`.
**Compile gate:** `npx tsc --noEmit`
**Test gate:** `npm test -- --run` → all green.

**Files:**
- Create: `frontend/vitest.config.ts`
- Modify: `frontend/package.json` (add scripts + deps)
- Create: `frontend/tests/setup.ts`
- Create: `frontend/tests/mocks/{handlers.ts, server.ts}`
- Create: `frontend/tests/components/{Badge.test.tsx, TaskRow.test.tsx, Dashboard.test.tsx, WarrantyAlert.test.tsx}`

- [ ] **Step 1:** Install test deps.
```bash
cd frontend
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event msw@2
cd ..
```

- [ ] **Step 2:** `vitest.config.ts`.
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts']
  }
});
```

- [ ] **Step 3:** `package.json` scripts.
```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "test": "vitest"
}
```

- [ ] **Step 4:** MSW server + handlers.
```ts
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';
export const handlers = [
  http.get('http://localhost:5000/api/projects', () => HttpResponse.json([
    { id: '1', title: 'Site A', clientName: 'Acme', endDate: '2026-06-01', warrantyEndDate: '2026-09-01', hostingRenewalDate: '2027-06-01', daysLeftForWarranty: 10, daysLeftForHostingRenewal: 200, isActive: true }
  ]))
];
// tests/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';
export const server = setupServer(...handlers);
// tests/setup.ts
import '@testing-library/jest-dom';
import { server } from './mocks/server';
import { afterAll, afterEach, beforeAll } from 'vitest';
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

- [ ] **Step 5:** Write failing tests then make pass.
```tsx
// tests/components/Badge.test.tsx
import { render, screen } from '@testing-library/react';
import { Badge } from '../../src/components/ui/Badge';
test('renders warn variant', () => {
  render(<Badge variant="warn">Hi</Badge>);
  const el = screen.getByText('Hi');
  expect(el.className).toContain('text-amber-600');
});

// tests/components/WarrantyAlert.test.tsx
import { render, screen } from '@testing-library/react';
import { WarrantyAlert } from '../../src/components/project/WarrantyAlert';
test('shows warranty badge when <=15 days', () => {
  render(<WarrantyAlert daysLeftForWarranty={10} hostingRenewalDate={new Date(Date.now() + 86400000 * 365).toISOString()} />);
  expect(screen.getByText(/Warranty 10d/)).toBeInTheDocument();
});

// tests/components/Dashboard.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { Dashboard } from '../../src/routes/Dashboard';
test('renders project list from API', async () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={qc}>
      <MemoryRouter><Dashboard /></MemoryRouter>
    </QueryClientProvider>
  );
  await waitFor(() => expect(screen.getByText('Site A')).toBeInTheDocument());
});

// tests/components/TaskRow.test.tsx
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TaskRow } from '../../src/components/project/TaskRow';

test('shows description and badge', () => {
  const qc = new QueryClient();
  render(<QueryClientProvider client={qc}>
    <TaskRow projectId="p1" task={{ id: 't1', description: 'Fix login', dueDate: null, category: 'Dev', groupType: 'WarrantyPending', isCompleted: false, assigneeAvatarUrls: [] }} />
  </QueryClientProvider>);
  expect(screen.getByText('Fix login')).toBeInTheDocument();
  expect(screen.getByText('Dev')).toBeInTheDocument();
});
```

- [ ] **Step 6:** `npm test -- --run` → all green. `npx tsc --noEmit` → exit 0.

- [ ] **Step 7:** Commit + push.
```bash
git add frontend/
git commit -m "test(frontend): vitest + RTL + MSW coverage for Badge, TaskRow, Dashboard, WarrantyAlert"
git push
```

---

## Phase 10 — End-to-End Smoke + Seed Script + Final Verification

**Agent:** `claude` with `devcrm-reviewer` skill + `superpowers:verification-before-completion`.
**Compile gate:** Full solution build + frontend build both pass.
**Verification:** Manual click-through with seeded data.

**Files:**
- Create: `backend/src/DevCRM.WebAPI/Seed/DevSeed.cs`
- Modify: `backend/src/DevCRM.WebAPI/Program.cs` (call seed in Development)
- Create: `README.md` updates (run instructions)

- [ ] **Step 1:** Seed script.
```csharp
// DevSeed.cs
using DevCRM.Domain.Entities;
using DevCRM.Domain.Enums;
using DevCRM.Infrastructure.Persistence;
namespace DevCRM.WebAPI.Seed;
public static class DevSeed
{
    public static void Run(ApplicationDbContext db)
    {
        if (db.Projects.Any()) return;
        var c = new Client { Name = "Acme Corp", ContactNumber = "+52 33 1234 5678", Email = "ops@acme.test" };
        var p = new Project
        {
            Client = c, ClientId = c.Id, Title = "Acme Marketing Site",
            Price = 25000m,
            StartDate = DateTime.UtcNow.AddMonths(-4),
            EndDate = DateTime.UtcNow.AddDays(-10),
            HostingProvider = "Vercel", ExternalDatabase = "Upstash Redis",
            GitHubRepoUrl = "https://github.com/vercel/next.js",
            DriveLink = "https://drive.google.com/drive/folders/example"
        };
        var t1 = new ProjectTask { Project = p, ProjectId = p.Id, Description = "Launch site", Category = TaskCategory.Dev, GroupType = TaskGroupType.Milestone, IsCompleted = true };
        var t2 = new ProjectTask { Project = p, ProjectId = p.Id, Description = "Fix PDF export bug", Category = TaskCategory.Dev, GroupType = TaskGroupType.WarrantyPending, DueDate = DateTime.UtcNow.AddDays(5) };
        var t3 = new ProjectTask { Project = p, ProjectId = p.Id, Description = "Yearly renewal reminder", Category = TaskCategory.Ops, GroupType = TaskGroupType.PostWarranty };
        db.AddRange(c, p, t1, t2, t3);
        db.SaveChanges();
    }
}
```

- [ ] **Step 2:** Hook into `Program.cs`.
```csharp
// before app.Run();
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<DevCRM.Infrastructure.Persistence.ApplicationDbContext>();
    db.Database.Migrate();
    DevCRM.WebAPI.Seed.DevSeed.Run(db);
}
```

- [ ] **Step 3:** README run instructions.
```md
## Run locally

### Prereqs
- .NET 8 SDK
- Node 20+
- SQL Server Express (`Server=.\SQLEXPRESS`)

### Backend
```
dotnet ef database update --project backend/src/DevCRM.Infrastructure --startup-project backend/src/DevCRM.WebAPI
dotnet run --project backend/src/DevCRM.WebAPI
```

### Frontend
```
cd frontend
npm install
npm run dev
```
Open http://localhost:5173.
```

- [ ] **Step 4:** Full verification sweep.
```bash
dotnet build
dotnet test
cd frontend && npm test -- --run && npm run build && cd ..
```
All commands must exit 0.

- [ ] **Step 5:** Manual smoke: start backend + frontend; open dashboard; click seeded project; confirm warranty badge, README markdown renders, toggle a task and verify it persists after refresh.

- [ ] **Step 6:** Commit + push final.
```bash
git add backend/ frontend/ README.md
git commit -m "feat: dev seed + final verification + run docs"
git push
```

- [ ] **Step 7:** Tag MVP.
```bash
git tag v0.1.0-mvp
git push origin v0.1.0-mvp
```

---

## Self-Review Checklist (post-write)

- Spec coverage: `pbl.md §1` warranty/hosting rules → Phase 1 + Phase 8. GitHub README → Phase 3 + Phase 8. Tasks checklist → Phase 1/3/8. Dashboard ordering → Phase 2 (`GetProjectsHandler` orders). Badge colors → Phase 7 (`Badge` variants match table in `desing.md §1`).
- No placeholders.
- Naming consistency: `IApplicationDbContext`, `ApplicationDbContext`, `ProjectDetailsDto`, `TaskDto`, `useProjectDetails`, `WarrantyEndDate`, `HostingRenewalDate` are used identically across phases.
- Every phase has: agent + skill + compile gate + test gate + commit + push.
- SQL Server Express integration: connection string in Phase 4, EF Core packages in Phase 3, `dotnet ef migrations add` in Phase 4, runtime `Database.Migrate()` in Phase 10.

---

## Execution Handoff

Two execution options:

1. **Subagent-Driven (recommended)** — dispatch fresh `claude` subagent per phase via `Agent` tool, review between phases, fast iteration. Uses `superpowers:subagent-driven-development`.
2. **Inline** — execute phases in current session with checkpoints via `superpowers:executing-plans`.

User picks.
