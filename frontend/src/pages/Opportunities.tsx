import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useOpportunities } from '../hooks/useOpportunities';
import { OpportunityDetailDrawer } from '../components/opportunities/OpportunityDetailDrawer';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { OpportunityStatus, type OpportunityDto, type OpportunityStatusValue } from '../types/dto';

const STATUS_LABELS: Record<OpportunityStatusValue, string> = {
  [OpportunityStatus.AiGenerated]: 'IA generado',
  [OpportunityStatus.Evaluating]:  'Evaluando',
  [OpportunityStatus.Contacted]:   'Contactado',
  [OpportunityStatus.Discarded]:   'Descartado',
};

type BadgeVariant = 'info' | 'warning' | 'success' | 'muted';

const STATUS_BADGE: Record<OpportunityStatusValue, BadgeVariant> = {
  [OpportunityStatus.AiGenerated]: 'info',
  [OpportunityStatus.Evaluating]:  'warning',
  [OpportunityStatus.Contacted]:   'success',
  [OpportunityStatus.Discarded]:   'muted',
};

const FILTER_OPTIONS: Array<{ label: string; value: OpportunityStatusValue | undefined }> = [
  { label: 'Todos',       value: undefined },
  { label: 'IA generado', value: OpportunityStatus.AiGenerated },
  { label: 'Evaluando',   value: OpportunityStatus.Evaluating },
  { label: 'Contactado',  value: OpportunityStatus.Contacted },
  { label: 'Descartado',  value: OpportunityStatus.Discarded },
];

export function Opportunities() {
  const [statusFilter, setStatusFilter] = useState<OpportunityStatusValue | undefined>(undefined);
  const [selected, setSelected] = useState<OpportunityDto | null>(null);
  const { data: opportunities, isLoading } = useOpportunities(statusFilter);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Oportunidades</h1>
        <span className="text-sm text-slate-500">{opportunities?.length ?? 0} registros</span>
      </div>

      {/* Status filter chips */}
      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map(({ label, value }) => (
          <button
            key={String(value)}
            onClick={() => setStatusFilter(value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              statusFilter === value
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="divide-y divide-slate-100 p-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-4 w-20 ml-auto" />
              </div>
            ))}
          </div>
        ) : opportunities?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <p className="text-sm">Sin oportunidades para este filtro.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Empresa</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Contacto</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Recibido</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {opportunities?.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{o.companyName}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{o.contactName}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_BADGE[o.status]}>{STATUS_LABELS[o.status]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {formatDistanceToNow(new Date(o.createdAt), { addSuffix: true })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelected(o)}
                      className="text-xs font-medium text-slate-700 hover:text-slate-900 underline-offset-2 hover:underline"
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <OpportunityDetailDrawer
          opportunity={selected}
          onClose={() => setSelected(null)}
          onUpdated={(updated) => setSelected(updated)}
        />
      )}
    </div>
  );
}
