import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export function tratarErros(error, req, res, next) {
  void next;
  if (error instanceof ZodError) {
    return res.status(400).json({
      mensagem: "Confira os dados enviados.",
      erros: error.issues.map((issue) => ({
        campo: issue.path.join("."),
        mensagem: issue.message,
      })),
    });
  }
  if (error instanceof SyntaxError && "body" in error)
    return res.status(400).json({ mensagem: "JSON inválido." });
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002")
      return res.status(409).json({ mensagem: "E-mail já cadastrado." });
    if (error.code === "P2003")
      return res.status(409).json({
        mensagem: "Não é possível excluir um produto já vinculado a pedidos.",
      });
    if (error.code === "P2025")
      return res.status(404).json({ mensagem: "Registro não encontrado." });
  }
  console.error(
    "Falha ao processar requisição:",
    error instanceof Error ? error.name : "Erro desconhecido",
  );
  return res
    .status(500)
    .json({ mensagem: "Não foi possível concluir a operação." });
}
