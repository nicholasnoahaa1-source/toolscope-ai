import Link from "next/link";

type TurmaCardProps = {
  turma: {
    id: string;
    nome: string;
    descricao: string | null;
    codigo: string;
    professor: { name: string };
    _count: { matriculas: number; atividades: number };
  };
};

export default function TurmaCard({ turma }: TurmaCardProps) {
  return (
    <Link
      href={`/turmas/${turma.id}`}
      className="block rounded-2xl border border-border bg-surface p-5 transition hover:border-brand"
    >
      <h3 className="font-semibold text-foreground">{turma.nome}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted">{turma.descricao || "Sem descrição."}</p>
      <div className="mt-4 flex items-center justify-between text-xs text-muted">
        <span>{turma.professor.name}</span>
        <span>
          {turma._count.matriculas} aluno{turma._count.matriculas === 1 ? "" : "s"} ·{" "}
          {turma._count.atividades} atividade{turma._count.atividades === 1 ? "" : "s"}
        </span>
      </div>
    </Link>
  );
}
