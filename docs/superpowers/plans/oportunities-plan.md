# Plan de Implementación: Módulo `Opportunities` (Ingesta IA)

Hoja de ruta para construir desde cero el módulo `Opportunities` en DevCRM. Su única misión es recibir leads cualificados emitidos por el orquestador IA (Gemini Pro / Claude Pro) y exponerlos al humano operador para revisión, calificación y descarte.

- Backend: **.NET 9** · Clean Architecture (Domain / Application / Infrastructure / WebAPI) · EF Core · FluentValidation.
- Frontend: **React 19 + Vite + TanStack Query + Tailwind v4 + react-router 7**. Test: **Vitest + Testing Library + MSW**.
- Test backend: **xUnit + FluentAssertions + Moq + EF Core InMemory + WebApplicationFactory**.
- Convenciones del repo: rutas reales bajo `backend/src/DevCRM.*` y `frontend/src/*` (ver `Client*` como módulo espejo de referencia).

> Disciplina obligatoria (skills): toda fase arranca con **`superpowers:brainstorming`** si todavía hay ambigüedad de scope, escribe el contrato de pruebas antes del código con **`superpowers:test-driven-development`**, captura el plan en archivo con **`superpowers:writing-plans`** y cierra con **`superpowers:verification-before-completion`**. Reviewers usan **`superpowers:requesting-code-review`** + skill `review`. Antes de mergear: **`superpowers:finishing-a-development-branch`**.

---

## FASE 0 · Brainstorm & Spec Lock
*Decisiones de contrato antes de tocar código. Sin esto, fases posteriores re-trabajan.*

**Skills**: `superpowers:brainstorming`, `superpowers:writing-plans`, `devcrm-architect`.

- [x] **Contrato IA → API**: congelado en `docs/contracts/opportunity-ingest.json` (payload válido + inválido). `DevelopmentPossibility` = markdown libre, máx 4000 chars.
- [x] **Modelo de estados**: transiciones permitidas codificadas en `OpportunityService.AllowedTransitions` (`AiGenerated → Evaluating|Discarded`, `Evaluating → Contacted|Discarded`). `Discarded` = terminal (no se reabre vía API).
- [x] **Autenticación de ingesta**: API Key en `Ingestion:ApiKeys` (lista, soporta multi-key para rotación). Comparación constant-time vía `CryptographicOperations.FixedTimeEquals`.
- [x] **Idempotencia**: `ExternalLeadId` opcional con índice único filtrado. Reingesta del mismo `ExternalLeadId` devuelve el registro existente sin duplicar (201 + mismo `Id`).
- [x] **PII y compliance**: `ContactEmail`/`ContactName` se persisten planos (TLS-only). El controlador no loguea payload en `Information`; runbook de rotación en `docs/runbooks/rotate-ingestion-api-key.md`.

**Entregable**: `docs/contracts/opportunity-ingest.json` ✓. Decisiones registradas arriba.

---

## FASE 1 · Backend Dominio (Core)
*Núcleo de negocio. Cero dependencias de frameworks.*

**Skills**: `devcrm-architect`, `devcrm-developer`, `superpowers:test-driven-development`.

- [x] **Entidad** `Domain/Entities/Opportunity.cs` con todas las props del contrato.
- [x] **Enum** `Domain/Entities/OpportunityStatus.cs` → `AiGenerated = 0, Evaluating = 1, Contacted = 2, Discarded = 3`.
- [x] **Contrato de repositorio** `Domain/Interfaces/IOpportunityRepository.cs` (+ `IOpportunityAuditRepository`).
- [x] **Invariantes**: salto `AiGenerated → Contacted` rechazado por `AllowedTransitions` y cubierto por test de servicio.

**Tests Fase 1** (`backend/tests/DevCRM.Domain.Tests/OpportunityTests.cs` — proyecto nuevo xUnit):
- `Opportunity_NewInstance_HasAiGeneratedStatus`
- `OpportunityStatus_EnumValues_MatchContract` (valores numéricos estables ↔ migraciones EF).

---

## FASE 2 · Backend Aplicación (Casos de uso)
*Servicios, DTOs, validación, mapeo.*

**Skills**: `devcrm-developer`, `superpowers:test-driven-development`.

- [x] **DTOs** `Application/Opportunities/Dtos/OpportunityDto.cs`
  ```csharp
  public record OpportunityDto(Guid Id, string CompanyName, string ContactName, string ContactEmail,
      string DevelopmentPossibility, string? ExternalLeadId, OpportunityStatus Status,
      DateTime CreatedAt, DateTime UpdatedAt, string? DiscardReason);

  public record CreateOpportunityDto(string CompanyName, string ContactName, string ContactEmail,
      string DevelopmentPossibility, string? ExternalLeadId);

  public record UpdateOpportunityStatusDto(OpportunityStatus Status, string? DiscardReason);
  ```
- [x] **Validadores** `Application/Opportunities/Validators/OpportunityValidators.cs` (FluentValidation, espejo de `CreateClientValidator`):
  - `CompanyName`: NotEmpty, MaxLength 200.
  - `ContactName`: NotEmpty, MaxLength 150.
  - `ContactEmail`: NotEmpty, EmailAddress, MaxLength 150.
  - `DevelopmentPossibility`: NotEmpty, MaxLength 4000.
  - `ExternalLeadId`: MaxLength 100 (opcional).
  - `UpdateOpportunityStatusDto.DiscardReason`: requerido cuando `Status == Discarded`.
- [x] **Servicio** `Application/Opportunities/Services/IOpportunityService.cs` + `OpportunityService.cs`
  - `IngestAsync(CreateOpportunityDto)` → si `ExternalLeadId` existe y ya está en BD, devolver el existente (idempotencia); si no, crear con `Status = AiGenerated`.
  - `GetAllAsync(OpportunityStatus? filter = null)`.
  - `GetByIdAsync(Guid id)`.
  - `UpdateStatusAsync(Guid id, UpdateOpportunityStatusDto)` → valida transición permitida; lanza `ValidationException` si inválida.
- [x] **DI** registrado en `Application/DependencyInjection.cs` (+ `AddSingleton<OpportunityMetrics>`).

**Tests Fase 2** (`backend/tests/DevCRM.Application.Tests/Opportunities/`):
- `OpportunityServiceTests.Ingest_NewLead_PersistsWithAiGeneratedStatus`
- `OpportunityServiceTests.Ingest_DuplicateExternalLeadId_ReturnsExistingNotDuplicate`
- `OpportunityServiceTests.UpdateStatus_AiGeneratedToContacted_ThrowsValidation`
- `OpportunityServiceTests.UpdateStatus_DiscardedWithoutReason_ThrowsValidation`
- `CreateOpportunityValidatorTests.InvalidEmail_Fails`
- `CreateOpportunityValidatorTests.MissingDevelopmentPossibility_Fails`
- `CreateOpportunityValidatorTests.ValidPayload_Passes`
- Repo mockeado con **Moq**. Cero dependencias de EF en esta capa.

---

## FASE 3 · Backend Infraestructura
*EF Core, persistencia, migraciones.*

**Skills**: `devcrm-developer`, `superpowers:test-driven-development`.

- [x] **Configuración EF** `Infrastructure/Persistence/Configurations/OpportunityConfiguration.cs` (+ `OpportunityAuditLogConfiguration.cs`)
  - `ToTable("Opportunities")`. `HasKey(Id)`.
  - `CompanyName`: required, MaxLength 200.
  - `ContactName`: required, MaxLength 150.
  - `ContactEmail`: required, MaxLength 150. Index no único.
  - `DevelopmentPossibility`: required, `HasColumnType("nvarchar(max)")`.
  - `ExternalLeadId`: MaxLength 100. **Índice único filtrado** (`WHERE ExternalLeadId IS NOT NULL`).
  - `Status`: required, almacenado como `int`.
  - `CreatedAt`, `UpdatedAt`: required.
  - `DiscardReason`: MaxLength 500.
- [x] **DbSets** `Opportunities` y `OpportunityAuditLogs` añadidos a `DevCrmDbContext`.
- [x] **Repos** `OpportunityRepository.cs` + `OpportunityAuditRepository.cs`.
- [x] **Migración** `20260522034328_AddOpportunitiesModule` generada y aplicada.
- [x] **DI** registrado en `Infrastructure/DependencyInjection.cs`.

**Tests Fase 3** (`backend/tests/DevCRM.Infrastructure.Tests/Repositories/OpportunityRepositoryTests.cs` — EF Core InMemory o SQLite in-memory):
- `AddAsync_PersistsAndSaveChangesReturnsOne`
- `GetByExternalLeadIdAsync_ReturnsMatch`
- `GetByExternalLeadIdAsync_NullArg_ReturnsNull`
- `GetAllAsync_FiltersByStatus`
- `UniqueConstraint_DuplicateExternalLeadId_Throws` (solo con SQLite, no con InMemory — documentado).

---

## FASE 4 · Backend WebAPI
*Endpoints + autenticación del canal de ingesta.*

**Skills**: `devcrm-developer`, `devcrm-architect`, `superpowers:test-driven-development`.

- [x] **Middleware/Atributo** `WebAPI/Security/ApiKeyAuthAttribute.cs`
  - Lee header `X-Api-Key`, compara contra `Ingestion:ApiKeys` en config. Retorna `401` si ausente, `403` si no coincide.
  - Comparación con `CryptographicOperations.FixedTimeEquals` para evitar timing attack.
- [x] **Controlador** `WebAPI/Controllers/OpportunitiesController.cs`
  - `POST /api/opportunities` → `[ApiKeyAuth]`. Body `CreateOpportunityDto`. Devuelve `201 Created` con DTO completo.
  - `GET /api/opportunities?status=AiGenerated` → lista (frontend, sin API key por ahora; añadir auth UI cuando exista).
  - `GET /api/opportunities/{id:guid}` → detalle.
  - `PUT /api/opportunities/{id:guid}/status` → cambia estado (frontend).
- [x] **Logging**: el controlador no escribe payload; el handler de excepciones global devuelve `ProblemDetails` sin loguear cuerpo.
- [x] **OpenAPI**: endpoints anotados con `ProducesResponseType` para 201/400/401/403/404.

**Tests Fase 4** (`backend/tests/DevCRM.WebAPI.Tests/OpportunitiesEndpointTests.cs` con `WebApplicationFactory<Program>`):
- `Post_WithoutApiKey_Returns401`
- `Post_WithWrongApiKey_Returns403`
- `Post_ValidPayload_Returns201AndAiGeneratedStatus`
- `Post_DuplicateExternalLeadId_Returns201_SameId` (idempotencia HTTP)
- `Post_InvalidEmail_Returns400`
- `Get_ListByStatus_FiltersCorrectly`
- `Put_Status_FromAiGeneratedToEvaluating_Returns200`
- `Put_Status_InvalidTransition_Returns400`

---

## FASE 5 · Frontend (React 19 + Vite + TanStack Query)
*UI de revisión humana. Estética Nexus Dashboard.*

**Skills**: `devcrm-ui`, `devcrm-developer`, `superpowers:test-driven-development`.

- [x] **Tipos** `frontend/src/types/dto.ts` → `OpportunityDto`, `CreateOpportunityDto`, `UpdateOpportunityStatusDto`, enum `OpportunityStatus`.
- [x] **Servicio API** `frontend/src/api/opportunities.ts`:
  ```ts
  export const opportunitiesApi = {
    list: async (status?: OpportunityStatus) =>
      (await api.get<OpportunityDto[]>('/opportunities', { params: { status } })).data,
    byId: async (id: string) =>
      (await api.get<OpportunityDto>(`/opportunities/${id}`)).data,
    updateStatus: async (id: string, dto: UpdateOpportunityStatusDto) =>
      (await api.put<OpportunityDto>(`/opportunities/${id}/status`, dto)).data,
  };
  ```
- [x] **Hooks** `frontend/src/hooks/useOpportunities.ts`: `useOpportunities(status)`, `useOpportunity(id)`, `useUpdateOpportunityStatus(id)`.
- [x] **Página** `frontend/src/pages/Opportunities.tsx`
  - Layout: lista (tabla en desktop, cards en mobile). Columnas: Empresa · Contacto · Estado (badge color) · Recibido (`date-fns` `formatDistance`) · Acción.
  - Skeleton loader mientras `isLoading`.
  - Filtros por `Status` (chips).
- [x] **Componente** `frontend/src/components/opportunities/OpportunityDetailDrawer.tsx`
  - Panel lateral o modal con `DevelopmentPossibility` renderizado con `react-markdown` + `remark-gfm`.
  - Acciones: "Marcar Evaluando", "Marcar Contactado", "Descartar" (pide `discardReason` con textarea).
- [x] **Ruta** `/opportunities` registrada en `App.tsx`; entry en `Sidebar.tsx` con icon `Target`.
- [x] **Tokens Nexus**: usados teal-400/amber-300 para badges; `bg-slate-*` para fondos.

**Tests Fase 5** (`frontend/src/test/Opportunities.test.tsx`, `OpportunityDetailDrawer.test.tsx`):
- `Opportunities > renderiza skeleton mientras carga`
- `Opportunities > renderiza lead mockeado tras fetch (MSW)`
- `Opportunities > filtra por estado AiGenerated`
- `Opportunities > muestra empty state cuando lista vacía`
- `OpportunityDetailDrawer > muestra markdown de DevelopmentPossibility`
- `OpportunityDetailDrawer > bloquea Descartar sin razón`
- `OpportunityDetailDrawer > PUT status invoca mutation y refresca lista`
- Añadir handlers MSW en `frontend/src/test/mocks/handlers.ts` (`http.get('/opportunities')`, `http.put('/opportunities/:id/status')`).

---

## FASE 6 · Integración del Agente IA
*Conexión real del orquestador al endpoint.*

**Skills**: `devcrm-architect`, `superpowers:verification-before-completion`.

- [ ] **System prompt update**: pendiente (depende del orquestador IA, fuera del repo).
- [x] **Cliente HTTP del agente**: `tools/agent/opportunity_ingest_client.py` con retry exponencial (5xx) y no-retry en 4xx.
- [ ] **Smoke test E2E manual**: pendiente (requiere ejecutar app y `tools/smoke/opportunity-ingest.ps1`).
- [x] **Dashboard de salud**: `Dashboard.tsx` muestra badge "Leads IA hoy" filtrando por `AiGenerated` y fecha.

**Tests Fase 6** (E2E ligero — opcional MVP):
- Script `tools/smoke/opportunity-ingest.ps1` que hace `Invoke-RestMethod` contra `/api/opportunities` con payload fixture y verifica `201`.
- Documentado, manual, fuera de CI hasta que haya entorno staging.

---

## FASE 7 · Seguridad, Observabilidad, Deploy
*Sin esto, no es producción.*

**Skills**: `superpowers:requesting-code-review`, skill `security-review`, `superpowers:verification-before-completion`.

- [x] **Rate limiting** policy `ingest` (fixed window 60 req/min por API key) aplicado vía `[EnableRateLimiting("ingest")]` en `POST`.
- [x] **Audit log**: `OpportunityAuditLog` entidad + repo + writes en `IngestAsync` y `UpdateStatusAsync`.
- [x] **Métricas**: `OpportunityMetrics` con `opportunities_ingested_total`, `opportunities_status_changed_total`, `opportunities_ingest_duration_ms`. Expuestas vía OpenTelemetry → Prometheus en `/metrics`. Doc: `docs/runbooks/opportunities-metrics.md`.
- [x] **Backup de API Keys**: runbook `docs/runbooks/rotate-ingestion-api-key.md` (procedimiento zero-downtime).
- [x] **CORS**: `POST` protegido por API key incluso si CORS permite el origen del frontend (nota en runbook).
- [ ] **Pre-merge**: pendiente — ejecutar `review` + `security-review` antes del merge.

---

## Matriz de Tests (resumen)

| Capa | Proyecto / Archivo | Framework | Tests mínimos |
|---|---|---|---|
| Domain | `backend/tests/DevCRM.Domain.Tests` | xUnit + FluentAssertions | 2 |
| Application | `backend/tests/DevCRM.Application.Tests/Opportunities` | xUnit + Moq + FluentValidation.TestHelper | 7 |
| Infrastructure | `backend/tests/DevCRM.Infrastructure.Tests/Repositories` | xUnit + EF Core InMemory / SQLite in-memory | 5 |
| WebAPI | `backend/tests/DevCRM.WebAPI.Tests` | xUnit + `WebApplicationFactory<Program>` + `HttpClient` | 8 |
| Frontend hooks/pages | `frontend/src/test/Opportunities*.test.tsx` | Vitest + Testing Library + MSW | 7 |
| Smoke E2E | `tools/smoke/opportunity-ingest.ps1` | PowerShell manual | 1 |

**Total objetivo**: ≥ 30 tests automatizados antes de merge a `main`. Cobertura mínima del módulo: 80% líneas en `Application` y `Domain`.

---

## Comandos clave

```powershell
# Backend
dotnet ef migrations add AddOpportunitiesModule `
  -p backend/src/DevCRM.Infrastructure `
  -s backend/src/DevCRM.WebAPI
dotnet ef database update `
  -p backend/src/DevCRM.Infrastructure `
  -s backend/src/DevCRM.WebAPI

dotnet test backend/DevCRM.sln

# Frontend
cd frontend
npm run test:run
npm run lint
npm run build
```

---

## Definition of Done (módulo `Opportunities`)

1. Todas las casillas de FASE 0–7 marcadas.
2. `dotnet test` verde local y en CI.
3. `npm run test:run` verde.
4. Migración aplicada en dev DB y verificada con `dotnet ef migrations list`.
5. Smoke E2E manual ejecutado y registrado en PR description.
6. PR aprobado tras `security-review` (sin findings High/Critical).
7. Runbook de rotación de API key publicado.
8. `verification-before-completion` ejecutado: cada claim de "funciona" tiene evidencia adjunta (output de test, screenshot, payload).
