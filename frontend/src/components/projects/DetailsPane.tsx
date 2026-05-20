import type { ProjectDetailsDto } from '../../types/dto';
import { Badge } from '../ui/Badge';
import { formatDate } from '../../lib/format';

interface Props {
  project: ProjectDetailsDto;
}

function Row({ label, value, valueClass = '' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm font-medium text-slate-900 text-right ${valueClass}`}>{value}</span>
    </div>
  );
}

export function DetailsPane({ project }: Props) {
  const hostingAlert = project.daysUntilHostingRenewal < 30;
  const warrantyAlert = project.daysLeftForWarranty <= 15;

  return (
    <aside className="w-80 shrink-0 overflow-y-auto border-l border-slate-200 bg-white">
      {/* Price + dates */}
      <section className="border-b border-slate-100 p-6 space-y-4">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Valor del proyecto</p>
          <p className="text-2xl font-semibold text-slate-900">{project.priceFormatted}</p>
        </div>
        <div className="space-y-2.5">
          <Row label="Inicio" value={formatDate(project.startDate)} />
          <Row label="Entrega" value={formatDate(project.endDate)} />
          <Row
            label="Fin garantía"
            value={formatDate(project.warrantyEndDate)}
            valueClass={warrantyAlert ? 'text-amber-700' : ''}
          />
          <Row label="Cliente" value={project.clientName} />
        </div>
        {warrantyAlert && (
          <div className="rounded-lg bg-amber-50 ring-1 ring-inset ring-amber-600/20 px-3 py-2 text-xs text-amber-800">
            ⚠ Garantía vence en {project.daysLeftForWarranty} días
          </div>
        )}
      </section>

      {/* Enlaces */}
      <section className="border-b border-slate-100 p-6 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Enlaces</p>
        {project.driveLink ? (
          <a
            href={project.driveLink}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
          >
            ↗ Google Drive
          </a>
        ) : null}
        {project.gitHubRepoUrl ? (
          <a
            href={`https://github.com/${project.gitHubRepoUrl}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
          >
            ↗ {project.gitHubRepoUrl}
          </a>
        ) : null}
        {!project.driveLink && !project.gitHubRepoUrl && (
          <p className="text-xs text-slate-400">Sin enlaces configurados.</p>
        )}
      </section>

      {/* Tecnologías */}
      <section className="border-b border-slate-100 p-6 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tecnologías</p>
        <div className="flex flex-wrap gap-1.5">
          {project.hostingProvider && <Badge variant="info">{project.hostingProvider}</Badge>}
          {project.externalDatabase && <Badge variant="info">{project.externalDatabase}</Badge>}
        </div>
      </section>

      {/* Hosting renewal */}
      <section className="p-6">
        <div
          className={`rounded-xl p-4 border ${
            hostingAlert
              ? 'bg-amber-50 border-amber-200'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-sm font-semibold ${hostingAlert ? 'text-amber-800' : 'text-slate-700'}`}>
              Renovación hosting
            </span>
            <Badge variant={hostingAlert ? 'warning' : 'muted'}>
              {project.daysUntilHostingRenewal}d
            </Badge>
          </div>
          <p className={`text-xs ${hostingAlert ? 'text-amber-800' : 'text-slate-500'}`}>
            {formatDate(project.hostingRenewalDate)}
          </p>
        </div>
      </section>
    </aside>
  );
}
