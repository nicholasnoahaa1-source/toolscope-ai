import type { Connector, FileRef, InboxThread, NoteRef, Task } from "@/lib/life/types";
import { dayLabel, relative } from "@/lib/life/format";
import { Empty } from "./Card";

const PRIORITY_LABEL: Record<number, { label: string; className: string }> = {
  1: { label: "Urgente", className: "bg-red-100 text-red-700" },
  2: { label: "Alta", className: "bg-orange-100 text-orange-700" },
  3: { label: "Média", className: "bg-blue-100 text-blue-700" },
  4: { label: "Baixa", className: "bg-slate-100 text-slate-600" },
};

export function Tasks({ tasks, timeZone }: { tasks: Task[]; timeZone: string }) {
  if (tasks.length === 0) return <Empty>Nenhuma tarefa aberta. 🎉</Empty>;

  return (
    <ul className="space-y-2">
      {tasks.map((task) => {
        const priority = PRIORITY_LABEL[task.priority ?? 4];
        return (
          <li key={task.id} className="flex items-start gap-3">
            <span className="mt-1 h-4 w-4 shrink-0 rounded-full border-2 border-border" />
            <div className="min-w-0 flex-1">
              <a
                href={task.url ?? "#"}
                className="block truncate text-sm font-medium text-foreground hover:text-brand"
              >
                {task.title}
              </a>
              <p className="text-xs text-muted">
                {task.project}
                {task.due && ` · vence ${dayLabel(task.due, timeZone)}`}
              </p>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${priority.className}`}>
              {priority.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function Inbox({ threads, now }: { threads: InboxThread[]; now: Date }) {
  if (threads.length === 0) return <Empty>Caixa de entrada limpa.</Empty>;

  return (
    <ul className="space-y-3">
      {threads.map((thread) => (
        <li key={thread.id} className="flex gap-3">
          <span
            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
              thread.unread ? "bg-brand" : "bg-border"
            }`}
            aria-label={thread.unread ? "Não lida" : "Lida"}
          />
          <div className="min-w-0">
            <a
              href={thread.url ?? "https://mail.google.com/"}
              className="block truncate text-sm font-medium text-foreground hover:text-brand"
            >
              {thread.subject}
            </a>
            <p className="truncate text-xs text-muted">
              {thread.sender} · {relative(thread.date, now)}
            </p>
            <p className="mt-0.5 line-clamp-1 text-xs text-muted/80">{thread.snippet}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Notes({ notes }: { notes: NoteRef[] }) {
  if (notes.length === 0) return <Empty>Nenhuma nota recente.</Empty>;

  return (
    <ul className="space-y-2">
      {notes.map((note) => (
        <li key={note.id}>
          <a
            href={note.url}
            className="flex items-center gap-2 truncate text-sm text-foreground hover:text-brand"
          >
            <span aria-hidden>{note.icon ?? "📄"}</span>
            <span className="truncate">{note.title}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function Files({ files, now }: { files: FileRef[]; now: Date }) {
  if (files.length === 0) return <Empty>Nenhum arquivo recente.</Empty>;

  return (
    <ul className="space-y-2">
      {files.map((file) => (
        <li key={file.id} className="flex items-baseline gap-2">
          <a href={file.url} className="truncate text-sm text-foreground hover:text-brand">
            {file.title}
          </a>
          <span className="ml-auto shrink-0 text-xs text-muted">
            {relative(file.modifiedAt, now)}
          </span>
        </li>
      ))}
    </ul>
  );
}

const STATUS_STYLE: Record<Connector["status"], { dot: string; label: string }> = {
  connected: { dot: "bg-emerald-500", label: "conectado" },
  needs_reconnect: { dot: "bg-amber-500", label: "reconectar" },
  off: { dot: "bg-slate-300", label: "desligado" },
};

export function Connectors({ connectors }: { connectors: Connector[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {connectors.map((connector) => {
        const status = STATUS_STYLE[connector.status];
        return (
          <li key={connector.id} className="rounded-xl border border-border p-3">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${status.dot}`} />
              <span className="truncate text-sm font-medium text-foreground">{connector.name}</span>
            </div>
            <p className="mt-1 text-xs text-muted">{connector.feeds}</p>
            <p className="mt-2 text-[11px] tracking-wide text-muted/70 uppercase">
              {connector.area} · {status.label}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
