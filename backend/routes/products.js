import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import {
  autenticar,
  somenteAdmin,
  somenteCliente,
} from "../middleware/auth.js";
import { idSchema, productSchema } from "../lib/validation.js";

export const productsRouter = Router();
const productFields = {
  id: true,
  image: true,
  model: true,
  name: true,
  price: true,
  rating: true,
  reviews: true,
  userReviews: true,
  vehicles: true,
  destaque: true,
  ativo: true,
  createdAt: true,
};
const output = (p) => ({ ...p, price: Number(p.price) });

productsRouter.get("/", async (req, res) => {
  const query = z
    .object({
      destaque: z.enum(["true", "false"]).optional(),
      search: z.string().trim().max(100).optional(),
    })
    .parse(req.query);
  const where = { ativo: true };
  if (query.destaque === "true") where.destaque = true;
  const produtos = await prisma.produto.findMany({
    where,
    orderBy: [{ destaque: "desc" }, { createdAt: "desc" }],
    select: productFields,
  });
  const termo = query.search?.toLocaleLowerCase("pt-BR");
  const filtrados = termo
    ? produtos.filter((produto) =>
        [produto.name, produto.model, ...produto.vehicles].some((texto) =>
          texto.toLocaleLowerCase("pt-BR").includes(termo),
        ),
      )
    : produtos;
  res.json(filtrados.map(output));
});
productsRouter.get("/:id", async (req, res) => {
  const { id } = z.object({ id: idSchema }).parse(req.params);
  const produto = await prisma.produto.findFirstOrThrow({
    where: { id, ativo: true },
    select: productFields,
  });
  res.json(output(produto));
});
productsRouter.post("/", autenticar, somenteAdmin, async (req, res) => {
  const dados = productSchema.parse(req.body);
  const produto = await prisma.produto.create({
    data: dados,
    select: productFields,
  });
  res.status(201).json(output(produto));
});
productsRouter.put("/:id", autenticar, somenteAdmin, async (req, res) => {
  const { id } = z.object({ id: idSchema }).parse(req.params);
  const dados = productSchema.parse(req.body);
  const produto = await prisma.produto.update({
    where: { id },
    data: dados,
    select: productFields,
  });
  res.json(output(produto));
});
productsRouter.delete("/:id", autenticar, somenteAdmin, async (req, res) => {
  const { id } = z.object({ id: idSchema }).parse(req.params);
  await prisma.produto.update({ where: { id }, data: { ativo: false } });
  res.status(204).end();
});
productsRouter.post(
  "/:id/reviews",
  autenticar,
  somenteCliente,
  async (req, res) => {
    const { id } = z.object({ id: idSchema }).parse(req.params);
    const data = z
      .object({
        rating: z.number().int().min(1).max(5),
        comment: z.string().trim().min(3).max(1000),
      })
      .strict()
      .parse(req.body);
    const cliente = await prisma.cliente.findUniqueOrThrow({
      where: { id: res.locals.usuario.id },
      select: { nome: true },
    });
    const review = {
      name: cliente.nome,
      rating: data.rating,
      comment: data.comment,
      date: new Date().toISOString(),
    };
    const produto = await prisma.$transaction(async (tx) => {
      const atual = await tx.produto.findFirstOrThrow({
        where: { id, ativo: true },
      });
      const reviews = Array.isArray(atual.userReviews) ? atual.userReviews : [];
      const novos = [...reviews, review];
      const media =
        novos.reduce((soma, item) => soma + Number(item.rating || 0), 0) /
        novos.length;
      return tx.produto.update({
        where: { id },
        data: {
          userReviews: novos,
          rating: media,
          reviews: (atual.reviews || 0) + 1,
        },
        select: productFields,
      });
    });
    res.status(201).json(output(produto));
  },
);
