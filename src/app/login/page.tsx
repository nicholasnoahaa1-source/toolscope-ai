import Link from "next/link";
import LoginForm from "@/components/senac/LoginForm";

export const metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-bold text-foreground">Entrar na sala virtual</h1>
      <p className="mt-1 text-sm text-muted">Acesse suas turmas, atividades e materiais.</p>
      <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
        <LoginForm />
      </div>
      <p className="mt-6 text-center text-sm text-muted">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-medium text-brand hover:underline">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
