import { useState } from 'react';
import { Phone, Mail, X, Plus } from 'lucide-react';
import { useClients, useCreateClient, useUpdateClient } from '../hooks/useClients';
import { Skeleton } from '../components/ui/Skeleton';
import type { ClientDto, CreateClientDto, UpdateClientDto } from '../types/dto';

// ── helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

// ── Client form modal ─────────────────────────────────────────────────────────

interface ClientFormProps {
  initial?: ClientDto;
  onClose: () => void;
}

function ClientForm({ initial, onClose }: ClientFormProps) {
  const isEdit = !!initial;
  const [name, setName] = useState(initial?.name ?? '');
  const [phone, setPhone] = useState(initial?.contactNumber ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');

  const create = useCreateClient();
  const update = useUpdateClient(initial?.id ?? '');
  const isPending = create.isPending || update.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const dto: CreateClientDto | UpdateClientDto = {
      name: name.trim(),
      contactNumber: phone.trim(),
      email: email.trim() || null,
    };
    if (isEdit) {
      await update.mutateAsync(dto as UpdateClientDto);
    } else {
      await create.mutateAsync(dto as CreateClientDto);
    }
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            {isEdit ? 'Editar cliente' : 'Nuevo cliente'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Nombre *</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Empresa o persona"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Teléfono *</label>
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+52 55 0000 0000"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="mt-1 flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-800 disabled:opacity-60"
            >
              {isPending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Client card ───────────────────────────────────────────────────────────────

interface ClientCardProps {
  client: ClientDto;
  onEdit: (client: ClientDto) => void;
}

function ClientCard({ client, onEdit }: ClientCardProps) {
  return (
    <div className="group flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
            {initials(client.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{client.name}</p>
            <p className="text-xs text-slate-500">Cliente desde {formatDate(client.createdAt)}</p>
          </div>
        </div>
        <button
          onClick={() => onEdit(client)}
          className="hidden rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 group-hover:block"
        >
          Editar
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <a
          href={`tel:${client.contactNumber}`}
          className="flex items-center gap-2 text-xs text-slate-700 hover:text-slate-900 transition-colors"
        >
          <Phone className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.75} />
          {client.contactNumber}
        </a>
        {client.email && (
          <a
            href={`mailto:${client.email}`}
            className="flex items-center gap-2 truncate text-xs text-slate-700 hover:text-slate-900 transition-colors"
          >
            <Mail className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.75} />
            {client.email}
          </a>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function Contacts() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ClientDto | null>(null);

  const { data, isLoading, error } = useClients();

  const filtered = data?.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.contactNumber.includes(search) ||
    (c.email ?? '').toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  function openEdit(client: ClientDto) {
    setEditing(client);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  return (
    <>
      {showForm && (
        <ClientForm initial={editing ?? undefined} onClose={closeForm} />
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h1 className="text-base font-semibold text-slate-900">Clientes</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isLoading ? '…' : `${data?.length ?? 0} clientes registrados`}
            </p>
          </div>
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            Nuevo cliente
          </button>
        </header>

        {/* Search */}
        <div className="border-b border-slate-200 bg-white px-6 py-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, teléfono o email…"
            className="w-full max-w-sm rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-600">
              Error cargando clientes — verifica que el backend esté corriendo.
            </div>
          )}

          {!isLoading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-16 text-center">
              <p className="text-sm text-slate-500">
                {search ? 'Sin resultados para esa búsqueda' : 'Sin clientes todavía'}
              </p>
              {!search && (
                <button
                  onClick={() => { setEditing(null); setShowForm(true); }}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
                >
                  <Plus className="h-4 w-4" strokeWidth={2} />
                  Agregar el primero
                </button>
              )}
            </div>
          )}

          {!isLoading && filtered.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((c) => (
                <ClientCard key={c.id} client={c} onEdit={openEdit} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
