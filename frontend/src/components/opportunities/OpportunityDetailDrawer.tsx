import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { X } from 'lucide-react';
import { useUpdateOpportunityStatus } from '../../hooks/useOpportunities';
import { Badge } from '../ui/Badge';
import { OpportunityStatus, type OpportunityDto, type OpportunityStatusValue } from '../../types/dto';

type BadgeVariant = 'info' | 'warning' | 'success' | 'muted';

const STATUS_LABELS: Record<OpportunityStatusValue, string> = {
  [OpportunityStatus.AiGenerated]: 'IA generado',
  [OpportunityStatus.Evaluating]:  'Evaluando',
  [OpportunityStatus.Contacted]:   'Contactado',
  [OpportunityStatus.Discarded]:   'Descartado',
};

const STATUS_BADGE: Record<OpportunityStatusValue, BadgeVariant> = {
  [OpportunityStatus.AiGenerated]: 'info',
  [OpportunityStatus.Evaluating]:  'warning',
  [OpportunityStatus.Contacted]:   'success',
  [OpportunityStatus.Discarded]:   'muted',
};

interface Props {
  opportunity: OpportunityDto;
  onClose: () => void;
  onUpdated: (updated: OpportunityDto) => void;
}

export function OpportunityDetailDrawer({ opportunity, onClose, onUpdated }: Props) {
  const [discardReason, setDiscardReason] = useState('');
  const [showDiscard, setShowDiscard] = useState(false);
  const mutation = useUpdateOpportunityStatus(opportunity.id);

  const isTerminal =
    opportunity.status === OpportunityStatus.Contacted ||
    opportunity.status === OpportunityStatus.Discarded;

  const canEvaluate = opportunity.status === OpportunityStatus.AiGenerated;
  const canContact  = opportunity.status === OpportunityStatus.Evaluating;
  const canDiscard  =
    opportunity.status === OpportunityStatus.AiGenerated ||
    opportunity.status === OpportunityStatus.Evaluating;

  const changeStatus = async (status: OpportunityStatusValue, reason?: string) => {
    const updated = await mutation.mutateAsync({
      status,
      discardReason: reason ?? null,
    });
    onUpdated(updated);
    setShowDiscard(false);
    setDiscardReason('');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">{opportunity.companyName}</h2>
            <p className="mt-0.5 text-sm text-slate-500">{opportunity.contactName} · {opportunity.contactEmail}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={STATUS_BADGE[opportunity.status]}>{STATUS_LABELS[opportunity.status]}</Badge>
            <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:text-slate-700">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Posibilidad de desarrollo
          </h3>
          <div className="prose prose-sm max-w-none text-slate-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {opportunity.developmentPossibility}
            </ReactMarkdown>
          </div>

          {opportunity.discardReason && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-red-500">Razón de descarte</p>
              <p className="mt-1 text-sm text-red-700">{opportunity.discardReason}</p>
            </div>
          )}

          {opportunity.externalLeadId && (
            <p className="mt-6 text-xs text-slate-400">Lead ID: {opportunity.externalLeadId}</p>
          )}
        </div>

        {/* Actions */}
        {!isTerminal && (
          <div className="border-t border-slate-200 px-6 py-4 space-y-3">
            {showDiscard ? (
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600">Razón de descarte *</label>
                <textarea
                  value={discardReason}
                  onChange={(e) => setDiscardReason(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  placeholder="¿Por qué se descarta este lead?"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => changeStatus(OpportunityStatus.Discarded, discardReason)}
                    disabled={!discardReason.trim() || mutation.isPending}
                    className="flex-1 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    Confirmar descarte
                  </button>
                  <button
                    onClick={() => { setShowDiscard(false); setDiscardReason(''); }}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {canEvaluate && (
                  <button
                    onClick={() => changeStatus(OpportunityStatus.Evaluating)}
                    disabled={mutation.isPending}
                    className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
                  >
                    Marcar Evaluando
                  </button>
                )}
                {canContact && (
                  <button
                    onClick={() => changeStatus(OpportunityStatus.Contacted)}
                    disabled={mutation.isPending}
                    className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Marcar Contactado
                  </button>
                )}
                {canDiscard && (
                  <button
                    onClick={() => setShowDiscard(true)}
                    className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    Descartar
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
