import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAtividadeComPermissao } from "@/lib/queries";
import EntregaForm from "@/components/senac/EntregaForm";
import AvaliarForm from "@/components/senac/AvaliarForm";
import StatusBadge from "@/components/senac/StatusBadge";

export const metadata = { title: "Atividade" };

export default async function AtividadePage({
  params,
}: {
  params: Promise<{ id: string; atividadeId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { atividadeId } = await params;
  const result = await getAtividadeComPermissao(atividadeId, session);
  if (!result) notFound();

  const { atividade, isProfessor } = result;
  const minhaEntrega = !isProfessor
    ? atividade.entregas.find((e) => e.alunoId === session.userId)
    : undefined;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-bold text-foreground">{atividade.titulo}</h1>
      <p className="mt-1 text-sm text-muted">
        {atividade.prazo
          ? `Prazo: ${atividade.prazo.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}`
          : "Sem prazo definido"}
      </p>
      <p className="mt-4 whitespace-pre-wrap text-sm text-foreground">{atividade.descricao}</p>

      {atividade.anexos.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {atividade.anexos.map((arquivo) => (
            <a
              key={arquivo.id}
              href={`/api/arquivos/${arquivo.id}`}
              className="text-sm font-medium text-brand hover:underline"
            >
              {arquivo.nomeOriginal} ↓
            </a>
          ))}
        </div>
      )}

      <div className="mt-8 border-t border-border pt-6">
        {isProfessor ? (
          <>
            <h2 className="font-semibold text-foreground">
              Entregas ({atividade.entregas.length})
            </h2>
            <div className="mt-4 space-y-3">
              {atividade.entregas.length === 0 && (
                <p className="text-sm text-muted">Nenhum aluno enviou entrega ainda.</p>
              )}
              {atividade.entregas.map((entrega) => (
                <div key={entrega.id} className="rounded-2xl border border-border bg-surface p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-foreground">{entrega.aluno.name}</span>
                    <div className="flex items-center gap-2">
                      {entrega.nota !== null && (
                        <span className="text-sm font-semibold text-foreground">{entrega.nota}/10</span>
                      )}
                      <StatusBadge status={entrega.status} />
                    </div>
                  </div>
                  {entrega.comentario && (
                    <p className="mt-2 text-sm text-muted">{entrega.comentario}</p>
                  )}
                  {entrega.arquivos.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-3">
                      {entrega.arquivos.map((arquivo) => (
                        <a
                          key={arquivo.id}
                          href={`/api/arquivos/${arquivo.id}`}
                          className="text-sm font-medium text-brand hover:underline"
                        >
                          {arquivo.nomeOriginal} ↓
                        </a>
                      ))}
                    </div>
                  )}
                  {entrega.feedback && (
                    <p className="mt-2 rounded-lg bg-surface-muted px-3 py-2 text-sm text-foreground">
                      Feedback: {entrega.feedback}
                    </p>
                  )}
                  <div className="mt-3">
                    <AvaliarForm
                      entregaId={entrega.id}
                      notaAtual={entrega.nota}
                      feedbackAtual={entrega.feedback}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Sua entrega</h2>
              {minhaEntrega && <StatusBadge status={minhaEntrega.status} />}
            </div>
            {minhaEntrega?.nota !== undefined && minhaEntrega?.nota !== null && (
              <p className="mb-3 text-sm font-medium text-foreground">Nota: {minhaEntrega.nota}/10</p>
            )}
            {minhaEntrega?.feedback && (
              <p className="mb-3 rounded-lg bg-surface-muted px-3 py-2 text-sm text-foreground">
                Feedback do professor: {minhaEntrega.feedback}
              </p>
            )}
            {minhaEntrega?.arquivos && minhaEntrega.arquivos.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-3">
                {minhaEntrega.arquivos.map((arquivo) => (
                  <a
                    key={arquivo.id}
                    href={`/api/arquivos/${arquivo.id}`}
                    className="text-sm font-medium text-brand hover:underline"
                  >
                    {arquivo.nomeOriginal} ↓
                  </a>
                ))}
              </div>
            )}
            <EntregaForm atividadeId={atividade.id} />
          </>
        )}
      </div>
    </div>
  );
}
