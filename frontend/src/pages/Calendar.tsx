import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { Skeleton } from '../components/ui/Skeleton';
import type { ProjectListItemDto } from '../types/dto';

type EventKind = 'start' | 'deadline' | 'warranty' | 'hosting';

interface CalEvent {
  date: string; // YYYY-MM-DD
  kind: EventKind;
  project: ProjectListItemDto;
}

const KIND_META: Record<EventKind, { label: string; pill: string; dot: string }> = {
  start:    { label: 'Inicio',   pill: 'bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200',   dot: 'bg-slate-400' },
  deadline: { label: 'Entrega',  pill: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20', dot: 'bg-emerald-500' },
  warranty: { label: 'Garantía', pill: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20', dot: 'bg-amber-500' },
  hosting:  { label: 'Hosting',  pill: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10',   dot: 'bg-blue-500' },
};

const DAYS_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTHS_ES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];

function toYMD(iso: string) {
  return iso.slice(0, 10);
}

function buildEvents(projects: ProjectListItemDto[]): CalEvent[] {
  const events: CalEvent[] = [];
  for (const p of projects) {
    if (p.startDate)         events.push({ date: toYMD(p.startDate),         kind: 'start',    project: p });
    if (p.endDate)           events.push({ date: toYMD(p.endDate),           kind: 'deadline', project: p });
    if (p.warrantyEndDate)   events.push({ date: toYMD(p.warrantyEndDate),   kind: 'warranty', project: p });
    if (p.hostingRenewalDate) events.push({ date: toYMD(p.hostingRenewalDate), kind: 'hosting',  project: p });
  }
  return events;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstWeekday(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return (day + 6) % 7;
}

function ymd(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function EventPill({ event }: { event: CalEvent }) {
  const meta = KIND_META[event.kind];
  return (
    <Link
      to={`/projects/${event.project.id}`}
      className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium truncate ${meta.pill} hover:opacity-80 transition-opacity`}
      title={`${meta.label}: ${event.project.title}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${meta.dot}`} />
      <span className="truncate">{event.project.title}</span>
    </Link>
  );
}

function EventCard({ event }: { event: CalEvent }) {
  const meta = KIND_META[event.kind];
  return (
    <Link
      to={`/projects/${event.project.id}`}
      className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
    >
      <span className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${meta.dot}`} />
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-slate-900">{event.project.title}</p>
        <p className="text-xs text-slate-500">{event.project.clientName}</p>
      </div>
      <span className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${meta.pill}`}>
        {meta.label}
      </span>
    </Link>
  );
}

export function Calendar() {
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selected, setSelected] = useState<string | null>(null);

  const { data, isLoading } = useProjects();

  const events = useMemo(() => buildEvents(data ?? []), [data]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalEvent[]>();
    for (const e of events) {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    }
    return map;
  }, [events]);

  const { year, month } = cursor;
  const daysInMonth = getDaysInMonth(year, month);
  const firstWeekday = getFirstWeekday(year, month);
  const todayYMD = ymd(today.getFullYear(), today.getMonth(), today.getDate());

  const selectedEvents = selected ? (eventsByDate.get(selected) ?? []) : [];

  const upcomingEvents = useMemo(() => {
    return events
      .filter((e) => e.date >= todayYMD)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 8);
  }, [events, todayYMD]);

  function prevMonth() {
    setCursor(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
    );
    setSelected(null);
  }

  function nextMonth() {
    setCursor(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
    );
    setSelected(null);
  }

  function goToday() {
    setCursor({ year: today.getFullYear(), month: today.getMonth() });
    setSelected(todayYMD);
  }

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Main calendar */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={prevMonth}
              aria-label="Mes anterior"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2} />
            </button>
            <h1 className="min-w-[160px] text-center text-base font-semibold text-slate-900">
              {MONTHS_ES[month]} {year}
            </h1>
            <button
              onClick={nextMonth}
              aria-label="Mes siguiente"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
          <button
            onClick={goToday}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Hoy
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <>
              {/* Day headers */}
              <div className="mb-1 grid grid-cols-7">
                {DAYS_ES.map((d) => (
                  <div key={d} className="py-2 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {d}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1">
                {cells.map((day, i) => {
                  if (day === null) return <div key={`empty-${i}`} />;
                  const dateStr = ymd(year, month, day);
                  const dayEvents = eventsByDate.get(dateStr) ?? [];
                  const isToday = dateStr === todayYMD;
                  const isSelected = dateStr === selected;

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelected(isSelected ? null : dateStr)}
                      className={`flex min-h-[80px] flex-col rounded-xl border p-1.5 text-left transition-colors ${
                        isSelected
                          ? 'border-slate-900 bg-slate-50'
                          : isToday
                          ? 'border-slate-300 bg-white'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <span
                        className={`mb-1 flex h-5 w-5 items-center justify-center self-end rounded-full text-xs font-medium ${
                          isToday
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-600'
                        }`}
                      >
                        {day}
                      </span>
                      <div className="flex flex-col gap-0.5 overflow-hidden">
                        {dayEvents.slice(0, 2).map((e, idx) => (
                          <EventPill key={idx} event={e} />
                        ))}
                        {dayEvents.length > 2 && (
                          <span className="px-1 text-[10px] text-slate-500">
                            +{dayEvents.length - 2} más
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Side panel */}
      <aside className="flex w-72 flex-col border-l border-slate-200 bg-white overflow-y-auto">
        <div className="border-b border-slate-200 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {selected ? formatSelectedDate(selected) : 'Próximos eventos'}
          </p>
        </div>

        <div className="flex flex-col gap-2 p-4">
          {isLoading && (
            <>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </>
          )}

          {!isLoading && selected && selectedEvents.length === 0 && (
            <p className="text-xs text-slate-500">Sin eventos este día.</p>
          )}

          {!isLoading && selected
            ? selectedEvents.map((e, i) => <EventCard key={i} event={e} />)
            : !isLoading && upcomingEvents.map((e, i) => (
                <div key={i}>
                  {(i === 0 || upcomingEvents[i - 1].date !== e.date) && (
                    <p className="mb-1 mt-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {formatSelectedDate(e.date)}
                    </p>
                  )}
                  <EventCard event={e} />
                </div>
              ))
          }

          {!isLoading && !selected && upcomingEvents.length === 0 && (
            <p className="text-xs text-slate-500">Sin eventos próximos.</p>
          )}
        </div>

        {/* Legend */}
        <div className="mt-auto border-t border-slate-200 p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Leyenda</p>
          <div className="flex flex-col gap-2">
            {(Object.entries(KIND_META) as [EventKind, typeof KIND_META[EventKind]][]).map(([kind, meta]) => (
              <div key={kind} className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                <span className="text-xs text-slate-600">{meta.label}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function formatSelectedDate(ymd: string) {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}
