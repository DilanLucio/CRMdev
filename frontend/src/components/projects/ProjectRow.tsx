import { Link } from 'react-router-dom';
import type { ProjectListItemDto } from '../../types/dto';
import { Badge } from '../ui/Badge';
import { formatCurrency, formatDate } from '../../lib/format';

interface Props {
  project: ProjectListItemDto;
}

export function ProjectRow({ project }: Props) {
  const warrantyBadge = () => {
    if (project.daysLeftForWarranty < 0) return <Badge variant="purple">Garantía vencida</Badge>;
    if (project.daysLeftForWarranty < 15 && project.hasPendingTasks)
      return <Badge variant="warning">⚠ {project.daysLeftForWarranty}d garantía</Badge>;
    return <Badge variant="success">{project.daysLeftForWarranty}d garantía</Badge>;
  };

  const hostingBadge = () =>
    project.daysUntilHostingRenewal < 30 ? (
      <Badge variant="danger">🔴 Hosting {project.daysUntilHostingRenewal}d</Badge>
    ) : (
      <Badge variant="info">Hosting {project.daysUntilHostingRenewal}d</Badge>
    );

  return (
    <Link
      to={`/projects/${project.id}`}
      className="group block rounded-xl border border-slate-100 bg-white p-5 transition-colors hover:border-slate-200 hover:bg-slate-50"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-800">{project.title}</h3>
          <p className="mt-1 text-xs text-slate-400">{project.clientName}</p>
        </div>
        <span className="text-base font-bold text-emerald-500">{formatCurrency(project.price)}</span>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <span>End: {formatDate(project.endDate)}</span>
        <span className="rounded-full bg-sky-50 px-2.5 py-1 font-medium text-sky-600">
          {project.hostingProvider}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {warrantyBadge()}
        {hostingBadge()}
        {project.hasPendingTasks && <Badge variant="warning">Tareas pendientes</Badge>}
      </div>
    </Link>
  );
}
