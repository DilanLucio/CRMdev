import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useReadme } from '../../hooks/useReadme';
import { Skeleton } from '../ui/Skeleton';

interface Props {
  projectId: string;
  gitHubRepoUrl: string | null;
}

export function ReadmePreview({ projectId, gitHubRepoUrl }: Props) {
  const hasRepo = !!gitHubRepoUrl;
  const { data, isLoading, error } = useReadme(projectId, hasRepo);

  return (
    <section className="border-b border-slate-100 p-6">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        README
      </h3>

      {!hasRepo && (
        <p className="text-xs text-slate-400">Sin repo de GitHub configurado.</p>
      )}

      {hasRepo && isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      )}

      {hasRepo && error && (
        <p className="text-xs text-red-600">Error obteniendo README.</p>
      )}

      {hasRepo && data && !data.markdown && (
        <p className="text-xs text-slate-400">{data.message ?? 'README no encontrado.'}</p>
      )}

      {hasRepo && data?.markdown && (
        <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-100 p-4">
          <article className="prose prose-slate prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.markdown}</ReactMarkdown>
          </article>
        </div>
      )}
    </section>
  );
}
