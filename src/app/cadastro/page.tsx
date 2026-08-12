import Link from "next/link";
import CadastroForm from "@/components/senac/CadastroForm";

export const metadata = { title: "Criar conta" };

export default function CadastroPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-bold text-foreground">Criar conta</h1>
      <p className="mt-1 text-sm text-muted">Cadastre-se como aluno ou professor.</p>
      <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
        <CadastroForm />
      </div>
      <p className="mt-6 text-center text-sm text-muted">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
