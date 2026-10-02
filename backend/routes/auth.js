import { Router } from "express";
import bcrypt from "bcryptjs";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { autenticar, criarToken } from "../middleware/auth.js";
import { emailSchema, passwordSchema } from "../lib/validation.js";

export const authRouter = Router();
const limitarLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { mensagem: "Muitas tentativas. Aguarde alguns minutos." },
});
const publicUser = {
  id: true,
  nome: true,
  email: true,
  telefone: true,
  endereco: true,
  cidade: true,
  estado: true,
};

authRouter.post("/register", limitarLogin, async (req, res) => {
  const dados = z
    .object({
      nome: z.string().trim().min(2).max(120),
      email: emailSchema,
      telefone: z.string().trim().max(30).optional().default(""),
      dataNascimento: z.string().optional().default(""),
      endereco: z.string().trim().max(300).optional().default(""),
      cidade: z.string().trim().max(100).optional().default(""),
      estado: z.string().trim().max(2).optional().default(""),
      senha: passwordSchema,
    })
    .strict()
    .parse(req.body);
  const { senha, dataNascimento, ...campos } = dados;
  const cliente = await prisma.cliente.create({
    data: {
      ...campos,
      senha: await bcrypt.hash(senha, 12),
      dataNascimento: dataNascimento
        ? new Date(`${dataNascimento}T00:00:00.000Z`)
        : null,
    },
    select: publicUser,
  });
  res.status(201).json(cliente);
});

authRouter.post("/login", limitarLogin, async (req, res) => {
  const dados = z
    .object({
      email: emailSchema,
      senha: z.string().min(1).max(72),
      manterConectado: z.boolean().default(false),
    })
    .strict()
    .parse(req.body);
  let conta = await prisma.admin.findUnique({ where: { email: dados.email } });
  let tipo = "admin";
  if (!conta) {
    conta = await prisma.cliente.findUnique({ where: { email: dados.email } });
    tipo = "cliente";
  }
  if (!conta || !(await bcrypt.compare(dados.senha, conta.senha)))
    return res.status(401).json({ mensagem: "E-mail ou senha inválidos." });
  const user = {
    id: conta.id,
    nome: conta.nome,
    email: conta.email,
    isAdmin: tipo === "admin",
  };
  res.json({ user, token: criarToken(conta.id, tipo, dados.manterConectado) });
});

authRouter.get("/me", autenticar, async (req, res) => {
  const { id, tipo } = res.locals.usuario;
  const user =
    tipo === "admin"
      ? await prisma.admin.findUnique({ where: { id }, select: publicUser })
      : await prisma.cliente.findUnique({ where: { id }, select: publicUser });
  res.json({ ...user, isAdmin: tipo === "admin" });
});
