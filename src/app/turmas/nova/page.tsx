import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import NovaTurmaForm from "@/components/senac/NovaTurmaForm";

export const metadata = { title: "Criar turma" };

export default async function NovaTurmaPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "PROFESSOR" && session.role !== "ADMIN") redirect("/turmas");

  return (
    <div className="mx-auto max-w-md px-6 py-10">
      <h1 className="text-2xl font-bold text-foreground">Criar turma</h1>
      <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
        <NovaTurmaForm />
      </div>
    </div>
  );
}
