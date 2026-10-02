import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

const secret = process.env.JWT_SECRET;
if (!secret || secret.length < 32)
  throw new Error("Configure JWT_SECRET com pelo menos 32 caracteres.");

export function criarToken(id, tipo, manterConectado) {
  return jwt.sign({ tipo }, secret, {
    subject: id,
    expiresIn: manterConectado ? "7d" : "8h",
    issuer: "voltz-api",
    audience: "voltz-web",
    algorithm: "HS256",
  });
}

export async function autenticar(req, res, next) {
  const value = req.headers.authorization;
  const token = value?.startsWith("Bearer ") ? value.slice(7) : "";
  if (!token)
    return res.status(401).json({ mensagem: "Faça login para continuar." });
  try {
    const payload = jwt.verify(token, secret, {
      algorithms: ["HS256"],
      issuer: "voltz-api",
      audience: "voltz-web",
    });
    if (
      typeof payload === "string" ||
      !payload.sub ||
      !["cliente", "admin"].includes(payload.tipo)
    ) {
      return res.status(401).json({ mensagem: "Sessão inválida." });
    }
    const registro =
      payload.tipo === "admin"
        ? await prisma.admin.findUnique({
            where: { id: payload.sub },
            select: { id: true },
          })
        : await prisma.cliente.findUnique({
            where: { id: payload.sub },
            select: { id: true },
          });
    if (!registro)
      return res.status(401).json({ mensagem: "Conta não encontrada." });
    res.locals.usuario = { id: registro.id, tipo: payload.tipo };
    return next();
  } catch (error) {
    if (
      error?.name === "JsonWebTokenError" ||
      error?.name === "TokenExpiredError"
    ) {
      return res.status(401).json({ mensagem: "Sessão inválida ou expirada." });
    }
    return next(error);
  }
}

export function somenteAdmin(req, res, next) {
  if (res.locals.usuario?.tipo !== "admin")
    return res
      .status(403)
      .json({ mensagem: "Acesso exclusivo do administrador." });
  next();
}

export function somenteCliente(req, res, next) {
  if (res.locals.usuario?.tipo !== "cliente")
    return res.status(403).json({ mensagem: "Ação disponível para clientes." });
  next();
}
