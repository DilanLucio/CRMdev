# Technical & UI Blueprint: DevCRM

Este documento consolida la arquitectura técnica, el modelo de datos y la especificación de interfaz de usuario (UI/UX) basada en el sistema de diseño **Nexus Dashboard**. Sirve como guía única para el desarrollo independiente de componentes en React y endpoints en .NET.

---

## 1. Sistema de Diseño & Tokens de Color

Para replicar exactamente los efectos visuales y la jerarquía de la referencia, se utilizarán los siguientes tokens de diseño (mapeables directamente a clases de Tailwind CSS):

### Paleta de Colores

- **Sidebar (Fondo Oscuro):** Azul marino profundo / Slate nocturno (`#1A1C29` / `bg-slate-900`).
- **Fondo de la Aplicación:** Gris neutro ultra claro (`#F8F9FA` / `bg-slate-50`).
- **Tarjetas y Contenedores:** Blanco puro (`#FFFFFF` / `bg-white`) con bordes suaves (`border-slate-100`) y esquinas redondeadas (`rounded-xl`).
- **Texto Principal:** Gris oscuro de alto contraste (`#2D3748` / `text-slate-800`).
- **Texto Secundario/Muted:** Gris medio (`#718096` / `text-slate-400`).

### Estados y Badges (Etiquetas)

| Estado / Categoría | Color de Fondo | Color de Texto | Uso en la UI |
|---|---|---|---|
| To Do / Completed | Verde menta claro (`bg-emerald-50`) | Verde esmeralda (`text-emerald-600`) | Hitos completados / Precios exitosos. |
| In Progress / Warning | Amarillo/Naranja sutil (`bg-amber-50`) | Ámbar (`text-amber-600`) | Tareas pendientes / Garantía próxima a vencer. |
| Muted / Post-Warranty | Morado claro (`bg-purple-50`) | Púrpura (`text-purple-600`) | Recordatorios anuales / Renovación de hosting. |
| General Tags | Azul cielo claro (`bg-sky-50`) | Azul corporativo (`text-sky-600`) | Tags de tipo de infraestructura o tecnología. |

---

## 2. Distribución de la Interfaz (Layout de 3 Columnas)

El CRM se estructurará en un Grid principal que divide la pantalla de manera eficiente:

```
+-----------------------------------------------------------------------------------------+
| [A] SIDEBAR NAV   | [B] MAIN WORKSPACE (Cabecera + Tabs Dinámicos)       | [C] DETAILS  |
|                   |                                                      |     PANE     |
| . Dashboard       |  < Back  Project Details               [ + Add New ] |              |
| . Tasks           |  --------------------------------------------------  | . Métricas   |
| . Calendar        |  Overview | Tech Stack | [Tasks/Warranty] | Drive   |   Financieras|
|                   |  --------------------------------------------------  |              |
| [Secciones]       |                                                      | . Enlaces a  |
| - Sales           |  ( + ) Completed Milestones [3]                      |   Drive/Git  |
| - Marketing       |  [=] Tarea Entregada ........ [Fecha] [Badge] [Av]   |              |
|                   |                                                      | . Preview del|
|                   |  ( + ) Pending for Warranty [1]                      |   README.md  |
| [Configuración]   |  [ ] Fix Bug: PDF Export .... [Fecha] [Badge] [Av]   |              |
|                   |                                                      | . Alerta de  |
| . Perfil Usuario  |  ( + ) Post-Warranty Reminders                       |   Hosting    |
+-----------------------------------------------------------------------------------------+
```

### Componente A: Sidebar de Navegación (Fijo Izquierda)

- **Ancho:** Fijo (`w-64`).
- **Estilo:** Fondo oscuro con elementos de menú activos resaltados mediante un background ligeramente más claro (`bg-slate-800/50`) y un indicador visual vertical (borde izquierdo de color o cambio de opacidad).
- **Secciones agrupadas:** Gestión interna (Dashboard, Tasks, Calendar), CRM Comercial (Leads, Opportunities, Contacts) y Configuración en la parte inferior.

### Componente B: Espacio de Trabajo Principal (Centro)

- **Cabecera:** Botón de retorno contextual (`<`), título dinámico del proyecto activo, y botón de acción principal destacado en verde (`[Add New]`).
- **Fila de Pestañas (Tabs Nav):** Sistema de navegación horizontal (`Overview`, `Tech Stack`, `Deployment`, `Tasks/Warranty`, `Files/Drive`, `Notes`). La pestaña activa tendrá una línea inferior (underline) en verde o azul y texto en negrita.
- **Listas colapsables (Accordions):** Agrupación jerárquica de tareas por bloques de estado con un contador numérico sutil al lado del título (ej: `Completed Milestones [3]`). Cada fila de tarea debe incluir:
  - Nombre o descripción de la tarea a la izquierda.
  - Fecha límite o de ejecución con icono de calendario.
  - Badge de categoría coloreado.
  - Lista apilada (Avatar Stack) de los desarrolladores/responsables asignados.

### Componente C: Panel Lateral de Detalles (Derecha)

- **Ancho:** Fijo (`w-80` o `w-96`) con fondo blanco y separación mediante borde sutil.
- **Bloque 1 — Project Basics:** Muestra el precio en formato gigante destacado en verde (`text-emerald-500 text-2xl font-bold`), fecha de inicio, fecha de fin y la fecha calculada de fin de garantía (`Warranty End`).
- **Bloque 2 — Tech Stack & Links:** Enlaces interactivos con iconos hacia la carpeta de Google Drive y el repositorio de GitHub, acompañados de tags limpios para el hosting (Vercel/AWS) y bases de datos (Upstash Redis).
- **Bloque 3 — GitHub README Preview:** Tarjeta contenedora interna con scroll (`max-h-60 overflow-y-auto`) que renderiza el Markdown crudo obtenido de la API de GitHub en formato de texto enriquecido limpio.
- **Bloque 4 — Alerta de Renovación:** Widget en la parte inferior con fondo claro que calcula dinámicamente el costo esperado y enciende un badge de alerta (Ámbar/Rojo) 30 días antes de que se cumpla el año del proyecto.

---

## 3. Modelo de Datos Extendido (Campos UI para C#)

Para alimentar esta interfaz exacta sin hacer peticiones adicionales, el DTO de respuesta del backend (`ProjectDetailsDto`) debe mapear los siguientes campos estructurados:

```csharp
public class ProjectDetailsDto
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string ClientName { get; set; }
    public decimal Price { get; set; }
    public string PriceFormatted => Price.ToString("C0"); // Ej: $25,000

    // Fechas de Control
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime WarrantyEndDate => EndDate.AddMonths(3);
    public DateTime HostingRenewalDate => EndDate.AddYears(1);

    // Enlaces e Infraestructura
    public string DriveLink { get; set; }
    public string GitHubRepoUrl { get; set; }
    public string HostingProvider { get; set; }   // Vercel, Netlify, etc.
    public string ExternalDatabase { get; set; }  // Upstash Redis, etc.

    // Colecciones para las listas del Workspace
    public List<TaskDto> Tasks { get; set; } = new();
}

public class TaskDto
{
    public Guid Id { get; set; }
    public string Description { get; set; }
    public DateTime? DueDate { get; set; }
    public string Category { get; set; }                  // Sales, Dev, Design, Ops
    public string GroupType { get; set; }                 // Milestone, WarrantyPending, PostWarranty
    public bool IsCompleted { get; set; }
    public List<string> AssigneeAvatarUrls { get; set; }  // URLs para el Avatar Stack de la UI
}
```

---

## 4. Requerimientos de UI para el Frontend (React + TypeScript)

- **Renderizado de Markdown:** Usar `react-markdown` configurado con estilos tipográficos heredados de Tailwind (`prose prose-slate`) para que el README de GitHub mantenga consistencia con los colores de la aplicación.
- **Efectos Hover y Focus:** Las filas de las tareas deben reaccionar con un cambio sutil de fondo (`hover:bg-slate-50`) y los botones interactivos de los extremos deben revelar un menú de opciones (`...`) al pasar el cursor.
- **Esquema de Carga (Skeletons):** Al alternar entre proyectos, el panel lateral derecho e izquierdo de tareas deben mostrar una animación de carga (shimmer effect) respetando la geometría exacta de las tarjetas para mitigar el parpadeo visual.
