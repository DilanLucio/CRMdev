import { useParams, Link } from 'react-router-dom';
import { useProject } from '../hooks/useProjects';
import { DetailsPane } from '../components/projects/DetailsPane';
import { TaskAccordion } from '../components/projects/TaskAccordion';
import { DetailsPaneSkeleton, TaskRowSkeleton } from '../components/ui/Skeleton';

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useProject(id);

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          No se pudo cargar el proyecto.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-slate-400 hover:text-slate-700">
              ← Back
            </Link>
            <h1 className="text-lg font-semibold text-slate-800">
              {data?.title ?? 'Loading...'}
            </h1>
          </div>
        </header>

        <nav className="flex gap-6 border-b border-slate-100 bg-white px-6">
          <button className="border-b-2 border-emerald-500 pb-3 pt-2 text-sm font-semibold text-emerald-600">
            Tasks / Warranty
          </button>
          <button className="pb-3 pt-2 text-sm text-slate-400 hover:text-slate-700">
            Overview
          </button>
          <button className="pb-3 pt-2 text-sm text-slate-400 hover:text-slate-700">
            Tech Stack
          </button>
          <button className="pb-3 pt-2 text-sm text-slate-400 hover:text-slate-700">
            Files / Drive
          </button>
        </nav>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <TaskRowSkeleton key={i} />)}
            </div>
          )}
          {data && <TaskAccordion projectId={data.id} tasks={data.tasks} />}
        </div>
      </div>

      {isLoading && <div className="w-96 border-l border-slate-100 bg-white"><DetailsPaneSkeleton /></div>}
      {data && <DetailsPane project={data} />}
    </>
  );
}
