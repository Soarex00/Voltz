-- CreateTable
CREATE TABLE "solicitacoes_entrega" (
  "id" TEXT NOT NULL,
  "cliente_id" TEXT NOT NULL,
  "servico_entrega_id" TEXT NOT NULL,
  "admin_id" TEXT,
  "bateria" TEXT NOT NULL,
  "endereco_entrega" TEXT NOT NULL,
  "data_solicitada" TIMESTAMP(3) NOT NULL,
  "observacao" TEXT,
  "status" TEXT NOT NULL,
  "resposta_admin" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "solicitacoes_entrega_pkey" PRIMARY KEY ("id")
);
