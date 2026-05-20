import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
  FolderOpen,
  Code2,
  ArrowUpRight,
  StickyNote,
  Inbox,
} from 'lucide-react';
import { useProject, useDeleteProject, useDeleteProjectWithClient, useUpdateProject } from '../hooks/useProjects';
import { TaskAccordion } from '../components/projects/TaskAccordion';
import { ReadmePreview } from '../components/projects/ReadmePreview';
import { TaskRowSkeleton } from '../components/ui/Skeleton';
import { DeleteProjectModal } from '../components/ui/DeleteProjectModal';
import { Badge } from '../components/ui/Badge';
import { formatDate } from '../lib/format';
import { PricingModel, ProjectType } from '../types/dto';
import type { ProjectDetailsDto, ProjectTypeValue, PricingModelValue, UpdateProjectDto } from '../types/dto';

type TabId = 'overview' | 'tasks' | 'tech' | 'files';

interface TabDef {
  id: TabId;
  label: string;
}

function buildTabs(type: ProjectTypeValue): TabDef[] {
  const isService = type === ProjectType.Servicios;
  const tabs: TabDef[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'tasks', label: isService ? 'Tareas' : 'Tareas / Garantía' },
  ];
  if (!isService) tabs.push({ id: 'tech', label: 'Tech Stack' });
  tabs.push({ id: 'files', label: 'Archivos' });
  return tabs;
}

const PRICING_LABEL: Record<PricingModelValue, string> = {
  [PricingModel.OneTime]: 'Pago único',
  [PricingModel.Monthly]: 'Mensual',
  [PricingModel.Subscription]: 'Suscripción',
};

const TYPE_LABEL: Record<ProjectTypeValue, string> = {
  [ProjectType.LandingPage]: 'Landing Page',
  [ProjectType.ErpCrm]: 'ERP / CRM',
  [ProjectType.Servicios]: 'Servicios',
};

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useProject(id);
  const deleteProject = useDeleteProject();
  const deleteWithClient = useDeleteProjectWithClient();
  const updateProject = useUpdateProject(id ?? '');
  const [showDelete, setShowDelete] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [tab, setTab] = useState<TabId>('overview');

  const tabs = data ? buildTabs(data.type) : [{ id: 'overview' as TabId, label: 'Overview' }];

  const isPendingDelete = deleteProject.isPending || deleteWithClient.isPending;

  const handleConfirmDelete = (scope: 'project' | 'project-and-client') => {
    if (!id) return;
    const action = scope === 'project-and-client' ? deleteWithClient : deleteProject;
    action.mutate(id, { onSuccess: () => navigate('/') });
  };

  const buildDto = (overrides: Partial<UpdateProjectDto>): UpdateProjectDto => ({
    title: data!.title,
    type: data!.type,
    services: data!.services.length ? data!.services : null,
    price: data!.price,
    pricingModel: data!.pricingModel,
    nextPaymentDate: data!.nextPaymentDate,
    startDate: data!.startDate,
    endDate: data!.endDate,
    driveLink: data!.driveLink,
    gitHubRepoUrl: data!.gitHubRepoUrl,
    hostingProvider: data!.hostingProvider,
    externalDatabase: data!.externalDatabase,
    notes: data!.notes,
    isActive: data!.isActive,
    ...overrides,
  });

  const handleToggleActive = (next: boolean) => {
    if (!data) return;
    updateProject.mutate(buildDto({ isActive: next }));
  };

  const handleAddNote = (text: string) => {
    if (!data) return;
    const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const entry = `[${stamp}] ${text.trim()}`;
    const prev = (data.notes ?? '').trim();
    const merged = prev ? `${entry}\n\n---\n\n${prev}` : entry;
    updateProject.mutate(buildDto({ notes: merged }), {
      onSuccess: () => setShowAddNote(false),
    });
  };

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-xs text-red-600">
          No se pudo cargar el proyecto.
        </div>
      </div>
    );
  }

  return (
    <>
      {showDelete && data && (
        <DeleteProjectModal
          projectTitle={data.title}
          clientName={data.clientName}
          isPending={isPendingDelete}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
      {showAddNote && data && (
        <AddNoteModal
          isPending={updateProject.isPending}
          onConfirm={handleAddNote}
          onCancel={() => setShowAddNote(false)}
        />
      )}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white px-6 py-5">
          <div className="flex items-center gap-3 mb-3">
            <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
              Volver
            </Link>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <h1 className="text-2xl font-semibold text-slate-900 truncate">
                {data?.title ?? 'Cargando...'}
              </h1>
              {data && (
                <Badge variant={data.isActive ? 'success' : 'muted'}>
                  {data.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setTab('tasks')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" strokeWidth={2} />
                Tarea
              </button>
              {data && (
                <KebabMenu
                  isActive={data.isActive}
                  onToggleActive={handleToggleActive}
                  onDelete={() => setShowDelete(true)}
                  onAddNote={() => setShowAddNote(true)}
                  onEdit={() => navigate(`/projects/${data.id}/edit`)}
                  isToggling={updateProject.isPending}
                />
              )}
            </div>
          </div>
        </header>

        {/* Tabs */}
        <nav className="flex gap-6 border-b border-slate-200 bg-white px-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`pb-3 pt-3 text-sm transition-colors ${
                tab === t.id
                  ? 'border-b-2 border-slate-900 font-semibold text-slate-900'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <TaskRowSkeleton key={i} />)}
            </div>
          )}
          {data && (
            <>
              {tab === 'overview' && <OverviewTab project={data} />}
              {tab === 'tasks' && (
                <div className="space-y-6">
                  <TaskAccordion projectId={data.id} tasks={data.tasks} />
                </div>
              )}
              {tab === 'tech' && data.type !== ProjectType.Servicios && <TechStackTab project={data} />}
              {tab === 'files' && <ArchivosTab project={data} />}
            </>
          )}
        </div>
      </div>

    </>
  );
}

// ── Overview ─────────────────────────────────────────────────────────────────

function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`mt-2 text-lg font-semibold ${accent ? 'text-slate-900' : 'text-slate-900'}`}>{value}</p>
    </div>
  );
}

function OverviewTab({ project }: { project: ProjectDetailsDto }) {
  const completed = project.tasks.filter((t) => t.isCompleted).length;
  const pending = project.tasks.length - completed;
  const recurring = project.pricingModel !== PricingModel.OneTime;
  const isService = project.type === ProjectType.Servicios;
  const isWebProject = !isService;

  const warrantyVariant =
    project.daysLeftForWarranty < 0 ? 'danger'
    : project.daysLeftForWarranty < 15 ? 'warning'
    : 'success';
  const hostingVariant = project.daysUntilHostingRenewal < 30 ? 'danger' : 'info';

  return (
    <div className="space-y-6">
      {/* Header strip: type + pricing model */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="info">{TYPE_LABEL[project.type]}</Badge>
        <Badge variant="muted">{PRICING_LABEL[project.pricingModel]}</Badge>
        {!project.isActive && <Badge variant="muted">Inactivo</Badge>}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={recurring ? `Valor (${PRICING_LABEL[project.pricingModel]})` : 'Valor'} value={project.priceFormatted} accent />
        <Stat label="Cliente" value={project.clientName} />
        <Stat label="Inicio" value={formatDate(project.startDate)} />
        <Stat label={isService ? 'Fin contrato' : 'Entrega'} value={formatDate(project.endDate)} />
      </div>

      {recurring && project.nextPaymentDate && project.isActive && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Próximo pago</p>
              <p className="mt-1 text-base font-semibold text-amber-800">{formatDate(project.nextPaymentDate)}</p>
            </div>
            <Badge variant="warning">{PRICING_LABEL[project.pricingModel]}</Badge>
          </div>
        </div>
      )}

      {/* Service-specific: services included */}
      {isService && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Servicios incluidos</h3>
          {project.services.length === 0 ? (
            <p className="text-sm text-slate-500">Sin servicios registrados.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {project.services.map((s) => (
                <Badge key={s} variant="info">{s}</Badge>
              ))}
            </div>
          )}
          <div className="mt-4 flex gap-4 text-xs text-slate-500 border-t border-slate-100 pt-4">
            <span><span className="font-medium text-slate-900">{pending}</span> tareas pendientes</span>
            <span><span className="font-medium text-slate-900">{completed}</span> completadas</span>
          </div>
        </div>
      )}

      {/* Web project (Landing / ERP-CRM): warranty + hosting */}
      {isWebProject && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Estado de garantía</h3>
              <Badge variant={warrantyVariant}>
                {project.daysLeftForWarranty < 0
                  ? 'Vencida'
                  : `${project.daysLeftForWarranty} días`}
              </Badge>
            </div>
            <p className="text-sm text-slate-500">
              Fin de garantía: <span className="font-medium text-slate-900">{formatDate(project.warrantyEndDate)}</span>
            </p>
            <div className="mt-4 flex gap-4 text-xs text-slate-500">
              <span><span className="font-medium text-slate-900">{pending}</span> pendientes</span>
              <span><span className="font-medium text-slate-900">{completed}</span> completadas</span>
            </div>
          </div>

          {project.hostingProvider && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Hosting</h3>
                <Badge variant={hostingVariant}>{project.daysUntilHostingRenewal}d</Badge>
              </div>
              <p className="text-sm text-slate-500">
                Proveedor: <span className="font-medium text-slate-900">{project.hostingProvider}</span>
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Renueva: <span className="font-medium text-slate-900">{formatDate(project.hostingRenewalDate)}</span>
              </p>
            </div>
          )}
        </div>
      )}

      <NotesCard notes={project.notes} />

      {isWebProject && project.gitHubRepoUrl && (
        <ReadmePreview projectId={project.id} gitHubRepoUrl={project.gitHubRepoUrl} />
      )}
    </div>
  );
}

// ── Tech Stack ───────────────────────────────────────────────────────────────

function TechItem({ label, value, link }: { label: string; value: string; link?: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="mt-0.5 block truncate text-sm text-blue-600 hover:underline"
          >
            {value}
          </a>
        ) : (
          <p className="mt-0.5 truncate text-sm font-medium text-slate-900">{value}</p>
        )}
      </div>
    </div>
  );
}

function TechStackTab({ project }: { project: ProjectDetailsDto }) {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">Infraestructura</h3>
        <div className="space-y-3">
          {project.hostingProvider && <TechItem label="Hosting" value={project.hostingProvider} />}
          {project.externalDatabase && (
            <TechItem label="Base de datos" value={project.externalDatabase} />
          )}
          {project.gitHubRepoUrl && (
            <TechItem
              label="Repositorio"
              value={project.gitHubRepoUrl}
              link={`https://github.com/${project.gitHubRepoUrl}`}
            />
          )}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {project.hostingProvider && <Badge variant="info">{project.hostingProvider}</Badge>}
          {project.externalDatabase && <Badge variant="info">{project.externalDatabase}</Badge>}
          {project.gitHubRepoUrl && <Badge variant="muted">GitHub</Badge>}
        </div>
      </section>
    </div>
  );
}

// ── Archivos ─────────────────────────────────────────────────────────────────

function ArchivosTab({ project }: { project: ProjectDetailsDto }) {
  const hasAny = project.driveLink || project.gitHubRepoUrl;

  return (
    <div className="space-y-4">
      {!hasAny && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <FolderOpen className="mb-2 h-8 w-8 text-slate-400" strokeWidth={1.5} />
          <p className="text-sm text-slate-500">Sin archivos vinculados a este proyecto.</p>
        </div>
      )}

      {project.driveLink && (
        <a
          href={project.driveLink}
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <FolderOpen className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">Google Drive</p>
            <p className="truncate text-xs text-slate-500">{project.driveLink}</p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
        </a>
      )}

      {project.gitHubRepoUrl && (
        <a
          href={`https://github.com/${project.gitHubRepoUrl}`}
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <Code2 className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">Repositorio GitHub</p>
            <p className="truncate text-xs text-slate-500">{project.gitHubRepoUrl}</p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
        </a>
      )}
    </div>
  );
}

// ── Notes (read-only card + add modal) ───────────────────────────────────────

interface NoteEntry {
  stamp: string | null;
  body: string;
}

function parseNotes(raw: string | null): NoteEntry[] {
  if (!raw) return [];
  return raw
    .split(/\n\n---\n\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const m = chunk.match(/^\[([^\]]+)\]\s*([\s\S]*)$/);
      return m
        ? { stamp: m[1], body: m[2].trim() }
        : { stamp: null, body: chunk };
    });
}

function NotesCard({ notes }: { notes: string | null }) {
  const entries = parseNotes(notes);
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Notas</h3>
        <span className="text-xs text-slate-400">{entries.length} entrada{entries.length === 1 ? '' : 's'}</span>
      </div>
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
          <Inbox className="mb-2 h-7 w-7" strokeWidth={1.5} />
          <p className="text-sm">
            Sin notas todavía. Usa el menú <MoreVertical className="inline h-3.5 w-3.5 align-text-bottom" strokeWidth={1.75} /> → <span className="font-medium text-slate-700">Agregar nota</span>.
          </p>
        </div>
      ) : (
        <ul className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {entries.map((e, i) => (
            <li key={i} className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
              {e.stamp && (
                <p className="mb-1 text-xs font-medium text-slate-400">{e.stamp}</p>
              )}
              <p className="whitespace-pre-wrap text-sm text-slate-700">{e.body}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

interface AddNoteModalProps {
  isPending: boolean;
  onConfirm: (text: string) => void;
  onCancel: () => void;
}

function AddNoteModal({ isPending, onConfirm, onCancel }: AddNoteModalProps) {
  const [text, setText] = useState('');

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isPending) onCancel();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isPending, onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && !isPending && onCancel()}
    >
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Agregar nota</h2>
          <span className="text-xs text-slate-400">{text.length}/4000</span>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          maxLength={4000}
          autoFocus
          placeholder="Contexto, recordatorio, acuerdo con el cliente…"
          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-colors resize-y min-h-[160px]"
        />
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(text)}
            disabled={isPending || !text.trim()}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-800 disabled:opacity-40"
          >
            {isPending ? 'Guardando...' : 'Guardar nota'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Kebab menu ───────────────────────────────────────────────────────────────

interface KebabMenuProps {
  isActive: boolean;
  onToggleActive: (next: boolean) => void;
  onDelete: () => void;
  onAddNote: () => void;
  onEdit: () => void;
  isToggling: boolean;
}

function KebabMenu({ isActive, onToggleActive, onDelete, onAddNote, onEdit, isToggling }: KebabMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Más opciones"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
      >
        <MoreVertical className="h-5 w-5" strokeWidth={1.75} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-72 origin-top-right rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
        >
          {/* Active toggle */}
          <div className="flex items-start justify-between gap-3 rounded-lg px-3 py-3 hover:bg-slate-50">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900">Cliente activo</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {isActive
                  ? 'Sigue siendo nuestro cliente.'
                  : 'Ex-cliente al que se le dio servicio.'}
              </p>
            </div>
            <Switch
              checked={isActive}
              disabled={isToggling}
              onChange={(v) => onToggleActive(v)}
            />
          </div>

          <div className="my-1 border-t border-slate-100" />

          {/* Edit */}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Pencil className="h-4 w-4" strokeWidth={1.75} />
            Editar proyecto
          </button>

          {/* Add note */}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onAddNote();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
          >
            <StickyNote className="h-4 w-4" strokeWidth={1.75} />
            Agregar nota
          </button>

          <div className="my-1 border-t border-slate-100" />

          {/* Delete */}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            Eliminar proyecto
          </button>
        </div>
      )}
    </div>
  );
}

// ── Switch ───────────────────────────────────────────────────────────────────

function Switch({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
        checked ? 'bg-emerald-500' : 'bg-slate-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}
