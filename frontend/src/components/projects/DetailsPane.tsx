import type { ProjectDetailsDto } from '../../types/dto';
import { Badge } from '../ui/Badge';
import { formatDate } from '../../lib/format';
import { ReadmePreview } from './ReadmePreview';

interface Props {
  project: ProjectDetailsDto;
}

export function DetailsPane({ project }: Props) {
  const hostingAlert = project.daysUntilHostingRenewal < 30;

  return (
    <aside className="w-96 shrink-0 overflow-y-auto border-l border-slate-100 bg-white">
      <section className="border-b border-slate-100 p-6 space-y-3">
        <p className="text-2xl font-bold text-emerald-500">{project.priceFormatted}</p>
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <span className="text-slate-400">Start</span>
          <span className="text-slate-700">{formatDate(project.startDate)}</span>
          <span className="text-slate-400">End</span>
          <span className="text-slate-700">{formatDate(project.endDate)}</span>
          <span className="text-slate-400">Warranty End</span>
          <span className="font-medium text-slate-800">{formatDate(project.warrantyEndDate)}</span>
          <span className="text-slate-400">Client</span>
          <span className="text-slate-700">{project.clientName}</span>
        </div>
      </section>

      <section className="border-b border-slate-100 p-6 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Links</h3>
        {project.driveLink && (
          <a
            href={project.driveLink}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm text-sky-600 hover:underline"
          >
            📁 Google Drive
          </a>
        )}
        {project.gitHubRepoUrl && (
          <a
            href={`https://github.com/${project.gitHubRepoUrl}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm text-sky-600 hover:underline"
          >
            ⌨ {project.gitHubRepoUrl}
          </a>
        )}
        <div className="flex flex-wrap gap-2 pt-2">
          <Badge variant="info">{project.hostingProvider}</Badge>
          {project.externalDatabase && <Badge variant="info">{project.externalDatabase}</Badge>}
        </div>
      </section>

      <ReadmePreview projectId={project.id} gitHubRepoUrl={project.gitHubRepoUrl} />

      <section className="p-6">
        <div className={`rounded-xl p-4 ${hostingAlert ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm font-semibold ${hostingAlert ? 'text-amber-700' : 'text-slate-700'}`}>
              Hosting Renewal
            </span>
            <Badge variant={hostingAlert ? 'warning' : 'muted'}>
              {project.daysUntilHostingRenewal}d left
            </Badge>
          </div>
          <p className={`mt-1 text-xs ${hostingAlert ? 'text-amber-600' : 'text-slate-500'}`}>
            Vence el {formatDate(project.hostingRenewalDate)}
          </p>
        </div>
      </section>
    </aside>
  );
}
