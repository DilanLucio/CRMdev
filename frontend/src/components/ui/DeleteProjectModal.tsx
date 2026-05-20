import { useState } from 'react';
import { Trash2 } from 'lucide-react';

type Scope = 'project' | 'project-and-client';

interface Props {
  projectTitle: string;
  clientName: string;
  isPending: boolean;
  onConfirm: (scope: Scope) => void;
  onCancel: () => void;
}

export function DeleteProjectModal({ projectTitle, clientName, isPending, onConfirm, onCancel }: Props) {
  const [scope, setScope] = useState<Scope>('project');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <Trash2 className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <h2 className="text-base font-semibold text-slate-900">¿Eliminar proyecto?</h2>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Esta acción es irreversible.
        </p>

        <div className="mt-5 space-y-2">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 transition-colors hover:bg-slate-50 has-[:checked]:border-slate-900 has-[:checked]:bg-slate-50">
            <input
              type="radio"
              name="scope"
              value="project"
              checked={scope === 'project'}
              onChange={() => setScope('project')}
              className="mt-0.5 accent-slate-900"
            />
            <div>
              <p className="text-sm font-medium text-slate-900">Solo el proyecto</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Elimina <span className="font-medium text-slate-700">"{projectTitle}"</span> y sus tareas.
                El cliente <span className="font-medium text-slate-700">{clientName}</span> se conserva.
              </p>
            </div>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 transition-colors hover:bg-slate-50 has-[:checked]:border-red-300 has-[:checked]:bg-red-50">
            <input
              type="radio"
              name="scope"
              value="project-and-client"
              checked={scope === 'project-and-client'}
              onChange={() => setScope('project-and-client')}
              className="mt-0.5 accent-red-600"
            />
            <div>
              <p className="text-sm font-medium text-red-700">Proyecto y cliente</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Elimina el proyecto y también al cliente{' '}
                <span className="font-medium text-slate-700">{clientName}</span> con todos sus datos.
              </p>
            </div>
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(scope)}
            disabled={isPending}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-all disabled:opacity-40 ${
              scope === 'project-and-client'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            {isPending ? 'Eliminando...' : 'Confirmar eliminación'}
          </button>
        </div>
      </div>
    </div>
  );
}
