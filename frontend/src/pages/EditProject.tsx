import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useProject, useUpdateProject } from '../hooks/useProjects';
import { ProjectType, PricingModel } from '../types/dto';
import type { UpdateProjectDto, ProjectTypeValue, PricingModelValue } from '../types/dto';

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-colors';

const SERVICE_OPTIONS = [
  { key: 'Dominios', label: 'Configuración de dominios' },
  { key: 'Correos', label: 'Correos corporativos' },
  { key: 'GoogleMaps', label: 'Google Maps / Places' },
  { key: 'SSL', label: 'Certificados SSL' },
  { key: 'DNS', label: 'DNS / Cloudflare' },
  { key: 'Otro', label: 'Otro' },
] as const;

const TYPE_META: Record<ProjectTypeValue, { title: string; desc: string; icon: string }> = {
  [ProjectType.LandingPage]: { title: 'Landing Page', desc: 'Sitio web informativo o captura de leads.', icon: '◧' },
  [ProjectType.ErpCrm]:      { title: 'ERP / CRM Personalizado', desc: 'Sistema a medida con login, módulos y BD.', icon: '◨' },
  [ProjectType.Servicios]:   { title: 'Servicios', desc: 'Configuración: dominios, correos, mapas.', icon: '◩' },
};

const PRICING_META: Record<PricingModelValue, { label: string; hint: string }> = {
  [PricingModel.OneTime]:     { label: 'Pago único',  hint: 'Cobro único al entregar.' },
  [PricingModel.Monthly]:     { label: 'Mensual',     hint: 'Cobro recurrente cada mes.' },
  [PricingModel.Subscription]:{ label: 'Suscripción', hint: 'Plan continuo con renovación periódica.' },
};

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</h2>
        {action}
      </div>
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

function toDateInput(iso: string | null): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

export function EditProject() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useProject(id);
  const update = useUpdateProject(id ?? '');

  const [type, setType] = useState<ProjectTypeValue>(ProjectType.LandingPage);
  const [title, setTitle] = useState('');
  const [services, setServices] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hostingProvider, setHostingProvider] = useState('');
  const [externalDatabase, setExternalDatabase] = useState('');
  const [driveLink, setDriveLink] = useState('');
  const [gitHubRepoUrl, setGitHubRepoUrl] = useState('');
  const [price, setPrice] = useState('');
  const [pricingModel, setPricingModel] = useState<PricingModelValue>(PricingModel.OneTime);
  const [nextPaymentDate, setNextPaymentDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!data || hydrated) return;
    setType(data.type);
    setTitle(data.title);
    setServices(data.services ?? []);
    setStartDate(toDateInput(data.startDate));
    setEndDate(toDateInput(data.endDate));
    setHostingProvider(data.hostingProvider ?? '');
    setExternalDatabase(data.externalDatabase ?? '');
    setDriveLink(data.driveLink ?? '');
    setGitHubRepoUrl(data.gitHubRepoUrl ?? '');
    setPrice(String(data.price ?? ''));
    setPricingModel(data.pricingModel);
    setNextPaymentDate(toDateInput(data.nextPaymentDate));
    setIsActive(data.isActive);
    setHydrated(true);
  }, [data, hydrated]);

  const toggleService = (key: string) => {
    setServices((prev) => prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]);
  };

  const showHosting = type === ProjectType.LandingPage || type === ProjectType.ErpCrm;
  const showServiceFields = type === ProjectType.Servicios;
  const recurring = pricingModel !== PricingModel.OneTime;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    const dto: UpdateProjectDto = {
      title,
      type,
      services: showServiceFields ? services : null,
      price: parseFloat(price) || 0,
      pricingModel,
      nextPaymentDate: recurring && nextPaymentDate ? new Date(nextPaymentDate).toISOString() : null,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      driveLink: driveLink || null,
      gitHubRepoUrl: gitHubRepoUrl || null,
      hostingProvider: showHosting ? hostingProvider : null,
      externalDatabase: externalDatabase || null,
      notes: data.notes,
      isActive,
    };
    update.mutate(dto, { onSuccess: () => navigate(`/projects/${data.id}`) });
  };

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-xs text-red-600">
          No se pudo cargar el proyecto.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <Link
            to={id ? `/projects/${id}` : '/'}
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
            Volver
          </Link>
          <span className="text-slate-300">|</span>
          <h1 className="text-base font-semibold text-slate-900">
            Editar · {data?.title ?? '...'}
          </h1>
        </div>
      </header>

      <form onSubmit={submit} className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {isLoading && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
              Cargando proyecto...
            </div>
          )}

          {data && (
            <>
              <Section
                title="Tipo de proyecto"
                action={
                  <span className="text-xs text-slate-400">
                    Cliente: <span className="font-medium text-slate-700">{data.clientName}</span>
                  </span>
                }
              >
                <div className="grid gap-3 sm:grid-cols-3">
                  {(Object.keys(TYPE_META) as unknown as ProjectTypeValue[]).map((k) => {
                    const meta = TYPE_META[Number(k) as ProjectTypeValue];
                    const active = type === Number(k);
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setType(Number(k) as ProjectTypeValue)}
                        className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all ${
                          active
                            ? 'border-slate-900 bg-slate-50 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <span className="text-lg text-slate-700">{meta.icon}</span>
                        <span className="text-sm font-semibold text-slate-900">{meta.title}</span>
                        <span className="text-xs text-slate-500">{meta.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </Section>

              <Section title={`Detalles · ${TYPE_META[type].title}`}>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Título" className="col-span-2">
                    <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} required />
                  </Field>

                  <Field label="Inicio">
                    <input className={inputCls} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                  </Field>
                  <Field label="Entrega / Fin contrato">
                    <input className={inputCls} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                  </Field>

                  {showHosting && (
                    <>
                      <Field label="Hosting">
                        <input className={inputCls} value={hostingProvider} onChange={(e) => setHostingProvider(e.target.value)} required placeholder="Vercel / Netlify / AWS" />
                      </Field>
                      <Field label="Base de datos externa">
                        <input className={inputCls} value={externalDatabase} onChange={(e) => setExternalDatabase(e.target.value)} placeholder="Upstash / Neon" />
                      </Field>
                      <Field label="Drive Link">
                        <input className={inputCls} value={driveLink} onChange={(e) => setDriveLink(e.target.value)} type="url" />
                      </Field>
                      <Field label="GitHub Repo">
                        <input className={inputCls} value={gitHubRepoUrl} onChange={(e) => setGitHubRepoUrl(e.target.value)} placeholder="owner/repo" />
                      </Field>
                    </>
                  )}

                  {showServiceFields && (
                    <div className="col-span-2">
                      <span className="mb-2 block text-xs font-medium text-slate-500">Servicios incluidos</span>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {SERVICE_OPTIONS.map((s) => {
                          const checked = services.includes(s.key);
                          return (
                            <label
                              key={s.key}
                              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                                checked
                                  ? 'border-slate-900 bg-slate-50 text-slate-900'
                                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleService(s.key)}
                                className="accent-slate-900"
                              />
                              {s.label}
                            </label>
                          );
                        })}
                      </div>
                      {services.length === 0 && (
                        <p className="mt-2 text-xs text-amber-700">Selecciona al menos un servicio.</p>
                      )}
                    </div>
                  )}
                </div>
              </Section>

              <Section title="Precio y pagos">
                <div className="space-y-4">
                  <div className="grid gap-2 sm:grid-cols-3">
                    {(Object.keys(PRICING_META) as unknown as PricingModelValue[]).map((k) => {
                      const meta = PRICING_META[Number(k) as PricingModelValue];
                      const active = pricingModel === Number(k);
                      return (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setPricingModel(Number(k) as PricingModelValue)}
                          className={`flex flex-col items-start rounded-lg border p-3 text-left transition-all ${
                            active
                              ? 'border-slate-900 bg-slate-50'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <span className="text-sm font-semibold text-slate-900">{meta.label}</span>
                          <span className="text-xs text-slate-500">{meta.hint}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label={recurring ? 'Monto por período (USD)' : 'Precio (USD)'}>
                      <input
                        className={inputCls}
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        type="number"
                        min="0"
                        step="0.01"
                        required
                      />
                    </Field>
                    {recurring && (
                      <Field label="Próximo pago">
                        <input
                          className={inputCls}
                          type="date"
                          value={nextPaymentDate}
                          onChange={(e) => setNextPaymentDate(e.target.value)}
                          required
                        />
                      </Field>
                    )}
                  </div>
                </div>
              </Section>

              <Section title="Estado">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 accent-slate-900"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Cliente activo</p>
                    <p className="text-xs text-slate-500">
                      {isActive ? 'Sigue siendo nuestro cliente.' : 'Ex-cliente al que se le dio servicio.'}
                    </p>
                  </div>
                </label>
              </Section>

              {update.error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-600">
                  Error al guardar los cambios.
                </div>
              )}

              <div className="flex justify-end gap-2 pb-6">
                <Link
                  to={`/projects/${data.id}`}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={update.isPending || (showServiceFields && services.length === 0)}
                  className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-800 disabled:opacity-40"
                >
                  {update.isPending ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
