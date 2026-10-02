# Voltz — loja de baterias

Aplicação acadêmica full stack com React/Vite, backend Express e banco relacional. Clientes pesquisam produtos, consultam detalhes, avaliam e acompanham respostas. Administradores gerenciam produtos, destaques, avaliações e dashboard.

## Rodar localmente

Requer Node.js **22.13 ou superior**. Neste computador, Node.js e dependências já estão instalados.

```bash
npm ci
npm run dev:all
```

- Loja: http://localhost:5173
- Login administrativo: http://localhost:5173/admin/login
- API: http://localhost:3001/health

Também é possível usar dois terminais: `npm run api` e `npm run dev`.

Em uma instalação sem `DATABASE_URL`, o banco SQLite é criado em `data/voltz.sqlite`. Na primeira execução de um banco vazio, importa produtos, clientes e avaliações do `db.json`, atribui UUIDs e cria as relações. O `db.json` serve apenas como dados iniciais; as alterações do app são persistidas no banco. As senhas do arquivo inicial estão em hash, mantendo as credenciais anteriores dos clientes. Neste workspace, os dados já foram migrados para o Supabase. Não existe mais JSON Server.

O administrador local recebe uma senha aleatória. Abra **`data/admin-access.txt`** para consultar e-mail e senha. O arquivo e o banco são ignorados pelo Git. Para escolher as credenciais antes da primeira inicialização de um banco vazio, use `ADMIN_EMAIL` e `ADMIN_PASSWORD` no `.env`.

## Configuração

O arquivo `.env.example` documenta as variáveis. Neste workspace, `.env` já foi criado sem credenciais externas. Em outra máquina, copie `.env.example` para `.env`. Reinicie os servidores depois de alterar variáveis.

### Inteligência artificial

Configure no **backend**:

```dotenv
GEMINI_API_KEY=sua-chave
GEMINI_MODEL=gemini-3.1-flash-lite
```

Ao enviar a pesquisa do carro, a página inicial chama `/ai/advice?vehicle=MODELO_DO_CARRO`; o servidor realiza uma consulta real ao Gemini e devolve sugestões escolhidas pela IA a partir do catálogo completo, links dos produtos, fonte, modelo e data. Ano, motorização e start-stop ajudam a orientar a confirmação técnica; o cadastro não certifica compatibilidade. A resposta fica em cache por seis horas em memória, por pesquisa e conteúdo do catálogo. Durante a pesquisa, somente os produtos selecionados pela IA aparecem; não há filtro automático por veículo nem resultados locais de reserva em caso de falha da IA. Os IDs retornados são validados contra o catálogo. Sem chave, o app exibe indisponibilidade e nunca apresenta um texto fixo como se tivesse sido gerado por IA. A chave não é enviada ao frontend.

O filtro de compatibilidade usa os veículos cadastrados no catálogo. As orientações de IA são gerais e não inventam compatibilidade de produtos.

Crie uma chave no [Google AI Studio](https://aistudio.google.com/apikey) e mantenha o projeto no plano gratuito, sem ativar faturamento. O Gemini oferece uma cota gratuita com limites; o cache reduz as consultas. A gratuidade depende do plano do projeto Google vinculado à chave, não de uma configuração do app.

Referência da integração: [API generateContent do Gemini](https://ai.google.dev/api/generate-content) e [planos e preços](https://ai.google.dev/gemini-api/docs/pricing). Consulta real validada com gemini-3.1-flash-lite e cache confirmado.

### WhatsApp

O checkout existente continua como contato para compra. Para ativar o botão, configure `VITE_WHATSAPP_NUMBER` com país e DDD, somente dígitos. Sem essa variável, o app informa que o contato não está disponível. Não há processamento de pagamento ou confirmação de pedido no servidor; esses recursos não fazem parte dos requisitos do trabalho.

## Funcionalidades implementadas

- Catálogo com pesquisa por nome, modelo e veículo, destaques e melhor avaliação.
- Detalhes de produtos e avaliações públicas.
- Cadastro de clientes e login com senha scrypt; UUID e sessão persistente com “Manter conectado”.
- Verificação da sessão no backend; tokens expiram e são revogados ao sair.
- Avaliações com nota e comentário, vinculadas ao cliente e produto por chaves estrangeiras.
- Página “Minhas avaliações” com as respostas dos administradores.
- Login administrativo separado e operações protegidas no backend.
- Dashboard com indicadores, gráficos de notas e avaliações mensais, e melhores produtos.
- Cadastro, edição, exclusão e destaque de produtos.
- Gerenciamento das avaliações, filtro de pendentes e respostas.
- Carrinho e favoritos separados pelo UUID da conta neste navegador.
- Integração de IA preparada e configurações de deploy.

## Banco e modelo E-R

As quatro tabelas principais são `admins`, `clients`, `products` e `interactions`. A tabela auxiliar `sessions` guarda hashes dos tokens e datas de expiração. Não são expostas senhas, hashes ou listagens públicas de contas.

- [Modelo E-R e relações](docs/modelo-er.md)
- [Diagrama pronto para apresentação](docs/modelo-er.svg)
- [Esquema SQL executável](server/schema.sql)
- [Conferência dos 12 requisitos e roteiro](docs/requisitos.md)

Neste workspace, `DATABASE_URL` já está configurada e o banco usado é o **Supabase**, projeto **Voltz**. As contas, os 11 produtos e as avaliações do SQLite foram importados preservando os UUIDs. O arquivo local continua como cópia anterior; novas alterações são gravadas no Supabase.

Sem `DATABASE_URL`, o app usa SQLite. Com a variável, usa PostgreSQL no schema privado `voltz`, com RLS e acesso das roles `anon` e `authenticated` revogado. A autorização dos clientes é realizada pelo backend Express; o frontend não acessa diretamente a Data API e não precisa da chave secreta do Supabase. A conexão usa Session pooler (5432), pool de até cinco conexões e o certificado oficial em `server/certs/supabase-ca.crt`, com validação TLS e de hostname habilitada.

Em um banco vazio de produção, configure `DATABASE_URL`, `ADMIN_EMAIL` e `ADMIN_PASSWORD` para a primeira inicialização. O banco atual já tem o administrador importado, com as credenciais de `data/admin-access.txt`; alterar essas variáveis não redefine uma conta existente.

Para preparar outra instalação, copie a URL em **Supabase > Connect > Session pooler**, substitua o campo da senha (codificando caracteres reservados) e configure `DATABASE_URL` apenas no backend. [Guia oficial de conexão](https://supabase.com/docs/guides/database/connecting-to-postgres).

```bash
# Importar uma cópia SQLite em um banco remoto vazio; não sobrescreve dados existentes.
npm run db:import-local
# Validar conexão, certificado, autenticação e fluxo de avaliações no banco conectado.
# Os registros temporários do teste são revertidos por uma transação.
npm run db:check
```

O schema é criado por `server/postgres-schema.js`. A ausência de políticas públicas de RLS é intencional: estas tabelas não fazem parte da Data API. O advisor pode informar “RLS Enabled No Policy”; não se deve criar políticas públicas apenas para remover esse aviso. [Explicação do advisor](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).

## Publicar

O banco já está no Supabase e foi validado pelo backend. O frontend e o backend ainda não foram publicados.

1. Disponibilize este projeto em um repositório Git acessível às plataformas de hospedagem. Não envie `.env`, `data/` ou credenciais.
2. Use o projeto **Voltz** já configurado no Supabase. Copie a conexão em **Connect > Session pooler** na porta **5432**, preencha a senha do banco e configure `DATABASE_URL` na Render. O host deve ser o informado pelo painel, sem deduzir a partir da região. Não use a chave API como senha do PostgreSQL.
3. Na Render, importe `render.yaml` como Blueprint ou crie um serviço Node com build `npm ci`, início `npm start` e health check `/health`.
4. Configure na Render `DATABASE_URL`, `FRONTEND_URL` (URL exata do frontend HTTPS), `ADMIN_EMAIL`, `ADMIN_PASSWORD` (mínimo 10 caracteres), `GEMINI_API_KEY` e `GEMINI_MODEL`. `NODE_ENV=production` já está no Blueprint. A API cria o esquema e importa os dados iniciais na primeira execução.
5. Na Vercel, importe o projeto como Vite, configure `VITE_API_URL=https://SEU-BACKEND.onrender.com` **sem `/api` no final** e, se necessário, `VITE_WHATSAPP_NUMBER`. `vercel.json` configura o build e as rotas do React.
6. Atualize `FRONTEND_URL` no backend com a URL definitiva da Vercel e reinicie/republique os serviços após mudanças de variáveis.
7. Valide o cadastro, login persistente, avaliação, resposta administrativa, gráficos e consulta real de IA nos links públicos.

Referências: [Blueprints da Render](https://render.com/docs/blueprint-spec), [Vite na Vercel](https://vercel.com/docs/frameworks/frontend/vite), [variáveis do Vite](https://vite.dev/guide/env-and-mode).

## Verificações

```bash
npm test
npm run lint
npm run build
npm audit
```

Os testes cobrem cadastro, UUID, senhas em hash, login, autorização, CRUD de produtos, pesquisa/destaques, avaliações, resposta, isolamento entre clientes, dashboard, exclusão em cascata, logout e expiração. A suíte executa em SQLite e em PostgreSQL via [PGlite](https://pglite.dev/docs/about), sem depender de uma conta na nuvem. O teste de integração de IA usa uma resposta controlada; não valida uma chamada real nem quota da conta.

A revisão visual no navegador não foi realizada porque o controle de Browser negou acesso ao endereço local. A compilação e os testes de backend passaram. A conexão real ao Supabase, incluindo certificado, cadastro/login, avaliação/resposta, dashboard e logout, foi verificada por `npm run db:check`. Antes de apresentar, conferir as telas em desktop/mobile e repetir o roteiro da interface.

## O que depende do aluno

- A consulta real ao Gemini foi validada no ambiente local; configurar GEMINI_API_KEY no servidor publicado.
- Conectar repositório e contas da Render/Vercel e publicar frontend/backend para concluir o requisito 12. O banco Supabase já está conectado; configure na Render as variáveis que estão apenas no `.env` local.
- Informar o número WhatsApp caso queira usar o checkout.
- Apresentar o modelo E-R e comprovar as entregas parciais de aula.

Projeto fictício para fins educacionais.
