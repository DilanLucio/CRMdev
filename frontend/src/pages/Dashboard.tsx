import { Link } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { ProjectRow } from '../components/projects/ProjectRow';
import { Skeleton } from '../components/ui/Skeleton';

export function Dashboard() {
  const { data, isLoading, error } = useProjects();

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Dashboard</h1>
          <p className="text-xs text-slate-400">Proyectos activos ordenados por urgencia</p>
        </div>
        <Link
          to="/projects/new"
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
        >
          + Add New
        </Link>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {isLoading && (
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-36 w-full" />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Error cargando proyectos. Verifica que el backend esté corriendo.
          </div>
        )}

        {data && data.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-500">Sin proyectos todavía.</p>
            <Link
              to="/projects/new"
              className="mt-4 inline-block rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
            >
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
