# Project Blueprint & Backlog (PBL): DevCRM

Este documento define la especificación de requerimientos, el modelo de datos y la arquitectura técnica para **DevCRM**, un sistema de gestión de clientes y control de proyectos de software vendidos, garantías y renovación de hostings.

---

## 1. Alcance del Proyecto & Reglas de Negocio

- **Ciclo de Vida de Garantía:** Todo proyecto tiene una `FechaFin`. La garantía se calcula automáticamente sumando estrictamente **3 meses** a partir de esa fecha. Pasado este tiempo, el estado de la garantía cambia a `Vencida`.
- **Alertas de Hosting:** El sistema debe alertar al usuario (dashboard/notificaciones) **30 días antes** de que se cumpla el año (`FechaFin + 1 año`) para realizar el cobro de la renovación del hosting.
- **Integración con GitHub:** El sistema consumirá la API pública/autenticada de GitHub para extraer en tiempo real el contenido del archivo `README.md` de un repositorio y renderizarlo en el perfil del proyecto.
- **Pendientes de Entrega:** Cada proyecto tendrá un listado de tareas (Checklist) de funcionalidades pendientes que deben resolverse antes de que expire la garantía.

---

## 2. Arquitectura Tecnológica Propuesta

### Backend (.NET 8/9 Web API)

- **Patrón:** Clean Architecture (Domain, Application, Infrastructure, WebAPI).
- **ORM:** Entity Framework Core con SQL Server.
- **Principios:** SOLID, CQRS (opcional, usando MediatR) y validaciones con FluentValidation.

### Frontend (React)

- **Ecosistema:** React (Vite o Next.js) + TypeScript.
- **Estilos:** Tailwind CSS.
- **Estado & Consultas:** React Query (TanStack Query) para el manejo de caché del lado del servidor.

---

## 3. Modelo de Datos (Database Schema)

### Tabla: `Clients` (Clientes)

| Campo | Tipo de Datos | Restricciones | Descripción |
|---|---|---|---|
| `Id` | Guid | PK | Identificador único. |
| `Name` | NVARCHAR(150) | Not Null | Nombre del cliente o empresa. |
| `ContactNumber` | NVARCHAR(20) | Not Null | Teléfono de contacto (con clave internacional). |
| `Email` | NVARCHAR(100) | Nullable | Correo electrónico principal. |
| `CreatedAt` | DateTime | Not Null | Fecha de registro en el CRM. |

### Tabla: `Projects` (Proyectos)

| Campo | Tipo de Datos | Restricciones | Descripción |
|---|---|---|---|
| `Id` | Guid | PK | Identificador único. |
| `ClientId` | Guid | FK -> Clients.Id | Relación con el cliente. |
| `Title` | NVARCHAR(150) | Not Null | Nombre del proyecto vendido. |
| `Price` | DECIMAL(18,2) | Not Null | Precio total al que fue vendido. |
| `StartDate` | DateTime | Not Null | Fecha de inicio del desarrollo. |
| `EndDate` | DateTime | Not Null | Fecha de entrega/finalización. |
| `DriveLink` | NVARCHAR(2048) | Nullable | Enlace a la carpeta de Google Drive. |
| `GitHubRepoUrl` | NVARCHAR(2048) | Nullable | URL del repositorio (e.g., `usuario/repo`). |
| `HostingProvider` | NVARCHAR(100) | Not Null | E.g., Vercel, Netlify, AWS Lightsail. |
| `ExternalDatabase` | NVARCHAR(100) | Nullable | E.g., Upstash Redis, Neon Postgres, Supabase. |
| `IsActive` | BIT | Not Null | Estado lógico del proyecto. |

### Tabla: `ProjectTasks` (Funcionalidades Pendientes / Checklist)

| Campo | Tipo de Datos | Restricciones | Descripción |
|---|---|---|---|
| `Id` | Guid | PK | Identificador único. |
| `ProjectId` | Guid | FK -> Projects.Id | Relación con el proyecto. |
| `Description` | NVARCHAR(500) | Not Null | Detalle de la tarea o funcionalidad pendiente. |
| `IsCompleted` | BIT | Not Null | `true` si ya se resolvió antes de la garantía. |
| `CreatedAt` | DateTime | Not Null | Fecha de creación del pendiente. |

---

## 4. Requerimientos Funcionales (Backlog de Usuario)

### Épica 1: Gestión de Proyectos y Clientes (CRUD)

- **US1.1 - Creación de Proyecto desde Cero:** Como usuario del CRM, quiero un formulario unificado para registrar un nuevo cliente (o seleccionar uno existente) e ingresar todos los datos del proyecto (Fechas, Precio, Links de Drive/GitHub, Proveedores de Infraestructura).
- **US1.2 - Visualización de Dashboard:** Como usuario, quiero ver una lista de proyectos activos ordenados de forma que los que tienen garantías o hostings próximos a vencer aparezcan primero.

### Épica 2: Control de Garantías y Alertas

- **US2.1 - Cálculo Automatizado:** Al consultar un proyecto, el backend debe retornar de forma dinámica:
  - `WarrantyExpirationDate` (`EndDate + 3 meses`)
  - `DaysLeftForWarranty` (Días restantes de garantía)
  - `HostingRenewalDate` (`EndDate + 1 año`)
- **US2.2 - Sistema de Notificaciones Visuales:** El frontend debe mostrar badges de colores:
  - 🟡 **Amarillo:** Garantía a menos de 15 días de vencer y con tareas pendientes.
  - 🔴 **Rojo:** Alerta de renovación de Hosting (faltan menos de 30 días para cumplir el año).

### Épica 3: Integraciones Técnicas

- **US3.1 - Extracción de README:** Al abrir los detalles de un proyecto, el frontend invocará un endpoint de .NET (`/api/projects/{id}/readme`). Este endpoint consultará la API de GitHub usando el `GitHubRepoUrl`, obtendrá el archivo `README.md` en Markdown crudo y el frontend lo renderizará como HTML limpio.
