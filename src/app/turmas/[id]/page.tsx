import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getTurmaComPermissao } from "@/lib/queries";

export const metadata = { title: "Turma" };

const TABS = [
  { key: "mural", label: "Mural" },
  { key: "atividades", label: "Atividades" },
  { key: "materiais", label: "Materiais" },
  { key: "alunos", label: "Alunos" },
] as const;

export default async function TurmaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const { tab: tabParam } = await searchParams;
  const result = await getTurmaComPermissao(id, session);
  if (!result) notFound();

  const { turma, isProfessor } = result;
  const tab = TABS.some((t) => t.key === tabParam) ? tabParam! : "mural";

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{turma.nome}</h1>
          <p className="mt-1 text-sm text-muted">{turma.descricao || "Sem descrição."}</p>
          <p className="mt-1 text-sm text-muted">Professor: {turma.professor.name}</p>
        </div>
        {isProfessor && (
          <span className="shrink-0 rounded-full border border-border bg-surface-muted px-4 py-2 text-sm font-medium text-foreground">
            Código: <span className="font-mono tracking-widest text-brand">{turma.codigo}</span>
          </span>
        )}
      </div>

      <nav className="mt-8 flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/turmas/${turma.id}?tab=${t.key}`}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              tab === t.key
                ? "border-brand text-brand"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="mt-6">
        {tab === "mural" && (
          <div className="space-y-4">
            {isProfessor && (
              <Link
                href={`/turmas/${turma.id}/avisos/novo`}
                className="inline-block rounded-full bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
              >
                Novo aviso
              </Link>
            )}
            {turma.avisos.length === 0 && <p className="text-sm text-muted">Nenhum aviso ainda.</p>}
            {turma.avisos.map((aviso) => (
              <article key={aviso.id} className="rounded-2xl border border-border bg-surface p-5">
                <h3 className="font-semibold text-foreground">{aviso.titulo}</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted">{aviso.conteudo}</p>
                <p className="mt-3 text-xs text-muted">
                  {aviso.autor.name} ·{" "}
                  {aviso.createdAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                </p>
              </article>
            ))}
          </div>
        )}

        {tab === "atividades" && (
          <div className="space-y-3">
            {isProfessor && (
              <Link
                href={`/turmas/${turma.id}/atividades/nova`}
                className="inline-block rounded-full bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
              >
                Nova atividade
              </Link>
            )}
            {turma.atividades.length === 0 && (
              <p className="text-sm text-muted">Nenhuma atividade publicada ainda.</p>
            )}
            {turma.atividades.map((atividade) => {
              const minhaEntrega = "entregas" in atividade ? atividade.entregas?.[0] : undefined;
              return (
                <Link
                  key={atividade.id}
                  href={`/turmas/${turma.id}/atividades/${atividade.id}`}
                  className="flex items-center justify-between rounded-2xl border border-border bg-surface p-5 hover:border-brand"
                >
                  <div>
                    <h3 className="font-medium text-foreground">{atividade.titulo}</h3>
                    <p className="mt-1 text-xs text-muted">
                      {atividade.prazo
                        ? `Prazo: ${atividade.prazo.toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}`
                        : "Sem prazo definido"}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-muted">
                    {isProfessor
                      ? `${atividade._count.entregas} entrega${atividade._count.entregas === 1 ? "" : "s"}`
                      : minhaEntrega
                        ? minhaEntrega.status.charAt(0) + minhaEntrega.status.slice(1).toLowerCase()
                        : "Pendente"}
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        {tab === "materiais" && (
          <div className="space-y-3">
            {isProfessor && (
              <Link
                href={`/turmas/${turma.id}/materiais/novo`}
                className="inline-block rounded-full bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
              >
                Novo material
              </Link>
            )}
            {turma.materiais.length === 0 && <p className="text-sm text-muted">Nenhum material publicado ainda.</p>}
            {turma.materiais.map((material) => (
              <div key={material.id} className="rounded-2xl border border-border bg-surface p-5">
                <h3 className="font-medium text-foreground">{material.titulo}</h3>
                <p className="mt-1 text-xs text-muted">{material.autor.name}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {material.tipo === "LINK" && material.url && (
                    <a
                      href={material.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-brand hover:underline"
                    >
                      Abrir link ↗
                    </a>
                  )}
                  {material.arquivos.map((arquivo) => (
                    <a
                      key={arquivo.id}
                      href={`/api/arquivos/${arquivo.id}`}
                      className="text-sm font-medium text-brand hover:underline"
                    >
                      {arquivo.nomeOriginal} ↓
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "alunos" && (
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            {turma.matriculas.length === 0 && (
              <p className="p-5 text-sm text-muted">Nenhum aluno matriculado ainda.</p>
            )}
            <ul className="divide-y divide-border">
              {turma.matriculas.map((m) => (
                <li key={m.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <span className="text-foreground">{m.aluno.name}</span>
                  <span className="text-muted">{m.aluno.email}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
