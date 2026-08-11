import Logo from "@/components/senac/Logo";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-muted">
        <Logo />
        <p className="mt-3 max-w-md">
          Sala virtual para turmas, atividades, entregas e materiais de aula.
        </p>
      </div>
      <div className="border-t border-border px-6 py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} Senac. Projeto interno de sala virtual — não afiliado oficialmente.
      </div>
    </footer>
  );
}
