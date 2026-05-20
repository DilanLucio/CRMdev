import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { TaskDto } from '../../types/dto';
import { Badge } from '../ui/Badge';
import { formatDate } from '../../lib/format';
import { useAddTask, useCompleteTask } from '../../hooks/useProjects';

interface Props {
  projectId: string;
  tasks: TaskDto[];
}

export function TaskAccordion({ projectId, tasks }: Props) {
  const completed = tasks.filter((t) => t.isCompleted);
  const pending = tasks.filter((t) => !t.isCompleted);

  return (
    <div className="space-y-3">
      <AddTaskForm projectId={projectId} />
      <Group title="Pendiente de garantía" tasks={pending} projectId={projectId} variant="warning" />
      <Group title="Completados" tasks={completed} projectId={projectId} variant="success" defaultOpen={false} />
    </div>
  );
}

function Group({
  title,
  tasks,
  projectId,
  variant,
  defaultOpen = true,
}: {
  title: string;
  tasks: TaskDto[];
  projectId: string;
  variant: 'success' | 'warning';
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const complete = useCompleteTask(projectId);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {open
            ? <ChevronDown className="h-4 w-4 text-slate-400" strokeWidth={2} />
            : <ChevronRight className="h-4 w-4 text-slate-400" strokeWidth={2} />}
          <span className="text-sm font-semibold text-slate-900">{title}</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{tasks.length}</span>
        </div>
      </button>

      {open && (
        <ul className="divide-y divide-slate-100 px-2 pb-2">
          {tasks.length === 0 && (
            <li className="flex flex-col items-center justify-center py-12 text-slate-400">
              <span className="mb-2 text-2xl">◌</span>
              <p className="text-sm">
                {variant === 'warning'
                  ? 'No hay tareas pendientes para esta garantía.'
                  : 'Aún no hay tareas completadas.'}
              </p>
            </li>
          )}
          {tasks.map((t) => (
            <li
              key={t.id}
              className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={t.isCompleted}
                disabled={t.isCompleted || complete.isPending}
                onChange={() => complete.mutate(t.id)}
                className="h-3.5 w-3.5 rounded border-slate-300 accent-slate-900"
              />
              <span className={`flex-1 text-sm ${t.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                {t.description}
              </span>
              <span className="text-xs text-slate-500">{formatDate(t.createdAt)}</span>
              <Badge variant={variant === 'warning' ? 'warning' : 'success'}>
                {variant === 'warning' ? 'Pendiente' : 'Listo'}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AddTaskForm({ projectId }: { projectId: string }) {
  const [description, setDescription] = useState('');
  const add = useAddTask(projectId);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    add.mutate({ description }, { onSuccess: () => setDescription('') });
  };

  return (
    <form
      onSubmit={submit}
      className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm"
    >
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Nueva tarea..."
        className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none border-0 focus:ring-0 focus:outline-none"
      />
      <button
        type="submit"
        disabled={add.isPending || !description.trim()}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-40"
      >
        Agregar
      </button>
    </form>
  );
}
