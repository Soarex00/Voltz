import { GoogleGenAI } from "@google/genai";
import { Router } from "express";
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
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey)
    return res.status(503).json({
      mensagem:
        "Configure GEMINI_API_KEY no ambiente do servidor para ativar a recomendação por IA.",
    });
  const catalog = await prisma.produto.findMany({
    where: { ativo: true },
    select: { id: true, name: true, model: true, vehicles: true },
  });
  const ai = new GoogleGenAI({ apiKey });
  let parsed;
  try {
    const result = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
      contents: JSON.stringify({ veiculo: vehicle, catalogo: catalog }),
      config: {
        systemInstruction:
          "Você recomenda baterias apenas com base no catálogo fornecido. Compare o veículo informado com a lista vehicles dos produtos e escolha somente IDs existentes. Na mensagem, explique de forma breve e específica quais dados do veículo coincidiram com o cadastro escolhido; não responda apenas que encontrou uma bateria. Nunca invente produto, capacidade, CCA, medidas ou compatibilidade que não estejam no catálogo. Se não houver correspondência segura, retorne lista vazia e explique em português que o cliente deve consultar o manual ou especialista. Recomendação é orientativa.",
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            productIds: { type: "ARRAY", items: { type: "STRING" } },
            mensagem: { type: "STRING" },
          },
          required: ["productIds", "mensagem"],
          propertyOrdering: ["productIds", "mensagem"],
        },
        temperature: 0.1,
        maxOutputTokens: 180,
      },
    });
    parsed = z
      .object({
        productIds: z.array(z.string()),
        mensagem: z.string(),
      })
      .parse(JSON.parse(result.text || ""));
  } catch (error) {
    const status = Number(error?.status || error?.code);
    if (status === 429)
      return res.status(429).json({
        mensagem:
          "A cota gratuita da recomendação por IA foi atingida. Tente novamente mais tarde.",
      });
    console.error("Falha ao consultar Gemini:", status || "sem status");
    return res.status(502).json({
      mensagem: "A recomendação por IA está indisponível no momento.",
    });
  }
  const allowedIds = new Set(catalog.map((p) => p.id));
  const ids = [...new Set(parsed.productIds)].filter((id) =>
    allowedIds.has(id),
  );
  const produtos = await prisma.produto.findMany({
    where: { id: { in: ids }, ativo: true },
    orderBy: { price: "asc" },
  });
  res.json({
    fonte: "Gemini",
    mensagem: parsed.mensagem,
    aviso:
      "Compatibilidade orientativa: confirme a especificação no manual do veículo.",
    produtos: produtos.map((p) => ({ ...p, price: Number(p.price) })),
  });
});
