import { Hourglass } from 'lucide-react';

interface Props {
  title: string;
}

export function ComingSoon({ title }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        <Hourglass className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <h1 className="text-sm font-semibold text-slate-900 mt-1">{title}</h1>
      <p className="text-xs text-slate-500">Próximamente</p>
    </div>
  );
}
