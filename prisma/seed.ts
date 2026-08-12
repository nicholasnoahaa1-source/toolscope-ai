import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function hash(password: string) {
  return bcrypt.hash(password, 10);
}

async function main() {
  const senhaPadrao = await hash("senac123");

  const professor = await prisma.user.upsert({
    where: { email: "professor@senac.br" },
    update: {},
    create: {
      name: "Ana Ribeiro",
      email: "professor@senac.br",
      passwordHash: senhaPadrao,
      role: "PROFESSOR",
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@senac.br" },
    update: {},
    create: {
      name: "Coordenação Senac",
      email: "admin@senac.br",
      passwordHash: senhaPadrao,
      role: "ADMIN",
    },
  });

  const alunosData = [
    { name: "Bruno Alves", email: "aluno1@senac.br" },
    { name: "Carla Souza", email: "aluno2@senac.br" },
    { name: "Diego Martins", email: "aluno3@senac.br" },
  ];

  const alunos = [];
  for (const dado of alunosData) {
    const aluno = await prisma.user.upsert({
      where: { email: dado.email },
      update: {},
      create: { ...dado, passwordHash: senhaPadrao, role: "ALUNO" },
    });
    alunos.push(aluno);
  }

  const turma = await prisma.turma.upsert({
    where: { codigo: "SENAC1" },
    update: {},
    create: {
      nome: "Desenvolvimento Web — Turma A",
      descricao: "Fundamentos de HTML, CSS, JavaScript e projeto final.",
      codigo: "SENAC1",
      professorId: professor.id,
    },
  });

  for (const aluno of alunos) {
    await prisma.matricula.upsert({
      where: { turmaId_alunoId: { turmaId: turma.id, alunoId: aluno.id } },
      update: {},
      create: { turmaId: turma.id, alunoId: aluno.id },
    });
  }

  await prisma.aviso.createMany({
    data: [
      {
        turmaId: turma.id,
        autorId: professor.id,
        titulo: "Bem-vindos(as) à turma!",
        conteudo: "Este é o mural da turma. Fiquem de olho aqui para avisos importantes.",
      },
      {
        turmaId: turma.id,
        autorId: professor.id,
        titulo: "Aula de amanhã será em laboratório",
        conteudo: "Tragam notebook, se possível. Vamos praticar HTML/CSS.",
      },
    ],
  });

  const prazoFuturo = new Date();
  prazoFuturo.setDate(prazoFuturo.getDate() + 7);

  const atividade = await prisma.atividade.create({
    data: {
      turmaId: turma.id,
      autorId: professor.id,
      titulo: "Página de perfil pessoal",
      descricao: "Crie uma página HTML/CSS com foto, bio e links para redes sociais.",
      prazo: prazoFuturo,
    },
  });

  await prisma.entrega.create({
    data: {
      atividadeId: atividade.id,
      alunoId: alunos[0].id,
      comentario: "Segue meu projeto, qualquer feedback é bem-vindo!",
      status: "ENTREGUE",
      enviadaEm: new Date(),
    },
  });

  await prisma.material.create({
    data: {
      turmaId: turma.id,
      autorId: professor.id,
      titulo: "Slides — Introdução ao HTML",
      tipo: "LINK",
      url: "https://developer.mozilla.org/pt-BR/docs/Web/HTML",
    },
  });

  console.log("Seed concluído:");
  console.log(`  Admin: ${admin.email} / senac123`);
  console.log(`  Professor: ${professor.email} / senac123`);
  console.log(`  Alunos: ${alunos.map((a) => a.email).join(", ")} / senac123`);
  console.log(`  Código da turma: ${turma.codigo}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
