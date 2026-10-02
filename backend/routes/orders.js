import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { autenticar, somenteCliente } from "../middleware/auth.js";
import { idSchema } from "../lib/validation.js";

export const ordersRouter = Router();
ordersRouter.use(autenticar, somenteCliente);
const orderFields = {
  id: true,
  veiculo: true,
  endereco: true,
  quantidade: true,
  valorUnitario: true,
  status: true,
  respostaAdmin: true,
  createdAt: true,
  produto: { select: { id: true, image: true, model: true, name: true } },
  admin: { select: { nome: true } },
};
ordersRouter.post("/", async (req, res) => {
  const data = z
    .object({
      items: z
        .array(
          z
            .object({
              productId: idSchema,
              quantity: z.number().int().min(1).max(10),
            })
            .strict(),
        )
        .min(1)
        .max(10),
      veiculo: z.string().trim().min(2).max(160),
      endereco: z.string().trim().min(5).max(300),
    })
    .strict()
    .parse(req.body);
  const pedidos = await prisma.$transaction(async (tx) => {
    const created = [];
    for (const item of data.items) {
      const produto = await tx.produto.findFirstOrThrow({
        where: { id: item.productId, ativo: true },
      });
      created.push(
        await tx.pedido.create({
          data: {
            clienteId: res.locals.usuario.id,
            produtoId: produto.id,
            veiculo: data.veiculo,
            endereco: data.endereco,
            quantidade: item.quantity,
            valorUnitario: produto.price,
          },
          select: orderFields,
        }),
      );
    }
    return created;
  });
  res.status(201).json(pedidos);
});
ordersRouter.get("/", async (req, res) => {
  const pedidos = await prisma.pedido.findMany({
    where: { clienteId: res.locals.usuario.id },
    orderBy: { createdAt: "desc" },
    select: orderFields,
  });
  res.json(pedidos);
});
ordersRouter.patch("/:id/cancel", async (req, res) => {
  const { id } = z.object({ id: idSchema }).parse(req.params);
  const pedido = await prisma.pedido.findFirstOrThrow({
    where: { id, clienteId: res.locals.usuario.id },
  });
  if (pedido.status !== "PENDENTE")
    return res
      .status(409)
      .json({ mensagem: "Só é possível cancelar pedidos pendentes." });
  const atualizado = await prisma.pedido.update({
    where: { id },
    data: { status: "CANCELADO" },
    select: orderFields,
  });
  res.json(atualizado);
});
