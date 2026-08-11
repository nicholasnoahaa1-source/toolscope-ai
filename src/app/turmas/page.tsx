import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getTurmasParaUsuario } from "@/lib/queries";
import TurmaCard from "@/components/senac/TurmaCard";

export const metadata = { title: "Minhas turmas" };

export default async function TurmasPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const turmas = await getTurmasParaUsuario(session);
  const isProfessor = session.role === "PROFESSOR" || session.role === "ADMIN";

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Minhas turmas</h1>
        <Link
          href={isProfessor ? "/turmas/nova" : "/turmas/entrar"}
          className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
        >
          {isProfessor ? "Criar turma" : "Entrar em turma"}
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {turmas.map((turma) => (
          <TurmaCard key={turma.id} turma={turma} />
        ))}
      </div>

      {turmas.length === 0 && (
        <p className="mt-6 text-sm text-muted">
          {isProfessor
            ? "Você ainda não criou nenhuma turma."
            : "Você ainda não está em nenhuma turma. Peça o código ao seu professor."}
        </p>
      )}
    </div>
  );
}
