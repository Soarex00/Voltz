import "dotenv/config";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { emailSchema, passwordSchema } from "../lib/validation.js";

const dados = z
  .object({
    nome: z.string().trim().min(2).max(120),
    email: emailSchema,
    senha: passwordSchema,
  })
  .parse({
    nome: process.env.ADMIN_NAME,
    email: process.env.ADMIN_EMAIL,
    senha: process.env.ADMIN_PASSWORD,
  });
try {
  const hash = await bcrypt.hash(dados.senha, 12);
  await prisma.admin.upsert({
    where: { email: dados.email },
    create: { ...dados, senha: hash },
    update: { nome: dados.nome, senha: hash },
  });
  console.log(`Administrador ${dados.email} criado/atualizado.`);
} finally {
  await prisma.$disconnect();
}
