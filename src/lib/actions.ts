"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile } from "@/lib/files";
import {
  clearSessionCookie,
  getSession,
  hashPassword,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";

export type ActionState = { error?: string } | undefined;

function generateCodigoTurma() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

const cadastroSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome completo."),
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(6, "A senha precisa ter ao menos 6 caracteres."),
  role: z.enum(["ALUNO", "PROFESSOR"]),
});

export async function cadastrar(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = cadastroSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { error: "Já existe uma conta com este e-mail." };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role,
    },
  });

  await setSessionCookie({ userId: user.id, name: user.name, email: user.email, role: user.role });
  redirect("/dashboard");
}

const loginSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe sua senha."),
});

export async function entrar(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { error: "E-mail ou senha incorretos." };
  }

  await setSessionCookie({ userId: user.id, name: user.name, email: user.email, role: user.role });
  redirect("/dashboard");
}

export async function sair() {
  await clearSessionCookie();
  redirect("/login");
}

export async function criarTurma(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireSession();
  if (session.role !== "PROFESSOR" && session.role !== "ADMIN") {
    return { error: "Apenas professores podem criar turmas." };
  }

  const nome = String(formData.get("nome") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();
  if (nome.length < 2) return { error: "Informe um nome para a turma." };

  let codigo = generateCodigoTurma();
  for (let attempts = 0; attempts < 5; attempts++) {
    const taken = await prisma.turma.findUnique({ where: { codigo } });
    if (!taken) break;
    codigo = generateCodigoTurma();
  }

  const turma = await prisma.turma.create({
    data: { nome, descricao: descricao || null, codigo, professorId: session.userId },
  });

  revalidatePath("/turmas");
  redirect(`/turmas/${turma.id}`);
}

export async function entrarNaTurma(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireSession();
  if (session.role !== "ALUNO") {
    return { error: "Apenas alunos podem entrar em turmas por código." };
  }

  const codigo = String(formData.get("codigo") ?? "").trim().toUpperCase();
  const turma = await prisma.turma.findUnique({ where: { codigo } });
  if (!turma) return { error: "Código de turma inválido." };

  await prisma.matricula.upsert({
    where: { turmaId_alunoId: { turmaId: turma.id, alunoId: session.userId } },
    update: {},
    create: { turmaId: turma.id, alunoId: session.userId },
  });

  revalidatePath("/turmas");
  redirect(`/turmas/${turma.id}`);
}

async function assertProfessorDaTurma(turmaId: string, session: { userId: string; role: string }) {
  const turma = await prisma.turma.findUnique({ where: { id: turmaId } });
  if (!turma) return null;
  if (turma.professorId !== session.userId && session.role !== "ADMIN") return null;
  return turma;
}

export async function criarAtividade(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireSession();
  const turmaId = String(formData.get("turmaId") ?? "");
  const turma = await assertProfessorDaTurma(turmaId, session);
  if (!turma) return { error: "Você não tem permissão para postar nesta turma." };

  const titulo = String(formData.get("titulo") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();
  const prazoRaw = String(formData.get("prazo") ?? "");
  if (titulo.length < 2) return { error: "Informe um título para a atividade." };

  const anexos = formData.getAll("anexos").filter((f): f is File => f instanceof File && f.size > 0);

  const atividade = await prisma.atividade.create({
    data: {
      turmaId,
      autorId: session.userId,
      titulo,
      descricao,
      prazo: prazoRaw ? new Date(prazoRaw) : null,
    },
  });

  for (const file of anexos) {
    const saved = await saveUploadedFile(file);
    await prisma.arquivo.create({
      data: { ...saved, enviadoPorId: session.userId, atividadeId: atividade.id },
    });
  }

  revalidatePath(`/turmas/${turmaId}`);
  redirect(`/turmas/${turmaId}/atividades/${atividade.id}`);
}

export async function criarMaterial(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireSession();
  const turmaId = String(formData.get("turmaId") ?? "");
  const turma = await assertProfessorDaTurma(turmaId, session);
  if (!turma) return { error: "Você não tem permissão para postar nesta turma." };

  const titulo = String(formData.get("titulo") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "ARQUIVO") as "ARQUIVO" | "LINK";
  const url = String(formData.get("url") ?? "").trim();
  if (titulo.length < 2) return { error: "Informe um título para o material." };
  if (tipo === "LINK" && !url) return { error: "Informe a URL do material." };

  const arquivo = formData.get("arquivo");
  if (tipo === "ARQUIVO" && !(arquivo instanceof File && arquivo.size > 0)) {
    return { error: "Selecione um arquivo para enviar." };
  }

  const material = await prisma.material.create({
    data: { turmaId, autorId: session.userId, titulo, tipo, url: tipo === "LINK" ? url : null },
  });

  if (tipo === "ARQUIVO" && arquivo instanceof File) {
    const saved = await saveUploadedFile(arquivo);
    await prisma.arquivo.create({
      data: { ...saved, enviadoPorId: session.userId, materialId: material.id },
    });
  }

  revalidatePath(`/turmas/${turmaId}`);
  redirect(`/turmas/${turmaId}`);
}

export async function criarAviso(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireSession();
  const turmaId = String(formData.get("turmaId") ?? "");
  const turma = await assertProfessorDaTurma(turmaId, session);
  if (!turma) return { error: "Você não tem permissão para postar nesta turma." };

  const titulo = String(formData.get("titulo") ?? "").trim();
  const conteudo = String(formData.get("conteudo") ?? "").trim();
  if (titulo.length < 2 || conteudo.length < 1) {
    return { error: "Preencha o título e o conteúdo do aviso." };
  }

  await prisma.aviso.create({ data: { turmaId, autorId: session.userId, titulo, conteudo } });

  revalidatePath(`/turmas/${turmaId}`);
  redirect(`/turmas/${turmaId}`);
}

export async function enviarEntrega(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireSession();
  if (session.role !== "ALUNO") return { error: "Apenas alunos podem enviar entregas." };

  const atividadeId = String(formData.get("atividadeId") ?? "");
  const atividade = await prisma.atividade.findUnique({
    where: { id: atividadeId },
    include: { turma: { include: { matriculas: true } } },
  });
  if (!atividade) return { error: "Atividade não encontrada." };
  const matriculado = atividade.turma.matriculas.some((m) => m.alunoId === session.userId);
  if (!matriculado) return { error: "Você não está matriculado nesta turma." };

  const comentario = String(formData.get("comentario") ?? "").trim();
  const anexos = formData.getAll("arquivos").filter((f): f is File => f instanceof File && f.size > 0);

  const atrasada = atividade.prazo ? new Date() > atividade.prazo : false;

  const entrega = await prisma.entrega.upsert({
    where: { atividadeId_alunoId: { atividadeId, alunoId: session.userId } },
    update: {
      comentario: comentario || null,
      status: atrasada ? "ATRASADA" : "ENTREGUE",
      enviadaEm: new Date(),
    },
    create: {
      atividadeId,
      alunoId: session.userId,
      comentario: comentario || null,
      status: atrasada ? "ATRASADA" : "ENTREGUE",
      enviadaEm: new Date(),
    },
  });

  for (const file of anexos) {
    const saved = await saveUploadedFile(file);
    await prisma.arquivo.create({
      data: { ...saved, enviadoPorId: session.userId, entregaId: entrega.id },
    });
  }

  revalidatePath(`/turmas/${atividade.turmaId}/atividades/${atividadeId}`);
  return undefined;
}

export async function avaliarEntrega(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireSession();
  const entregaId = String(formData.get("entregaId") ?? "");
  const entrega = await prisma.entrega.findUnique({
    where: { id: entregaId },
    include: { atividade: { include: { turma: true } } },
  });
  if (!entrega) return { error: "Entrega não encontrada." };
  if (entrega.atividade.turma.professorId !== session.userId && session.role !== "ADMIN") {
    return { error: "Você não tem permissão para avaliar esta entrega." };
  }

  const notaRaw = String(formData.get("nota") ?? "");
  const feedback = String(formData.get("feedback") ?? "").trim();
  const nota = notaRaw ? Number(notaRaw) : null;
  if (nota !== null && (Number.isNaN(nota) || nota < 0 || nota > 10)) {
    return { error: "A nota deve estar entre 0 e 10." };
  }

  await prisma.entrega.update({
    where: { id: entregaId },
    data: { nota, feedback: feedback || null, status: "AVALIADA", avaliadaEm: new Date() },
  });

  revalidatePath(`/turmas/${entrega.atividade.turmaId}/atividades/${entrega.atividadeId}`);
  return undefined;
}
