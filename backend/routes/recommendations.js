import { Router } from "express";
import OpenAI from "openai";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

export const recommendationsRouter = Router();
const limit = rateLimit({
  windowMs: 60_000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
});
recommendationsRouter.get("/products", limit, async (req, res) => {
  const { vehicle } = z
    .object({ vehicle: z.string().trim().min(2).max(160) })
    .parse(req.query);
  if (!process.env.OPENAI_API_KEY)
    return res.status(503).json({
      mensagem:
        "Configure OPENAI_API_KEY no ambiente do servidor para ativar a recomendação por IA.",
    });
  const catalog = await prisma.produto.findMany({
    where: { ativo: true },
    select: { id: true, name: true, model: true, vehicles: true },
  });
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const result = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-6-luna",
    reasoning: { effort: "none" },
    max_output_tokens: 180,
    store: false,
    instructions:
      "Você recomenda baterias apenas com base no catálogo fornecido. Considere a correspondência do veículo com a lista vehicles. Nunca invente produto, capacidade ou compatibilidade. Se não houver correspondência segura, retorne lista vazia e explique em português que o cliente deve consultar o manual ou especialista. Recomendação é orientativa.",
    input: JSON.stringify({ veiculo: vehicle, catalogo: catalog }),
    text: {
      format: {
        type: "json_schema",
        name: "recomendacao_bateria",
        strict: true,
        schema: {
          type: "object",
          properties: {
            productIds: { type: "array", items: { type: "string" } },
            mensagem: { type: "string" },
          },
          required: ["productIds", "mensagem"],
          additionalProperties: false,
        },
      },
    },
  });
  const parsed = JSON.parse(result.output_text);
  const allowedIds = new Set(catalog.map((p) => p.id));
  const ids = [...new Set(parsed.productIds)].filter((id) =>
    allowedIds.has(id),
  );
  const produtos = await prisma.produto.findMany({
    where: { id: { in: ids }, ativo: true },
    orderBy: { price: "asc" },
  });
  res.json({
    fonte: "OpenAI",
    mensagem: parsed.mensagem,
    aviso:
      "Compatibilidade orientativa: confirme a especificação no manual do veículo.",
    produtos: produtos.map((p) => ({ ...p, price: Number(p.price) })),
  });
});
