import type { AgendaEvent } from "@/lib/life/types";
import { relative, timeOfDay } from "@/lib/life/format";
import { Empty } from "./Card";

export default function Agenda({
  events,
  timeZone,
  now,
}: {
  events: AgendaEvent[];
  timeZone: string;
  now: Date;
}) {
  if (events.length === 0) return <Empty>Nada na agenda hoje.</Empty>;

  return (
    <ol className="space-y-1">
      {events.map((event) => {
        const start = new Date(event.start);
        const end = new Date(event.end);
        const isNow = start <= now && now < end;
        const isPast = end <= now;

        return (
          <li
            key={event.id}
            className={`flex gap-4 rounded-xl px-3 py-2 ${
              isNow ? "bg-brand/10" : isPast ? "opacity-45" : ""
            }`}
          >
            <time
              className="w-14 shrink-0 pt-0.5 font-mono text-xs text-muted"
              dateTime={event.start}
            >
              {timeOfDay(event.start, timeZone)}
            </time>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {event.title}
                {isNow && <span className="ml-2 text-xs font-semibold text-brand">agora</span>}
              </p>
              <p className="text-xs text-muted">
                até {timeOfDay(event.end, timeZone)}
                {!isPast && !isNow && ` · começa ${relative(event.start, now)}`}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
