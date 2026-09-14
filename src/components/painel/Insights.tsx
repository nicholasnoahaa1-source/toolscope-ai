import type { AgendaEvent, ProjectRef } from "@/lib/life/types";
import type { Habit } from "@/lib/life/metrics";
import { BUCKET_COLOR, BUCKET_LABEL, bucketTotals, groupByDay } from "@/lib/life/metrics";
import { relative, timeOfDay } from "@/lib/life/format";
import { Empty } from "./Card";

/** Barra empilhada com as horas do dia por categoria. */
export function TimeBreakdown({ events }: { events: AgendaEvent[] }) {
  const totals = bucketTotals(events);
  if (totals.length === 0) return <Empty>Sem blocos para medir.</Empty>;

  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full">
        {totals.map((total) => (
          <div
            key={total.bucket}
            className={BUCKET_COLOR[total.bucket]}
            style={{ width: `${total.share * 100}%` }}
            title={`${BUCKET_LABEL[total.bucket]}: ${total.hours.toFixed(1)} h`}
          />
        ))}
      </div>
      <ul className="mt-4 space-y-2">
        {totals.map((total) => (
          <li key={total.bucket} className="flex items-center gap-2 text-sm">
            <span className={`h-2.5 w-2.5 rounded-full ${BUCKET_COLOR[total.bucket]}`} />
            <span className="text-foreground">{BUCKET_LABEL[total.bucket]}</span>
            <span className="ml-auto font-mono text-xs text-muted">
              {total.hours.toFixed(1)} h · {Math.round(total.share * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** "2026-09-11" → "11/09". */
function formatDay(key: string): string {
  const [, month, day] = key.split("-");
  return `${day}/${month}`;
}

/** Sequência de hábitos: uma casinha por dia da janela. */
export function Habits({ habits }: { habits: Habit[] }) {
  return (
    <ul className="space-y-4">
      {habits.map((habit) => (
        <li key={habit.id}>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium text-foreground">{habit.name}</span>
            <span className="ml-auto text-xs text-muted">
              {habit.count} de {habit.days.length} dias
            </span>
          </div>
          <div className="mt-2 flex gap-1">
            {habit.days.map((day) => (
              <span
                key={day.key}
                title={day.key}
                className={`h-5 flex-1 rounded ${day.done ? "bg-emerald-500" : "bg-border"}`}
              />
            ))}
          </div>
          <p className="mt-1 text-xs text-muted">
            {habit.lastDone
              ? `sequência de ${habit.streak} ${habit.streak === 1 ? "dia" : "dias"} até ${formatDay(habit.lastDone)}`
              : "nenhum registro na janela"}
          </p>
        </li>
      ))}
    </ul>
  );
}

/** Próximos dias, com carga de cada um. */
export function Week({ events, timeZone }: { events: AgendaEvent[]; timeZone: string }) {
  const days = groupByDay(events, timeZone);
  if (days.length === 0) return <Empty>Semana vazia.</Empty>;

  const busiest = Math.max(...days.map((d) => d.busyHours), 1);

  return (
    <ul className="space-y-3">
      {days.map((day) => (
        <li key={day.key}>
          <div className="flex items-baseline gap-2">
            <span className="w-24 shrink-0 text-sm font-medium text-foreground capitalize">
              {day.label}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-brand"
                style={{ width: `${(day.busyHours / busiest) * 100}%` }}
              />
            </div>
            <span className="w-20 shrink-0 text-right font-mono text-xs text-muted">
              {day.busyHours.toFixed(1)} h
            </span>
          </div>
          <p className="mt-1 ml-24 truncate text-xs text-muted">
            {day.events
              .filter((e) => !e.title.toLowerCase().includes("dormir"))
              .slice(0, 4)
              .map((e) => `${timeOfDay(e.start, timeZone)} ${e.title}`)
              .join(" · ")}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function Projects({ projects, now }: { projects: ProjectRef[]; now: Date }) {
  if (projects.length === 0) return <Empty>Nenhum projeto aberto.</Empty>;

  return (
    <ul className="space-y-2">
      {projects.map((project) => (
        <li key={project.id} className="flex items-baseline gap-2">
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
              project.status === "draft"
                ? "bg-slate-100 text-slate-600"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {project.status === "draft" ? "rascunho" : "aberto"}
          </span>
          <a href={project.url} className="truncate text-sm text-foreground hover:text-brand">
            {project.title}
          </a>
          <span className="ml-auto shrink-0 text-xs text-muted">
            {relative(project.updatedAt, now)}
          </span>
        </li>
      ))}
    </ul>
  );
}

const QUICK_ACTIONS = [
  { label: "Nova tarefa", href: "https://app.todoist.com/app/today" },
  { label: "Novo evento", href: "https://calendar.google.com/calendar/r/eventedit" },
  { label: "Escrever e-mail", href: "https://mail.google.com/mail/u/0/#inbox?compose=new" },
  { label: "Nova página", href: "https://www.notion.so/" },
  { label: "Subir arquivo", href: "https://drive.google.com/drive/my-drive" },
];

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-2">
      {QUICK_ACTIONS.map((action) => (
        <a
          key={action.label}
          href={action.href}
          className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:border-brand hover:text-brand"
        >
          {action.label}
        </a>
      ))}
    </div>
  );
}
