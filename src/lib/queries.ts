import { prisma } from "@/lib/prisma";
import type { SessionPayload } from "@/lib/auth";

export async function getTurmasParaUsuario(session: SessionPayload) {
  if (session.role === "PROFESSOR" || session.role === "ADMIN") {
    return prisma.turma.findMany({
      where: session.role === "ADMIN" ? {} : { professorId: session.userId },
      include: {
        professor: { select: { name: true } },
        _count: { select: { matriculas: true, atividades: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return prisma.turma.findMany({
    where: { matriculas: { some: { alunoId: session.userId } } },
    include: {
      professor: { select: { name: true } },
      _count: { select: { matriculas: true, atividades: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTurmaComPermissao(turmaId: string, session: SessionPayload) {
  const turma = await prisma.turma.findUnique({
    where: { id: turmaId },
    include: {
      professor: { select: { id: true, name: true } },
      avisos: { orderBy: { createdAt: "desc" }, include: { autor: { select: { name: true } } } },
      atividades: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { entregas: true } },
          entregas: session.role === "ALUNO" ? { where: { alunoId: session.userId } } : false,
        },
      },
      materiais: {
        orderBy: { createdAt: "desc" },
        include: { arquivos: true, autor: { select: { name: true } } },
      },
      matriculas: { include: { aluno: { select: { id: true, name: true, email: true } } } },
    },
  });

  if (!turma) return null;

  const isProfessor = turma.professorId === session.userId;
  const isAluno = turma.matriculas.some((m) => m.alunoId === session.userId);
  const isAdmin = session.role === "ADMIN";

  if (!isProfessor && !isAluno && !isAdmin) return null;

  return { turma, isProfessor: isProfessor || isAdmin };
}

export async function getAtividadeComPermissao(atividadeId: string, session: SessionPayload) {
  const atividade = await prisma.atividade.findUnique({
    where: { id: atividadeId },
    include: {
      turma: { include: { matriculas: true } },
      anexos: true,
      entregas: {
        include: {
          aluno: { select: { id: true, name: true, email: true } },
          arquivos: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!atividade) return null;

  const isProfessor = atividade.turma.professorId === session.userId || session.role === "ADMIN";
  const isAluno = atividade.turma.matriculas.some((m) => m.alunoId === session.userId);

  if (!isProfessor && !isAluno) return null;

  return { atividade, isProfessor };
}

export async function getResumoDashboard(session: SessionPayload) {
  if (session.role === "ALUNO") {
    const proximasAtividades = await prisma.atividade.findMany({
      where: {
        turma: { matriculas: { some: { alunoId: session.userId } } },
        prazo: { gte: new Date() },
      },
      orderBy: { prazo: "asc" },
      take: 5,
      include: { turma: { select: { nome: true, id: true } } },
    });
    const turmasCount = await prisma.matricula.count({ where: { alunoId: session.userId } });
    return { tipo: "ALUNO" as const, proximasAtividades, turmasCount };
  }

  const turmasCount = await prisma.turma.count({
    where: session.role === "ADMIN" ? {} : { professorId: session.userId },
  });
  const entregasPendentes = await prisma.entrega.count({
    where: {
      status: "ENTREGUE",
      atividade: {
        turma: session.role === "ADMIN" ? {} : { professorId: session.userId },
      },
    },
  });
  return { tipo: "PROFESSOR" as const, turmasCount, entregasPendentes };
}
