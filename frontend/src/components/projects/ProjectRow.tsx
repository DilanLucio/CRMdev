import { Link } from 'react-router-dom';
import { ProjectType, PricingModel } from '../../types/dto';
import type { ProjectListItemDto, ProjectTypeValue, PricingModelValue } from '../../types/dto';
import { Badge } from '../ui/Badge';
import { formatCurrency, formatDate } from '../../lib/format';

interface Props {
  project: ProjectListItemDto;
}

const TYPE_LABEL: Record<ProjectTypeValue, string> = {
  [ProjectType.LandingPage]: 'Landing',
  [ProjectType.ErpCrm]: 'ERP / CRM',
  [ProjectType.Servicios]: 'Servicios',
};

const PRICING_LABEL: Record<PricingModelValue, string> = {
  [PricingModel.OneTime]: 'Único',
  [PricingModel.Monthly]: 'Mensual',
  [PricingModel.Subscription]: 'Suscripción',
};

export function ProjectRow({ project }: Props) {
  const isService = project.type === ProjectType.Servicios;
  const recurring = project.pricingModel !== PricingModel.OneTime;

  const warrantyBadge = () => {
    if (project.daysLeftForWarranty < 0) return <Badge variant="danger">Garantía vencida</Badge>;
    if (project.daysLeftForWarranty < 15 && project.hasPendingTasks)
      return <Badge variant="warning">{project.daysLeftForWarranty}d garantía</Badge>;
    return <Badge variant="success">{project.daysLeftForWarranty}d garantía</Badge>;
  };

  const hostingBadge = () =>
    project.daysUntilHostingRenewal < 30 ? (
      <Badge variant="danger">Hosting {project.daysUntilHostingRenewal}d</Badge>
    ) : (
      <Badge variant="info">Hosting {project.daysUntilHostingRenewal}d</Badge>
    );

  const nextPaymentBadge = () => {
    if (!recurring || !project.nextPaymentDate || !project.isActive) return null;
    const days = Math.ceil((new Date(project.nextPaymentDate).getTime() - Date.now()) / 86_400_000);
    const variant = days < 7 ? 'danger' : days < 30 ? 'warning' : 'info';
    return <Badge variant={variant}>Pago en {days}d</Badge>;
  };

  return (
    <Link
      to={`/projects/${project.id}`}
      className="group block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-150 hover:shadow-md hover:border-slate-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-900">{project.title}</h3>
          <p className="mt-0.5 text-xs text-slate-500">{project.clientName}</p>
        </div>
        <span className="shrink-0 text-sm font-semibold text-slate-900">{formatCurrency(project.price)}</span>
      </div>

      <hr className="my-4 border-slate-100" />

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{isService ? `Fin contrato ${formatDate(project.endDate)}` : `Entrega ${formatDate(project.endDate)}`}</span>
        <div className="flex items-center gap-1.5">
          <Badge variant="muted">{TYPE_LABEL[project.type]}</Badge>
          <Badge variant="muted">{PRICING_LABEL[project.pricingModel]}</Badge>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {!isService && warrantyBadge()}
        {!isService && hostingBadge()}
        {nextPaymentBadge()}
        {project.hasPendingTasks && <Badge variant="warning">Tareas pendientes</Badge>}
      </div>
    </Link>
  );
}
