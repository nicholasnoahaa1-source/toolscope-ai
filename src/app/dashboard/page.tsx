import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getResumoDashboard, getTurmasParaUsuario } from "@/lib/queries";
import TurmaCard from "@/components/senac/TurmaCard";

export const metadata = { title: "Painel" };

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [turmas, resumo] = await Promise.all([
    getTurmasParaUsuario(session),
    getResumoDashboard(session),
  ]);

  const isProfessor = session.role === "PROFESSOR" || session.role === "ADMIN";

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-bold text-foreground">Olá, {session.name.split(" ")[0]}</h1>
      <p className="mt-1 text-sm text-muted">
        {isProfessor ? "Aqui está o resumo das suas turmas." : "Aqui está o resumo das suas atividades."}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <p className="text-sm text-muted">Turmas</p>
          <p className="mt-1 text-3xl font-bold text-foreground">{resumo.turmasCount}</p>
        </div>
        {resumo.tipo === "PROFESSOR" ? (
          <div className="rounded-2xl border border-border bg-surface p-6">
            <p className="text-sm text-muted">Entregas aguardando avaliação</p>
            <p className="mt-1 text-3xl font-bold text-foreground">{resumo.entregasPendentes}</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-surface p-6">
            <p className="text-sm text-muted">Próximas atividades</p>
            <p className="mt-1 text-3xl font-bold text-foreground">{resumo.proximasAtividades.length}</p>
          </div>
        )}
      </div>

      {resumo.tipo === "ALUNO" && resumo.proximasAtividades.length > 0 && (
        <div className="mt-8">
          <h2 className="font-semibold text-foreground">Próximos prazos</h2>
          <ul className="mt-3 divide-y divide-border rounded-2xl border border-border bg-surface">
            {resumo.proximasAtividades.map((a) => (
              <li key={a.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <div>
                  <Link
                    href={`/turmas/${a.turma.id}/atividades/${a.id}`}
                    className="font-medium text-foreground hover:text-brand"
                  >
                    {a.titulo}
                  </Link>
                  <p className="text-muted">{a.turma.nome}</p>
                </div>
                <span className="text-muted">
                  {a.prazo?.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Minhas turmas</h2>
        <Link href="/turmas" className="text-sm font-medium text-brand hover:underline">
          Ver todas
        </Link>
      </div>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {turmas.slice(0, 6).map((turma) => (
          <TurmaCard key={turma.id} turma={turma} />
        ))}
        {turmas.length === 0 && (
          <p className="text-sm text-muted">
            Você ainda não está em nenhuma turma.{" "}
            <Link href={isProfessor ? "/turmas/nova" : "/turmas/entrar"} className="text-brand hover:underline">
              {isProfessor ? "Criar uma turma" : "Entrar em uma turma"}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
