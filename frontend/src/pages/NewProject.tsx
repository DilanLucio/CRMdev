import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useClients } from '../hooks/useClients';
import { useCreateProject } from '../hooks/useProjects';
import type { CreateProjectDto } from '../types/dto';

export function NewProject() {
  const navigate = useNavigate();
  const clients = useClients();
  const create = useCreateProject();

  const [mode, setMode] = useState<'existing' | 'new'>('new');
  const [clientId, setClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hostingProvider, setHostingProvider] = useState('');
  const [externalDatabase, setExternalDatabase] = useState('');
  const [driveLink, setDriveLink] = useState('');
  const [gitHubRepoUrl, setGitHubRepoUrl] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const dto: CreateProjectDto = {
      clientId: mode === 'existing' ? clientId : null,
      newClient: mode === 'new' ? { name: clientName, contactNumber, email: email || null } : null,
      title,
      price: parseFloat(price) || 0,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      driveLink: driveLink || null,
      gitHubRepoUrl: gitHubRepoUrl || null,
      hostingProvider,
      externalDatabase: externalDatabase || null,
    };
    create.mutate(dto, {
      onSuccess: (p) => navigate(`/projects/${p.id}`),
    });
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-slate-400 hover:text-slate-700">← Back</Link>
          <h1 className="text-lg font-semibold text-slate-800">Nuevo Proyecto</h1>
        </div>
      </header>

      <form onSubmit={submit} className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <Section title="Cliente">
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" checked={mode === 'new'} onChange={() => setMode('new')} />
                Nuevo cliente
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" checked={mode === 'existing'} onChange={() => setMode('existing')} />
                Cliente existente
              </label>
            </div>

            {mode === 'existing' ? (
              <Field label="Cliente">
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className={inputCls}
                  required
                >
                  <option value="">— Seleccionar —</option>
                  {clients.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Nombre"><input className={inputCls} value={clientName} onChange={(e) => setClientName(e.target.value)} required /></Field>
                <Field label="Teléfono"><input className={inputCls} value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required /></Field>
                <Field label="Email" className="col-span-2"><input className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} type="email" /></Field>
              </div>
            )}
          </Section>

          <Section title="Proyecto">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Título" className="col-span-2"><input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} required /></Field>
              <Field label="Precio (USD)"><input className={inputCls} value={price} onChange={(e) => setPrice(e.target.value)} type="number" min="0" step="0.01" required /></Field>
              <Field label="Hosting Provider"><input className={inputCls} value={hostingProvider} onChange={(e) => setHostingProvider(e.target.value)} required placeholder="Vercel / Netlify / AWS" /></Field>
              <Field label="Inicio"><input className={inputCls} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required /></Field>
              <Field label="Entrega"><input className={inputCls} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required /></Field>
              <Field label="Base de datos externa"><input className={inputCls} value={externalDatabase} onChange={(e) => setExternalDatabase(e.target.value)} placeholder="Upstash / Neon" /></Field>
              <Field label="Drive Link"><input className={inputCls} value={driveLink} onChange={(e) => setDriveLink(e.target.value)} type="url" /></Field>
              <Field label="GitHub Repo" className="col-span-2"><input className={inputCls} value={gitHubRepoUrl} onChange={(e) => setGitHubRepoUrl(e.target.value)} placeholder="owner/repo" /></Field>
            </div>
          </Section>

          {create.error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Error al crear el proyecto.
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Link to="/" className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={create.isPending}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
            >
              {create.isPending ? 'Creando...' : 'Crear proyecto'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-100 bg-white p-6">
      <h2 className="mb-4 text-sm font-semibold text-slate-800">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>
      {children}
    </label>
  );
}
