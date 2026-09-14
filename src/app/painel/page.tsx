import type { Metadata } from "next";
import { getLifeSnapshot } from "@/lib/life/snapshot";
import { dayLabel, dayProgress, relative, timeOfDay } from "@/lib/life/format";
import Card from "@/components/painel/Card";
import Agenda from "@/components/painel/Agenda";
import { Connectors, Files, Inbox, Notes, Tasks } from "@/components/painel/Lists";

export const metadata: Metadata = {
  title: "Painel da Vida",
  description:
    "Agenda, tarefas, e-mails, notas e arquivos dos seus conectores reunidos em uma página só.",
};

// O snapshot muda a cada geração; nunca sirva uma versão cacheada.
export const dynamic = "force-dynamic";

function greeting(hour: number): string {
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default async function PainelPage() {
  const snapshot = await getLifeSnapshot();
  const { owner, agenda } = snapshot;
  const now = new Date();

  const localHour = Number(
    new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      hour12: false,
      timeZone: owner.timeZone,
    }).format(now),
  );

  const current = agenda.find((e) => new Date(e.start) <= now && now < new Date(e.end));
  const next = agenda.find((e) => new Date(e.start) > now);
  const unread = snapshot.inbox.filter((t) => t.unread).length;
  const progress = dayProgress(now, owner.timeZone);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {snapshot.isSample && (
        <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Este é o snapshot de exemplo. Peça ao assistente para gerar o seu
          (<code>data/life-snapshot.local.json</code>) ou defina <code>LIFE_SNAPSHOT_JSON</code>.
        </p>
      )}

      <header className="mb-8">
        <p className="text-sm text-muted">{dayLabel(now.toISOString(), owner.timeZone)}</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {greeting(localHour)}, {owner.name}.
        </h1>
        <p className="mt-2 text-muted">
          {current ? (
            <>
              Agora: <strong className="text-foreground">{current.title}</strong> até{" "}
              {timeOfDay(current.end, owner.timeZone)}.
            </>
          ) : next ? (
            <>
              A seguir: <strong className="text-foreground">{next.title}</strong>{" "}
              {relative(next.start, now)}.
            </>
          ) : (
            "Sem compromissos restantes hoje."
          )}
        </p>

        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-brand"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-muted">
          {Math.round(progress * 100)}% do dia · snapshot gerado{" "}
          {relative(snapshot.generatedAt, now)}
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card
            title="Hoje"
            badge={`${agenda.length} blocos`}
            action={{ label: "Google Calendar", href: "https://calendar.google.com/" }}
          >
            <Agenda events={agenda} timeZone={owner.timeZone} now={now} />
          </Card>
        </div>

        <div className="grid gap-5">
          <Card
            title="Tarefas"
            badge={`${snapshot.tasks.length}`}
            action={{ label: "Todoist", href: "https://app.todoist.com/" }}
          >
            <Tasks tasks={snapshot.tasks} timeZone={owner.timeZone} />
          </Card>

          <Card
            title="Notas"
            action={{ label: "Notion", href: "https://www.notion.so/" }}
          >
            <Notes notes={snapshot.notes} />
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card
            title="Caixa de entrada"
            badge={unread > 0 ? `${unread} não lidas` : undefined}
            action={{ label: "Gmail", href: "https://mail.google.com/" }}
          >
            <Inbox threads={snapshot.inbox} now={now} />
          </Card>
        </div>

        <Card title="Arquivos" action={{ label: "Drive", href: "https://drive.google.com/" }}>
          <Files files={snapshot.files} now={now} />
        </Card>

        <div className="lg:col-span-3">
          <Card title="Conectores" badge={`${snapshot.connectors.length} fontes`}>
            <Connectors connectors={snapshot.connectors} />
          </Card>
        </div>
      </div>
    </div>
  );
}
