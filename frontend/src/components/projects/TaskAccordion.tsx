import { useState } from 'react';
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
    <div className="space-y-2">
      <Group title="Pending for Warranty" tasks={pending} projectId={projectId} variant="warning" />
      <Group title="Completed Milestones" tasks={completed} projectId={projectId} variant="success" defaultOpen={false} />
      <AddTaskForm projectId={projectId} />
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
    <div className="rounded-xl border border-slate-100 bg-white">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <span className="text-slate-400">{open ? '▾' : '▸'}</span>
          <span className="text-sm font-semibold text-slate-700">{title}</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{tasks.length}</span>
        </div>
      </button>

      {open && (
        <ul className="divide-y divide-slate-50 px-2 pb-2">
          {tasks.length === 0 && (
            <li className="px-3 py-4 text-center text-xs text-slate-400">Sin tareas</li>
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
                className="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
              />
              <span className={`flex-1 text-sm ${t.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                {t.description}
              </span>
              <span className="text-xs text-slate-400">{formatDate(t.createdAt)}</span>
              <Badge variant={variant}>{variant === 'warning' ? 'Pending' : 'Done'}</Badge>
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
    <form onSubmit={submit} className="flex gap-2 rounded-xl border border-dashed border-slate-200 bg-white p-3">
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Nueva tarea pendiente..."
        className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <button
        type="submit"
        disabled={add.isPending || !description.trim()}
        className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
      >
        Agregar
      </button>
    </form>
  );
}
