import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import EntrarTurmaForm from "@/components/senac/EntrarTurmaForm";

export const metadata = { title: "Entrar em turma" };

export default async function EntrarTurmaPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ALUNO") redirect("/turmas");

  return (
    <div className="mx-auto max-w-md px-6 py-10">
      <h1 className="text-2xl font-bold text-foreground">Entrar em turma</h1>
      <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
        <EntrarTurmaForm />
      </div>
    </div>
  );
}
