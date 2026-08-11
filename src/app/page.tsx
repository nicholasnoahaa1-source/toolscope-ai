import Link from "next/link";
import { getSession } from "@/lib/auth";

export default async function Home() {
  const session = await getSession();

  return (
    <div>
      <section className="border-b border-border bg-gradient-to-b from-brand-light to-transparent px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Sala virtual <span className="text-brand">Senac</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Turmas, atividades, entregas e materiais de aula em um só lugar — para alunos e
            professores.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href={session ? "/dashboard" : "/cadastro"}
              className="rounded-full bg-brand px-6 py-3 text-sm font-medium text-white hover:bg-brand-dark"
            >
              {session ? "Ir para o painel" : "Começar agora"}
            </Link>
            {!session && (
              <Link
                href="/login"
                className="rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground hover:border-brand hover:text-brand"
              >
                Já tenho conta
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-6 py-16 sm:grid-cols-3">
        <Feature
          title="Turmas"
          description="Professores criam turmas e compartilham um código de acesso para os alunos entrarem."
        />
        <Feature
          title="Atividades e entregas"
          description="Publique atividades com prazo, receba entregas em arquivo e avalie com nota e feedback."
        />
        <Feature
          title="Materiais e mural"
          description="Compartilhe materiais de aula (arquivos ou links) e avisos importantes da turma."
        />
      </section>
    </div>
  );
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted">{description}</p>
    </div>
  );
}
