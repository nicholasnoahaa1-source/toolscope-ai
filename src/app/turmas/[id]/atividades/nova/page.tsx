import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getTurmaComPermissao } from "@/lib/queries";
import NovaAtividadeForm from "@/components/senac/NovaAtividadeForm";

export const metadata = { title: "Nova atividade" };

export default async function NovaAtividadePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const result = await getTurmaComPermissao(id, session);
  if (!result) notFound();
  if (!result.isProfessor) redirect(`/turmas/${id}`);

  return (
    <div className="mx-auto max-w-md px-6 py-10">
      <h1 className="text-2xl font-bold text-foreground">Nova atividade</h1>
      <p className="mt-1 text-sm text-muted">{result.turma.nome}</p>
      <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
        <NovaAtividadeForm turmaId={id} />
      </div>
    </div>
  );
}
