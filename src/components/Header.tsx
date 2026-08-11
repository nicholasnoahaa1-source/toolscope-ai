import Link from "next/link";
import { getSession } from "@/lib/auth";
import { sair } from "@/lib/actions";
import Logo from "@/components/senac/Logo";

export default async function Header() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
        <Link href={session ? "/dashboard" : "/"} className="shrink-0">
          <Logo />
        </Link>

        {session && (
          <nav className="hidden flex-1 items-center gap-6 text-sm font-medium text-muted md:flex">
            <Link href="/dashboard" className="hover:text-foreground">
              Painel
            </Link>
            <Link href="/turmas" className="hover:text-foreground">
              Minhas turmas
            </Link>
          </nav>
        )}

        <div className="ml-auto flex items-center gap-3">
          {session ? (
            <>
              <span className="hidden text-sm text-muted sm:inline">
                {session.name} ·{" "}
                {session.role === "PROFESSOR" ? "Professor" : session.role === "ADMIN" ? "Admin" : "Aluno"}
              </span>
              <form action={sair}>
                <button
                  type="submit"
                  className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:border-brand hover:text-brand"
                >
                  Sair
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:border-brand hover:text-brand"
              >
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
              >
                Criar conta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
