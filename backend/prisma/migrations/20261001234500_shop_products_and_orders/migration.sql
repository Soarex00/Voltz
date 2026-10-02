-- O catálogo antigo era de modalidades de entrega. Pedidos antigos não podem
-- ser convertidos em compras de produto sem inventar informação do cliente.
DO $$
DECLARE pedidos_antigos BIGINT;
BEGIN
  SELECT COUNT(*) INTO pedidos_antigos FROM "solicitacoes_entrega";
  IF pedidos_antigos > 0 THEN
    RAISE EXCEPTION 'A migration não pode descartar solicitações existentes. Faça backup e exporte-as antes de converter o catálogo.';
  END IF;
END $$;

DROP TABLE "solicitacoes_entrega";

DROP TABLE "servicos_entrega";

ALTER TABLE "clientes"
ADD COLUMN "data_nascimento" TIMESTAMP(3),
ADD COLUMN "endereco" TEXT,
ADD COLUMN "cidade" TEXT,
ADD COLUMN "estado" TEXT;

CREATE TABLE "produtos" (
  "id" TEXT NOT NULL,
  "image" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "price" DECIMAL(10, 2) NOT NULL,
  "rating" DOUBLE PRECISION,
  "reviews" INTEGER,
  "user_reviews" JSONB NOT NULL DEFAULT '[]',
  "vehicles" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "destaque" BOOLEAN NOT NULL DEFAULT false,
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "pedidos" (
  "id" TEXT NOT NULL,
  "cliente_id" TEXT NOT NULL,
  "produto_id" TEXT NOT NULL,
  "admin_id" TEXT,
  "veiculo" TEXT NOT NULL,
  "endereco" TEXT NOT NULL,
  "quantidade" INTEGER NOT NULL DEFAULT 1,
  "valor_unitario" DECIMAL(10, 2) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDENTE',
  "resposta_admin" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "pedidos_cliente_id_created_at_idx" ON "pedidos" ("cliente_id", "created_at");

CREATE INDEX "pedidos_status_idx" ON "pedidos" ("status");

ALTER TABLE "pedidos"
ADD CONSTRAINT "pedidos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "pedidos"
ADD CONSTRAINT "pedidos_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "pedidos"
ADD CONSTRAINT "pedidos_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
