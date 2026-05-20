import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowUpRight } from 'lucide-react';
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
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">README</h3>
        {gitHubRepoUrl && (
          <a
            href={`https://github.com/${gitHubRepoUrl}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
          >
            <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
            {gitHubRepoUrl}
          </a>
        )}
      </div>

      {!hasRepo && (
        <p className="text-sm text-slate-500">Sin repo de GitHub configurado.</p>
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
        <p className="text-sm text-red-600">Error obteniendo README.</p>
      )}

      {hasRepo && data && !data.markdown && (
        <p className="text-sm text-slate-500">{data.message ?? 'README no encontrado.'}</p>
      )}

      {hasRepo && data?.markdown && (
        <div className="max-h-[28rem] overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/50 p-5">
          <article className="prose prose-slate prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.markdown}</ReactMarkdown>
          </article>
        </div>
      )}
    </section>
  );
}
