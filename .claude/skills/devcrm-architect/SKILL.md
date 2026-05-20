---
name: devcrm-architect
description: "Use when acting as software architect on DevCRM. Covers stack decisions, Clean Architecture layers for .NET 8/9, React project structure, API design, database schema, GitHub integration design, and warranty/hosting alert logic."
---

# DevCRM – Architect Skill

## Proyecto
**DevCRM** es un CRM interno para gestionar clientes y proyectos de software vendidos. Controla ciclos de vida de garantías (3 meses), alertas de renovación de hosting (1 año) y extrae READMEs de GitHub en tiempo real.

---

## Stack Tecnológico Aprobado

### Backend
- **.NET 8/9 Web API** – Clean Architecture
- **ORM:** Entity Framework Core + SQL Server
- **Validaciones:** FluentValidation
- **Patrones:** SOLID, CQRS con MediatR (opcional)

### Frontend
- **React + TypeScript** (Vite o Next.js)
- **Estilos:** Tailwind CSS
- **Server State:** TanStack Query (React Query)

---

## Capas de Clean Architecture

```
DevCRM.sln
├── DevCRM.Domain          → Entidades, enumeraciones, interfaces base
├── DevCRM.Application     → CQRS (Commands/Queries), DTOs, FluentValidation, interfaces de servicios
├── DevCRM.Infrastructure  → EF Core, DbContext, repositorios, GitHub HttpClient
└── DevCRM.WebAPI          → Controllers, Program.cs, middleware, DI registration
```

### Reglas entre capas
- `Domain` no depende de nada externo.
- `Application` depende solo de `Domain`.
- `Infrastructure` y `WebAPI` dependen de `Application`.
- Nunca inyectes `DbContext` directamente en controladores; pasa por repositorio o handler.

---

## Entidades del Dominio

### `Client`
- `Id` (Guid, PK)
- `Name` (string, required)
- `ContactNumber` (string, required)
- `Email` (string?, nullable)
- `CreatedAt` (DateTime)

### `Project`
- `Id` (Guid, PK)
- `ClientId` (Guid, FK)
- `Title` (string, required)
- `Price` (decimal 18,2)
- `StartDate` / `EndDate` (DateTime)
- `DriveLink` / `GitHubRepoUrl` (string?, nullable)
- `HostingProvider` (string, required) — Vercel, Netlify, AWS Lightsail
- `ExternalDatabase` (string?, nullable) — Upstash Redis, Neon, Supabase
- `IsActive` (bool)

### `ProjectTask`
- `Id` (Guid, PK)
- `ProjectId` (Guid, FK)
- `Description` (string, required)
- `IsCompleted` (bool)
- `CreatedAt` (DateTime)

---

## Lógica de Negocio Clave (Reglas Inamovibles)

| Regla | Fórmula | Notas |
|---|---|---|
| Fin de garantía | `EndDate.AddMonths(3)` | Siempre 3 meses exactos. |
| Renovación de hosting | `EndDate.AddYears(1)` | Fecha de cobro objetivo. |
| Alerta amarilla | `DaysLeftWarranty < 15` AND hay tareas pendientes | Badge en UI. |
| Alerta roja | `DaysUntilHostingRenewal < 30` | Badge en UI. |
| Garantía vencida | `DateTime.UtcNow > WarrantyEndDate` | Estado calculado dinámicamente en el DTO. |

Estas fechas **no se almacenan en BD**; se calculan como propiedades computadas en el DTO de respuesta.

---

## Diseño de API REST

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/projects` | Lista con datos calculados (garantía, hosting). |
| GET | `/api/projects/{id}` | Detalle completo (`ProjectDetailsDto`). |
| POST | `/api/projects` | Crea cliente (nuevo o existente) + proyecto. |
| PUT | `/api/projects/{id}` | Actualiza datos del proyecto. |
| DELETE | `/api/projects/{id}` | Desactiva (`IsActive = false`). |
| GET | `/api/projects/{id}/readme` | Extrae README.md desde GitHub. |
| GET | `/api/clients` | Lista clientes para selector de formulario. |
| POST | `/api/clients` | Crea cliente nuevo. |
| POST | `/api/projects/{id}/tasks` | Agrega tarea pendiente al proyecto. |
| PATCH | `/api/tasks/{taskId}/complete` | Marca tarea como completada. |

---

## Integración GitHub README

- El endpoint `/api/projects/{id}/readme` obtiene el `GitHubRepoUrl` del proyecto.
- Construye la URL de la API de GitHub: `https://api.github.com/repos/{owner}/{repo}/readme`
- Usa `HttpClient` con header `Accept: application/vnd.github.v3.raw` para obtener Markdown crudo.
- El backend **no renderiza HTML**; retorna el Markdown como string. El frontend renderiza con `react-markdown`.
- Configura un `GitHubHttpClient` nombrado en `Infrastructure` con `User-Agent` y token de autenticación opcional vía `IOptions<GitHubOptions>`.

---

## Estructura del Frontend React

```
src/
├── api/               → Funciones de fetch (axios/fetch wrappers)
├── components/
│   ├── layout/        → Sidebar, MainWorkspace, DetailsPane
│   ├── projects/      → ProjectCard, ProjectForm, TaskAccordion, TaskRow
│   ├── ui/            → Badge, Avatar, Skeleton, Tabs
│   └── github/        → ReadmePreview
├── hooks/             → useProjectDetails, useReadme, useTasks
├── pages/             → Dashboard, ProjectDetail
└── types/             → ProjectDetailsDto, TaskDto, ClientDto
```

---

## Decisiones de Arquitectura

- **No uses `DateTime.Now`** en el servidor; usa siempre `DateTime.UtcNow` para consistencia.
- **Paginación en dashboard:** Ordenar primero por `DaysUntilHostingRenewal ASC`, luego por `DaysLeftWarranty ASC`.
- **Soft delete:** `IsActive = false` en lugar de eliminar registros.
- **CORS:** Configurar política nombrada en `Program.cs` para el origen del frontend.
- **Autenticación:** No está en el PBL v1; no implementar aún.
