# Conferência do trabalho #1

Referência: enunciado de Linguagens de Programação Emergentes, Prof. Edécio Fernando Iepsen, apresentações em 01/10/2026 e 08/10/2026.

| Item | Implementação | Situação |
|---|---|---|
| 1 | Catálogo obtido do banco, destaques e ordenação por avaliação | Implementado |
| 2 | Pesquisa por produto, modelo ou veículo e botão “Reexibir destaques” | Implementado |
| 3 | Pesquisa do carro consulta Gemini com produtos do catálogo e exibe sugestões, links, fonte e data | Consulta real ao Gemini validada; cache confirmado |
| 4 | Cadastro e login de clientes pelo backend, senha em hash | Implementado |
| 5 | “Manter conectado”, UUID em `clientId` no LocalStorage e restauração validada por `/auth/me` | Implementado |
| 6 | Rota `/produtos/:id`, detalhes públicos e avaliações somente para clientes autenticados | Implementado |
| 7 | `/minhas-avaliacoes`, avaliações do cliente e respostas da loja | Implementado |
| 8 | `/admin/login`, rotas protegidas e autorização no backend | Implementado |
| 9 | Dashboard com indicadores, gráficos de notas e avaliações por mês | Implementado |
| 10 | Listagem, cadastro, edição, exclusão e controle de destaque na administração | Implementado |
| 11 | Listagem de avaliações, filtro de pendentes, resposta/edição e exclusão | Implementado; e-mail não implementado, pois é uma alternativa no enunciado |
| 12 | Banco Supabase conectado; configuração Render e frontend Vercel | Banco pronto; frontend/backend ainda não publicados |

O modelo E-R das quatro tabelas de domínio está em [modelo-er.md](modelo-er.md) e em [modelo-er.svg](modelo-er.svg). A apresentação do modelo e as entregas parciais de aula dependem do aluno e não podem ser confirmadas pelo código.

## Validação

- `npm test`: mesmos fluxos executados em SQLite e PostgreSQL via PGlite, com bancos isolados.
- A integração de IA é testada com resposta controlada do provedor e também sem chave. Isso **não** representa uma consulta real à plataforma.
- `npm run lint` e `npm run build` verificam o código e a compilação.
- `npm audit` verifica dependências.
- Não houve verificação visual no navegador: o acesso ao endereço local foi negado pelo controle de Browser. Antes da apresentação, revisar desktop/mobile e realizar um fluxo completo na interface.
- O banco real do Supabase foi validado com `npm run db:check`: TLS com certificado oficial, cadastro/login, bloqueio de acesso administrativo para cliente, avaliação, resposta, dashboard e logout. Os dados temporários são revertidos.
- Frontend/backend publicados ainda precisam ser validados após configuração das contas de hospedagem.

## Roteiro para apresentação

1. Mostrar o modelo E-R e as quatro relações principais.
2. Abrir a loja como visitante, pesquisar um produto e reexibir os destaques.
3. Abrir os detalhes; mostrar que avaliar exige login.
4. Cadastrar um cliente, entrar com “Manter conectado” e mostrar seu UUID no LocalStorage.
5. Enviar uma avaliação e abrir “Minhas avaliações”.
6. Entrar como administrador, mostrar os gráficos e cadastrar/editar um produto destacado.
7. Responder à avaliação e mostrar a resposta na conta do cliente.
8. Com a chave configurada, mostrar as orientações geradas pelo Gemini na página principal.
9. Mostrar os links de frontend/backend publicados e o banco PostgreSQL.
