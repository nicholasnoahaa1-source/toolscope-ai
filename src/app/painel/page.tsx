import type { Metadata } from "next";
import Link from "next/link";
import { getLifeSnapshot } from "@/lib/life/snapshot";
import { dayLabel, dayProgress, relative, timeOfDay } from "@/lib/life/format";
import { buildHabit, dateKey } from "@/lib/life/metrics";
import Card from "@/components/painel/Card";
import Agenda from "@/components/painel/Agenda";
import { Connectors, Files, Inbox, Notes, Tasks } from "@/components/painel/Lists";
import {
  Habits,
  Projects,
  QuickActions,
  TimeBreakdown,
  Week,
} from "@/components/painel/Insights";

export const metadata: Metadata = {
  title: "Painel da Vida",
  description:
    "Agenda, tarefas, e-mails, notas, arquivos, hábitos e projetos dos seus conectores em uma página só.",
};

// O snapshot muda a cada geração; nunca sirva uma versão cacheada.
export const dynamic = "force-dynamic";

function greeting(hour: number): string {
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default async function PainelPage({
  searchParams,
}: {
  searchParams: Promise<{ v?: string }>;
}) {
  const [{ v }, snapshot] = await Promise.all([searchParams, getLifeSnapshot()]);
  const { owner, agenda } = snapshot;
  const isWeek = v === "semana";
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

  // A janela do Calendar traz blocos que começaram ontem (o "Dormir" da
  // véspera); a visão de semana começa em hoje.
  const todayKey = dateKey(now.toISOString(), owner.timeZone);
  const week = snapshot.week.filter((e) => dateKey(e.start, owner.timeZone) >= todayKey);

  const habits = [
    buildHabit("academia", "Academia", "academia", snapshot.history, now, owner.timeZone),
    buildHabit("basquete", "Treino de basquete", "basquete", snapshot.history, now, owner.timeZone),
    buildHabit("escola", "Escola", "escola", snapshot.history, now, owner.timeZone),
  ];

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

        <div className="mt-5">
          <QuickActions />
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card
            title={isWeek ? "Próximos 7 dias" : "Hoje"}
            badge={isWeek ? `${week.length} blocos` : `${agenda.length} blocos`}
            action={{
              label: isWeek ? "Ver hoje" : "Ver a semana",
              href: isWeek ? "/painel" : "/painel?v=semana",
            }}
          >
            {isWeek ? (
              <Week events={week} timeZone={owner.timeZone} />
            ) : (
              <Agenda events={agenda} timeZone={owner.timeZone} now={now} />
            )}
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

          <Card title="Onde vai o seu dia">
            <TimeBreakdown events={agenda} />
          </Card>
        </div>

        <Card title="Hábitos" badge="14 dias">
          <Habits habits={habits} />
        </Card>

        <div className="lg:col-span-2">
          <Card
            title="Caixa de entrada"
            badge={unread > 0 ? `${unread} não lidas` : undefined}
            action={{ label: "Gmail", href: "https://mail.google.com/" }}
          >
            <Inbox threads={snapshot.inbox} now={now} />
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card
            title="Projetos"
            badge={`${snapshot.projects.length} abertos`}
            action={{ label: "GitHub", href: "https://github.com/pulls" }}
          >
            <Projects projects={snapshot.projects} now={now} />
          </Card>
        </div>

        <div className="grid gap-5">
          <Card title="Notas" action={{ label: "Notion", href: "https://www.notion.so/" }}>
            <Notes notes={snapshot.notes} />
          </Card>

          <Card title="Arquivos" action={{ label: "Drive", href: "https://drive.google.com/" }}>
            <Files files={snapshot.files} now={now} />
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card title="Conectores" badge={`${snapshot.connectors.length} fontes`}>
            <Connectors connectors={snapshot.connectors} />
          </Card>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-muted">
        <Link href="/" className="hover:text-brand">
          ToolScope
        </Link>{" "}
        · dados do snapshot gerado pelos seus conectores
      </p>
    </div>
  );
}
