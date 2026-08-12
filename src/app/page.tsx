import Link from "next/link";
import { getSession } from "@/lib/auth";

export default async function Home() {
  const session = await getSession();

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-brand-light to-transparent px-6 py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand-light px-3 py-1 text-xs font-medium text-brand-dark">
            Turmas · Atividades · Materiais
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Sala virtual <span className="text-brand">Senac</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Turmas, atividades, entregas e materiais de aula em um só lugar — para alunos e
            professores.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href={session ? "/dashboard" : "/cadastro"}
              className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-accent/30 hover:bg-accent/90"
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
          number="1"
          title="Turmas"
          description="Professores criam turmas e compartilham um código de acesso para os alunos entrarem."
        />
        <Feature
          number="2"
          title="Atividades e entregas"
          description="Publique atividades com prazo, receba entregas em arquivo e avalie com nota e feedback."
        />
        <Feature
          number="3"
          title="Materiais e mural"
          description="Compartilhe materiais de aula (arquivos ou links) e avisos importantes da turma."
        />
      </section>
    </div>
  );
}

function Feature({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 transition hover:border-brand/40 hover:shadow-sm">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent-light text-sm font-bold text-accent">
        {number}
      </span>
      <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted">{description}</p>
    </div>
  );
}
