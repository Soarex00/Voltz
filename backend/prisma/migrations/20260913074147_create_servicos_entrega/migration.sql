-- CreateTable
CREATE TABLE "servicos_entrega" (
  "id" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "descricao" TEXT NOT NULL,
  "preco_base" DECIMAL(65, 30) NOT NULL,
  "prazo_estimado" TEXT NOT NULL,
  "imagem" TEXT,
  "destaque" BOOLEAN NOT NULL DEFAULT false,
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "servicos_entrega_pkey" PRIMARY KEY ("id")
);
