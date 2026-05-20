# DevCRM

CRM interno para gestionar clientes y proyectos de software vendidos. Controla ciclos de garantía (3 meses), alertas de renovación de hosting (1 año) y extrae READMEs de GitHub en tiempo real.

## Stack

- **Backend:** .NET 9 Web API · Clean Architecture · EF Core · SQL Server · FluentValidation
- **Frontend:** React 19 + TypeScript · Vite · Tailwind CSS v4 · TanStack Query · React Router · react-markdown

## Estructura

```
CRM/
├── backend/                    # Solución .NET (Clean Architecture)
│   ├── DevCRM.sln
│   └── src/
│       ├── DevCRM.Domain/        # Entidades + interfaces
│       ├── DevCRM.Application/   # DTOs, services, validators
│       ├── DevCRM.Infrastructure/# EF Core, repos, GitHub HttpClient
│       └── DevCRM.WebAPI/        # Controllers, Program.cs
├── frontend/                   # Vite + React + TS
│   └── src/
│       ├── api/                # axios client + endpoints
│       ├── components/         # layout, ui, projects
│       ├── hooks/              # TanStack Query hooks
│       ├── pages/              # Dashboard, ProjectDetail, NewProject
│       └── types/              # DTO types
└── docs/                       # PBL, design, skills
```

## Requisitos

| Herramienta | Versión |
|---|---|
| .NET SDK | 9.0+ |
| Node.js | 20+ |
| SQL Server | LocalDB (Express) o instancia accesible |
| dotnet-ef | global tool |

Instalar `dotnet-ef`:

```bash
dotnet tool install --global dotnet-ef
```

## Setup Backend

```bash
cd backend
dotnet restore
dotnet build
```

### Connection string

Editar `backend/src/DevCRM.WebAPI/appsettings.json` si no se usa LocalDB por defecto:

```json
"ConnectionStrings": {
  "DevCrm": "Server=(localdb)\\MSSQLLocalDB;Database=DevCRM;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

### Migraciones

En desarrollo, `Program.cs` aplica `db.Database.Migrate()` automáticamente al iniciar. Para correrlas manualmente:

```bash
dotnet ef database update \
  --project src/DevCRM.Infrastructure/DevCRM.Infrastructure.csproj \
  --startup-project src/DevCRM.WebAPI/DevCRM.WebAPI.csproj
```

Crear nueva migración:

```bash
dotnet ef migrations add <Nombre> \
  --project src/DevCRM.Infrastructure/DevCRM.Infrastructure.csproj \
  --startup-project src/DevCRM.WebAPI/DevCRM.WebAPI.csproj \
  --output-dir Persistence/Migrations
```

### Token de GitHub (opcional)

Para evitar el rate limit de 60 req/h sin auth y poder leer repos privados:

```json
"GitHub": {
  "UserAgent": "DevCRM",
  "Token": "ghp_xxx..."
}
```

Recomendado: usar `appsettings.Development.json` o variables de entorno (`GitHub__Token`). No commitear tokens.

### Correr

```bash
cd backend
dotnet run --project src/DevCRM.WebAPI
```

- API: `http://localhost:5000` (o el puerto que muestre la consola)
- Swagger UI: `http://localhost:5000/swagger`

## Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

- Dev server: `http://localhost:5173`
- Proxy `/api` apunta a `http://localhost:5000` (configurado en `vite.config.ts`)

Si el backend corre en otro puerto, editar `vite.config.ts`:

```ts
server: {
  proxy: {
    '/api': { target: 'http://localhost:5000', changeOrigin: true, secure: false }
  }
}
```

### Build de producción

```bash
npm run build
npm run preview
```

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/clients` | Lista clientes |
| POST | `/api/clients` | Crea cliente |
| GET | `/api/clients/{id}` | Detalle cliente |
| PUT | `/api/clients/{id}` | Actualiza cliente |
| GET | `/api/projects` | Lista proyectos activos (ordenados por urgencia) |
| GET | `/api/projects/{id}` | Detalle proyecto + tareas + fechas calculadas |
| POST | `/api/projects` | Crea proyecto (cliente nuevo o existente) |
| PUT | `/api/projects/{id}` | Actualiza proyecto |
| DELETE | `/api/projects/{id}` | Soft delete (`IsActive = false`) |
| POST | `/api/projects/{id}/tasks` | Agrega tarea pendiente |
| GET | `/api/projects/{id}/readme` | Markdown del README de GitHub |
| PATCH | `/api/tasks/{taskId}/complete` | Marca tarea completada |

## Reglas de negocio

| Regla | Fórmula |
|---|---|
| Fin de garantía | `EndDate + 3 meses` |
| Renovación de hosting | `EndDate + 1 año` |
| Alerta amarilla | `daysLeftForWarranty < 15` AND hay tareas pendientes |
| Alerta roja | `daysUntilHostingRenewal < 30` |

Las fechas no se almacenan: se calculan dinámicamente en los DTOs.

## Flujo de desarrollo típico

1. Terminal 1: `cd backend && dotnet run --project src/DevCRM.WebAPI`
2. Terminal 2: `cd frontend && npm run dev`
3. Abrir `http://localhost:5173`
4. **Dashboard** → `+ Add New` → crear proyecto con cliente nuevo
5. Click en tarjeta → **ProjectDetail** muestra tareas, links, README de GitHub, alerta de hosting

## Documentación

- `docs/pbl.md` — Project Blueprint & Backlog (requerimientos, modelo de datos)
- `docs/desing.md` — Sistema de diseño Nexus Dashboard + UI/UX spec

## Troubleshooting

**`dotnet ef` no encontrado:** instalar con `dotnet tool install --global dotnet-ef` y reiniciar terminal.

**Migración falla con connection string:** verificar que LocalDB esté instalado (`sqllocaldb info`) o cambiar la cadena a una instancia accesible.

**CORS bloquea el frontend:** verificar que `Cors:AllowedOrigins` en `appsettings.json` incluya el origen del dev server.

**GitHub README devuelve 403/rate limit:** configurar `GitHub:Token`.

**`Project.GitHubRepoUrl` no carga README:** aceptar formato `owner/repo` o `https://github.com/owner/repo`. El servicio normaliza ambos.
