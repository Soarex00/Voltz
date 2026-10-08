# Voltz Store — sistema acadêmico Full Stack

A loja Voltz existente foi conectada a uma API Express, Prisma 7 e PostgreSQL. O sistema mantém as baterias, imagens e recomendações de veículo que já existiam no catálogo. Login usa senha com hash bcrypt e token JWT; clientes registram pedidos e veem respostas, e administradores gerenciam produtos e pedidos.

## Rodar localmente

1. Copie `.env.example` para `.env` e configure `DATABASE_URL`, `JWT_SECRET` (32+ caracteres) e as credenciais do administrador. Para habilitar recomendação por IA, configure `GEMINI_API_KEY`; a integração usa o Gemini 3.1 Flash-Lite e depende dos limites da cota gratuita disponível na sua conta Google AI Studio.
2. Instale dependências: `npm ci`.
3. Aplique migrations: `npm run db:deploy`.
4. Importe os produtos Voltz: `npm run db:seed`.
5. Crie/atualize o administrador: `npm run admin:create`.
6. Inicie frontend e API: `npm run dev:all`. O site abre no Vite; a API usa a porta 3333.

O primeiro deploy usa a base PostgreSQL existente do projeto acadêmico e mantém clientes/admins; a migration remove somente as tabelas antigas de solicitações e serviços (as solicitações antigas são verificadas antes) e passa a usar produtos e pedidos. O seed ignora contas fictícias antigas de `db.json`, que tinham senhas sem hash.

## Rotas principais para apresentar

| Método | Rota                                                        | O que demonstrar                                       |
| ------ | ----------------------------------------------------------- | ------------------------------------------------------ |
| GET    | `/health`                                                   | API ligada                                             |
| GET    | `/health/database`                                          | API consultando PostgreSQL                             |
| POST   | `/auth/register`                                            | Cadastro e hash de senha                               |
| POST   | `/auth/login`                                               | Login cliente/admin e JWT                              |
| GET    | `/auth/me`                                                  | Conta autenticada pelo Bearer token                    |
| GET    | `/products`                                                 | Catálogo (opcional `?destaque=true` ou `?search=onix`) |
| GET    | `/products/:id`                                             | Detalhe de bateria                                     |
| POST   | `/products`                                                 | Cadastrar bateria (admin)                              |
| PUT    | `/products/:id`                                             | Editar bateria (admin)                                 |
| DELETE | `/products/:id`                                             | Desativação lógica de bateria (admin)                  |
| POST   | `/products/:id/reviews`                                     | Avaliação de cliente autenticado                       |
| GET    | `/recommendations/products?vehicle=Chevrolet%20Onix%202020` | Recomendação da IA, limitada ao catálogo da loja       |
| POST   | `/orders`                                                   | Criar pedidos do cliente com preço registrado          |
| GET    | `/orders`                                                   | Histórico do próprio cliente e respostas               |
| PATCH  | `/orders/:id/cancel`                                        | Cancelar pedido pendente                               |
| GET    | `/admin/dashboard`                                          | Contagens para o dashboard (admin)                     |
| GET    | `/admin/orders`                                             | Ver pedidos dos clientes (admin)                       |
| PATCH  | `/admin/orders/:id`                                         | Atualizar status e responder (admin)                   |
| DELETE | `/admin/orders/:id`                                         | Excluir pedido (admin)                                 |

Rotas marcadas admin exigem JWT de administrador. `/orders` exige JWT do cliente. O browser envia o cabeçalho `Authorization: Bearer <token>` depois do login.

## Roteiro rápido de apresentação

1. Abra a home: mostre catálogo e filtro “Em destaque”.
2. Pesquise um carro na área de IA e mostre os produtos retornados. Explique que a API envia ao Gemini somente o modelo informado e os produtos/veículos do catálogo; a resposta pode escolher apenas IDs existentes. A compatibilidade é orientativa.
3. Cadastre um cliente e entre. Adicione uma bateria ao carrinho; no checkout informe veículo e endereço. A API cria o pedido no PostgreSQL antes de abrir WhatsApp.
4. Abra “Meus pedidos” para mostrar o status e a resposta.
5. Entre com a conta admin configurada no `.env`; no painel mostre totais, edite/cadastre produto, responda e altere status do pedido.
6. Se o professor pedir CRUD, demonstre GET e POST/PUT/DELETE de `/products` e POST/GET/PATCH/DELETE de `/orders` no frontend ou no cliente HTTP autenticado.

## Publicação

`render.yaml` prepara um serviço Render que serve o build React e a API no mesmo domínio. Configure os segredos indicados pelo Render e use a mesma base PostgreSQL. Após publicar, aplique migrations e seed uma vez e execute `npm run admin:create` com os dados do administrador. A chave Gemini (`GEMINI_API_KEY`) deve ser cadastrada como segredo do serviço, nunca no frontend.
