import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { autenticar, somenteAdmin } from "../middleware/auth.js";
import { idSchema, orderStatusSchema } from "../lib/validation.js";

export const adminRouter = Router();
adminRouter.use(autenticar, somenteAdmin);
adminRouter.get("/dashboard", async (req, res) => {
  const [clientes, produtos, pedidos, porStatus] = await Promise.all([
    prisma.cliente.count(),
    prisma.produto.count({ where: { ativo: true } }),
    prisma.pedido.count(),
    prisma.pedido.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  res.json({
    clientes,
    produtos,
    pedidos,
    porStatus: porStatus.map((item) => ({
      status: item.status,
      quantidade: item._count._all,
    })),
  });
});
adminRouter.get("/orders", async (req, res) => {
  const pedidos = await prisma.pedido.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      cliente: {
        select: { id: true, nome: true, email: true, telefone: true },
      },
      produto: { select: { id: true, name: true, model: true, image: true } },
      admin: { select: { nome: true } },
    },
  });
  res.json(
    pedidos.map((p) => ({ ...p, valorUnitario: Number(p.valorUnitario) })),
  );
});
adminRouter.patch("/orders/:id", async (req, res) => {
  const { id } = z.object({ id: idSchema }).parse(req.params);
  const data = z
    .object({
      status: orderStatusSchema,
      respostaAdmin: z.string().trim().max(1000).optional().default(""),
    })
    .strict()
    .parse(req.body);
  const pedido = await prisma.pedido.update({
    where: { id },
    data: {
      status: data.status,
      respostaAdmin: data.respostaAdmin || null,
      adminId: res.locals.usuario.id,
    },
    include: {
      cliente: { select: { nome: true } },
      produto: { select: { name: true, model: true } },
    },
  });
  res.json({ ...pedido, valorUnitario: Number(pedido.valorUnitario) });
});
adminRouter.delete("/orders/:id", async (req, res) => {
  const { id } = z.object({ id: idSchema }).parse(req.params);
  await prisma.pedido.delete({ where: { id } });
  res.status(204).end();
});
