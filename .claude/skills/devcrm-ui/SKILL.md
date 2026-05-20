---
name: devcrm-ui
description: "Use when building UI components for DevCRM. Covers Nexus Dashboard design system tokens, Tailwind CSS class reference, 3-column layout spec, badge colors, skeleton loaders, accordion task lists, details pane blocks, and hover/focus effects."
---

# DevCRM – UI Skill

## Sistema de Diseño: Nexus Dashboard

Toda la interfaz de DevCRM sigue el sistema **Nexus Dashboard**. Las clases de Tailwind CSS listadas aquí son la fuente de verdad; no crear variantes fuera de esta paleta.

---

## Tokens de Color (Tailwind)

### Estructura Principal

| Elemento | Clase Tailwind | Hex |
|---|---|---|
| Sidebar fondo | `bg-slate-900` | `#1A1C29` |
| App background | `bg-slate-50` | `#F8F9FA` |
| Tarjetas / contenedores | `bg-white rounded-xl border border-slate-100` | `#FFFFFF` |
| Texto principal | `text-slate-800` | `#2D3748` |
| Texto secundario / muted | `text-slate-400` | `#718096` |
| Menú activo sidebar | `bg-slate-800/50` | — |

### Badges de Estado

| Estado | Fondo | Texto | Uso |
|---|---|---|---|
| Completado / Precio | `bg-emerald-50` | `text-emerald-600` | Hitos completados, precio del proyecto |
| Pendiente / Warning | `bg-amber-50` | `text-amber-600` | Tareas pendientes, garantía próxima |
| Post-garantía | `bg-purple-50` | `text-purple-600` | Recordatorios anuales, renovación hosting |
| Infra / Tech tags | `bg-sky-50` | `text-sky-600` | Vercel, Netlify, Upstash Redis, etc. |
| Alerta crítica (hosting) | `bg-red-50` | `text-red-600` | < 30 días para renovación |

---

## Layout de 3 Columnas

```
+------------------+------------------------------------------+------------------+
|   [A] Sidebar    |         [B] Main Workspace               |  [C] Details     |
|    w-64          |           flex-1                         |   w-80 / w-96    |
|   bg-slate-900   |           bg-slate-50                    |   bg-white       |
+------------------+------------------------------------------+------------------+
```

### Clase base del layout raíz

```tsx
<div className="flex h-screen overflow-hidden bg-slate-50">
  <Sidebar />                         {/* w-64 bg-slate-900 */}
  <main className="flex flex-1 overflow-hidden">
    <MainWorkspace className="flex-1 overflow-y-auto" />
    <DetailsPane className="w-96 border-l border-slate-100 bg-white overflow-y-auto" />
  </main>
</div>
```

---

## Componente A: Sidebar

```tsx
// Elemento de menú inactivo
<li className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-400 hover:bg-slate-800/50 hover:text-white transition-colors cursor-pointer">

// Elemento de menú ACTIVO
<li className="flex items-center gap-3 rounded-lg px-3 py-2 bg-slate-800/50 text-white border-l-2 border-emerald-500">
```

**Grupos de navegación:**
1. Dashboard · Tasks · Calendar
2. (Separador) Leads · Opportunities · Contacts
3. (Parte inferior) Settings · Perfil

---

## Componente B: Main Workspace

### Cabecera

```tsx
<header className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
  <div className="flex items-center gap-3">
    <button className="text-slate-400 hover:text-slate-700">← Back</button>
    <h1 className="text-lg font-semibold text-slate-800">{project.title}</h1>
  </div>
  <button className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600">
    + Add New
  </button>
</header>
```

### Tabs de navegación

```tsx
// Tab activo
<button className="border-b-2 border-emerald-500 pb-3 text-sm font-semibold text-emerald-600">
// Tab inactivo
<button className="pb-3 text-sm text-slate-400 hover:text-slate-700">
```

Pestañas disponibles: `Overview` · `Tech Stack` · `Deployment` · `Tasks / Warranty` · `Files / Drive` · `Notes`

### Accordion de Tareas (Lista colapsable)

```tsx
// Encabezado del grupo
<div className="flex items-center justify-between py-3 cursor-pointer select-none">
  <div className="flex items-center gap-2">
    <ChevronDownIcon className="h-4 w-4 text-slate-400" />
    <span className="text-sm font-semibold text-slate-700">Completed Milestones</span>
    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">3</span>
  </div>
</div>

// Fila de tarea individual
<div className="group flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-50 transition-colors">
  <input type="checkbox" checked={task.isCompleted} className="rounded border-slate-300 text-emerald-500" />
  <span className="flex-1 text-sm text-slate-700">{task.description}</span>
  <span className="flex items-center gap-1 text-xs text-slate-400">
    <CalendarIcon className="h-3 w-3" />{formatDate(task.dueDate)}
  </span>
  <CategoryBadge category={task.category} />
  <AvatarStack urls={task.assigneeAvatarUrls} />
  <button className="hidden group-hover:flex items-center text-slate-400 hover:text-slate-700">
    ···
  </button>
</div>
```

**Grupos de tareas (GroupType):**
- `Milestone` → badge `bg-emerald-50 text-emerald-600`
- `WarrantyPending` → badge `bg-amber-50 text-amber-600`
- `PostWarranty` → badge `bg-purple-50 text-purple-600`

---

## Componente C: Details Pane

### Bloque 1 – Project Basics

```tsx
<div className="border-b border-slate-100 p-6 space-y-3">
  <p className="text-2xl font-bold text-emerald-500">{project.priceFormatted}</p>
  <div className="grid grid-cols-2 gap-2 text-sm">
    <span className="text-slate-400">Start</span>
    <span className="text-slate-700">{formatDate(project.startDate)}</span>
    <span className="text-slate-400">End</span>
    <span className="text-slate-700">{formatDate(project.endDate)}</span>
    <span className="text-slate-400">Warranty End</span>
    <span className="font-medium text-slate-800">{formatDate(project.warrantyEndDate)}</span>
  </div>
</div>
```

### Bloque 2 – Tech Stack & Links

```tsx
<div className="border-b border-slate-100 p-6 space-y-3">
  <a href={project.driveLink} target="_blank" className="flex items-center gap-2 text-sm text-sky-600 hover:underline">
    <DriveIcon /> Google Drive
  </a>
  <a href={`https://github.com/${project.gitHubRepoUrl}`} target="_blank" className="flex items-center gap-2 text-sm text-sky-600 hover:underline">
    <GitHubIcon /> {project.gitHubRepoUrl}
  </a>
  <div className="flex flex-wrap gap-2 mt-2">
    <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs text-sky-600">{project.hostingProvider}</span>
    {project.externalDatabase && (
      <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs text-sky-600">{project.externalDatabase}</span>
    )}
  </div>
</div>
```

### Bloque 3 – GitHub README Preview

```tsx
<div className="border-b border-slate-100 p-6">
  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">README</h3>
  <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-100 p-4">
    <ReactMarkdown className="prose prose-slate prose-sm max-w-none">
      {readme}
    </ReactMarkdown>
  </div>
</div>
```

### Bloque 4 – Alerta de Renovación de Hosting

```tsx
// Estado normal (> 30 días)
<div className="m-6 rounded-xl bg-slate-50 p-4">

// Alerta activa (< 30 días)
<div className="m-6 rounded-xl bg-amber-50 border border-amber-200 p-4">
  <div className="flex items-center justify-between">
    <span className="text-sm font-semibold text-amber-700">Hosting Renewal</span>
    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
      {project.daysUntilHostingRenewal}d left
    </span>
  </div>
  <p className="mt-1 text-xs text-amber-600">
    Vence el {formatDate(project.hostingRenewalDate)}
  </p>
```

---

## Skeleton Loaders (Shimmer Effect)

Usar siempre `animate-pulse` de Tailwind. Respetar la geometría exacta del bloque que reemplaza.

```tsx
// Skeleton para Details Pane
<div className="animate-pulse p-6 space-y-4">
  <div className="h-8 w-1/2 rounded-lg bg-slate-200" />       {/* precio */}
  <div className="space-y-2">
    <div className="h-4 w-full rounded bg-slate-200" />
    <div className="h-4 w-3/4 rounded bg-slate-200" />
    <div className="h-4 w-2/3 rounded bg-slate-200" />
  </div>
  <div className="h-40 rounded-xl bg-slate-200" />              {/* README */}
</div>

// Skeleton para fila de tarea
<div className="animate-pulse flex items-center gap-3 px-3 py-2.5">
  <div className="h-4 w-4 rounded bg-slate-200" />
  <div className="h-4 flex-1 rounded bg-slate-200" />
  <div className="h-4 w-16 rounded bg-slate-200" />
  <div className="h-5 w-14 rounded-full bg-slate-200" />
</div>
```

---

## Reglas de Interacción

- **Hover en filas de tarea:** `hover:bg-slate-50 transition-colors` + reveal del botón `···` con `group-hover:flex`.
- **Focus en inputs:** `focus:ring-2 focus:ring-emerald-500 focus:border-transparent`.
- **Botones primarios:** `bg-emerald-500 hover:bg-emerald-600 text-white`.
- **Botones secundarios:** `bg-white border border-slate-200 text-slate-700 hover:bg-slate-50`.
- **Transiciones:** siempre `transition-colors duration-150`.
