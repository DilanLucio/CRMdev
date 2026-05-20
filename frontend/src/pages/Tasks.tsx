import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTasks, useToggleTask, useDeleteTask } from '../hooks/useTasks';
import { Skeleton } from '../components/ui/Skeleton';
import type { TaskListItemDto } from '../types/dto';

type Filter = 'all' | 'pending' | 'completed';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'pending', label: 'Pendientes' },
  { key: 'completed', label: 'Completadas' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function TaskRow({ task }: { task: TaskListItemDto }) {
  const toggle = useToggleTask();
  const remove = useDeleteTask();

  return (
    <div className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
      <input
        type="checkbox"
        checked={task.isCompleted}
        onChange={() => toggle.mutate(task.id)}
        disabled={toggle.isPending}
        className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-slate-900"
      />

      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        <span className={`text-sm ${task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
          {task.description}
        </span>
        <div className="flex items-center gap-2">
          <Link
            to={`/projects/${task.projectId}`}
            className="truncate text-xs text-blue-600 hover:underline"
          >
            {task.projectTitle}
          </Link>
          <span className="text-slate-300">·</span>
          <span className="truncate text-xs text-slate-500">{task.clientName}</span>
        </div>
      </div>

      <span className="hidden text-xs text-slate-500 sm:block shrink-0">
        {formatDate(task.createdAt)}
      </span>

      <button
        onClick={() => remove.mutate(task.id)}
        disabled={remove.isPending}
        className="hidden rounded-lg px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 group-hover:block disabled:opacity-50"
      >
        Eliminar
      </button>
    </div>
  );
}

export function Tasks() {
  const [filter, setFilter] = useState<Filter>('all');
  const { data, isLoading, error } = useTasks();

  const filtered = data?.filter((t) => {
    if (filter === 'pending') return !t.isCompleted;
    if (filter === 'completed') return t.isCompleted;
    return true;
  }) ?? [];

  const pendingCount = data?.filter((t) => !t.isCompleted).length ?? 0;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div>
          <h1 className="text-base font-semibold text-slate-900">Tareas</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isLoading ? '…' : `${pendingCount} pendientes de todos los proyectos`}
          </p>
        </div>
      </header>

      <div className="border-b border-slate-200 bg-white px-6">
        <div className="flex gap-5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`pb-3 pt-3 text-sm font-medium transition-colors ${
                filter === f.key
                  ? 'border-b-2 border-slate-900 text-slate-900'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {f.label}
              {f.key !== 'all' && data && (
                <span className="ml-1.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
                  {f.key === 'pending'
                    ? data.filter((t) => !t.isCompleted).length
                    : data.filter((t) => t.isCompleted).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {isLoading && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-600">
            Error cargando tareas — verifica que el backend esté corriendo.
          </div>
        )}

        {!isLoading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-16 text-center">
            <p className="text-sm text-slate-500">
              {filter === 'all'
                ? 'Sin tareas todavía'
                : filter === 'pending'
                ? 'No hay tareas pendientes'
                : 'No hay tareas completadas'}
            </p>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="flex flex-col gap-2">
            {filtered.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
