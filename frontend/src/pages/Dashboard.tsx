import { Link } from 'react-router-dom';
import { Plus, Inbox, Sparkles } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useOpportunities } from '../hooks/useOpportunities';
import { OpportunityStatus } from '../types/dto';
import { ProjectRow } from '../components/projects/ProjectRow';
import { Skeleton } from '../components/ui/Skeleton';

function todayCount(items: { createdAt: string }[]): number {
  const today = new Date().toDateString();
  return items.filter(o => new Date(o.createdAt).toDateString() === today).length;
}

export function Dashboard() {
  const { data, isLoading, error } = useProjects();
  const { data: aiLeads } = useOpportunities(OpportunityStatus.AiGenerated);
  const leadsHoy = todayCount(aiLeads ?? []);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div>
          <h1 className="text-base font-semibold text-slate-900">Proyectos</h1>
          <p className="text-xs text-slate-500 mt-0.5">Ordenados por urgencia de garantía</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/opportunities"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50"
          >
            <Sparkles className="h-4 w-4 text-teal-500" strokeWidth={2} />
            <span className="text-slate-500">Leads IA hoy</span>
            <span className="ml-1 min-w-[20px] rounded-full bg-teal-100 px-1.5 py-0.5 text-center text-xs font-semibold text-teal-700">
              {leadsHoy}
            </span>
          </Link>
          <Link
            to="/projects/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            Nuevo proyecto
          </Link>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {isLoading && (
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-600">
            Error cargando proyectos — verifica que el backend esté corriendo.
          </div>
        )}

        {data && data.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-16 text-center">
            <Inbox className="mb-3 h-8 w-8 text-slate-400" strokeWidth={1.5} />
            <p className="text-sm text-slate-500">Sin proyectos todavía</p>
            <Link
              to="/projects/new"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              Crear el primero
            </Link>
          </div>
        )}

        {data && data.length > 0 && (
          <div className="grid gap-4 lg:grid-cols-2">
            {data.map((p) => <ProjectRow key={p.id} project={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
