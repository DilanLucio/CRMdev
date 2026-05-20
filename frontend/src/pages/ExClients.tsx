import { UserMinus, MoreVertical } from 'lucide-react';
import { useInactiveProjects } from '../hooks/useProjects';
import { ProjectRow } from '../components/projects/ProjectRow';
import { Skeleton } from '../components/ui/Skeleton';

export function ExClients() {
  const { data, isLoading, error } = useInactiveProjects();

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div>
          <h1 className="text-base font-semibold text-slate-900">Ex-clientes</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Proyectos inactivos · clientes a los que ya prestamos servicio.
          </p>
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
            Error cargando ex-clientes — verifica que el backend esté corriendo.
          </div>
        )}

        {data && data.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-16 text-center">
            <UserMinus className="mb-2 h-8 w-8 text-slate-400" strokeWidth={1.5} />
            <p className="text-sm text-slate-500">Sin ex-clientes todavía.</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-400">
              Cuando desactives un proyecto desde el menú
              <MoreVertical className="h-3.5 w-3.5" strokeWidth={1.75} />
              aparecerá aquí.
            </p>
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
