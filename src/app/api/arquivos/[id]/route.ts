import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { readStoredFile } from "@/lib/files";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const arquivo = await prisma.arquivo.findUnique({
    where: { id },
    include: {
      atividade: { include: { turma: { include: { matriculas: true } } } },
      material: { include: { turma: { include: { matriculas: true } } } },
      entrega: { include: { atividade: { include: { turma: { include: { matriculas: true } } } } } },
    },
  });
  if (!arquivo) return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });

  const turma = arquivo.atividade?.turma ?? arquivo.material?.turma ?? arquivo.entrega?.atividade.turma;
  if (!turma) return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });

  const isProfessor = turma.professorId === session.userId || session.role === "ADMIN";
  const isMatriculado = turma.matriculas.some((m) => m.alunoId === session.userId);
  const isDonoDaEntrega = arquivo.entrega && arquivo.entrega.alunoId === session.userId;

  if (!isProfessor && !isMatriculado && !isDonoDaEntrega) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const buffer = await readStoredFile(arquivo.caminho);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": arquivo.mimeType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(arquivo.nomeOriginal)}"`,
      "Content-Length": String(arquivo.tamanho),
    },
  });
}
