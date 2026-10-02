-- CreateTable
CREATE TABLE "admins" (
  "id" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "senha" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins" ("email");

-- AddForeignKey
ALTER TABLE "solicitacoes_entrega"
ADD CONSTRAINT "solicitacoes_entrega_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes_entrega"
ADD CONSTRAINT "solicitacoes_entrega_servico_entrega_id_fkey" FOREIGN KEY ("servico_entrega_id") REFERENCES "servicos_entrega" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes_entrega"
ADD CONSTRAINT "solicitacoes_entrega_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
