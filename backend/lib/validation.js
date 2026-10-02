import { z } from "zod";

const shortText = (max) => z.string().trim().min(1).max(max);
export const idSchema = z.string().min(1).max(64);
export const emailSchema = z.string().trim().email().max(254).toLowerCase();
export const passwordSchema = z
  .string()
  .min(8)
  .max(72)
  .refine(
    (value) => Buffer.byteLength(value, "utf8") <= 72,
    "Senha muito longa.",
  );

export const productSchema = z
  .object({
    image: shortText(1000),
    model: shortText(100),
    name: shortText(160),
    price: z.coerce.number().finite().positive().max(999999.99),
    rating: z.number().finite().min(0).max(5).nullable().optional(),
    reviews: z.number().int().nonnegative().nullable().optional(),
    vehicles: z.array(z.string().trim().min(1).max(100)).max(100),
    destaque: z.boolean().optional(),
    ativo: z.boolean().optional(),
  })
  .strict();

export const statuses = [
  "PENDENTE",
  "CONFIRMADO",
  "EM_PREPARO",
  "ENVIADO",
  "CONCLUIDO",
  "CANCELADO",
];
export const orderStatusSchema = z.enum(statuses);
