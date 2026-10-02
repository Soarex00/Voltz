import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { openDatabase } from '../db.js';
import { createApp } from '../app.js';
import { hashPassword, hashToken } from '../security.js';
import { postgresSchemaSQL } from '../postgres-schema.js';

let db, server, base, adminToken, clientToken, clientId, productId, interactionId;
before(async () => {
  // Tests always use an isolated database, never the local app or a cloud database.
  delete process.env.DATABASE_URL; process.env.NODE_ENV = 'test'; process.env.SQLITE_PATH = ':memory:';
  if (process.env.TEST_DATABASE_ENGINE === 'postgres') {
    const { PGlite } = await import('@electric-sql/pglite');
    const postgres = new PGlite();
    await postgres.exec(await postgresSchemaSQL());
    await postgres.exec('SET search_path TO voltz, pg_catalog');
    db = { query: async (sql, values = []) => (await postgres.query(sql, values)).rows, close: () => postgres.close() };
  } else db = await openDatabase();
  await db.query('INSERT INTO admins (id,nome,email,password_hash,created_at) VALUES ($1,$2,$3,$4,$5)', [randomUUID(),'Admin teste','admin@test.local',await hashPassword('SenhaAdmin123!'),new Date().toISOString()]);
  server = createApp(db, { aiKey: '' }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => { await new Promise(resolve => server.close(resolve)); await db.close(); });
async function request(route, { method = 'GET', token, body } = {}) {
  const res = await fetch(base + route, { method, headers: { ...(body ? {'Content-Type':'application/json'} : {}), ...(token ? { Authorization:`Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  return { status: res.status, data: res.status === 204 ? null : await res.json() };
}
const productBody = { name:'Bateria de teste',model:'T60',image:'/bateria.jpg',price:400,vehicles:['Onix','A3','1515'],description:'Teste integrado',destaque:true };

test('cadastro cria UUID, protege a senha e recusa duplicidade ou senha fraca', async () => {
  const weak = await request('/auth/register', { method:'POST', body:{nome:'Cliente',email:'c@test.local',senha:'123'} }); assert.equal(weak.status,400);
  const result = await request('/auth/register', { method:'POST',body:{nome:'Cliente teste',email:'CLIENTE@test.local',senha:'SenhaCliente123!',isAdmin:true} });
  assert.equal(result.status,201); assert.match(result.data.id,/^[\da-f]{8}(-[\da-f]{4}){3}-[\da-f]{12}$/i); clientId = result.data.id;
  const row = (await db.query('SELECT * FROM clients WHERE id=$1',[clientId]))[0]; assert.notEqual(row.password_hash,'SenhaCliente123!'); assert.equal(result.data.password_hash,undefined);
  assert.equal((await request('/auth/register',{method:'POST',body:{nome:'Outro',email:'cliente@test.local',senha:'SenhaCliente123!'}})).status,409);
});
test('login e restauração de sessão; cliente não consegue virar administrador', async () => {
  assert.equal((await request('/auth/login',{method:'POST',body:{email:'cliente@test.local',senha:'errada'}})).status,401);
  const client = await request('/auth/login',{method:'POST',body:{email:'cliente@test.local',senha:'SenhaCliente123!',remember:true}});
  assert.equal(client.status,200); assert.equal(client.data.user.isAdmin,false); assert.equal(client.data.user.senha,undefined); clientToken = client.data.token;
  assert.equal((await request('/auth/me',{token:clientToken})).data.id,clientId);
  assert.equal((await request('/auth/login',{method:'POST',body:{email:'cliente@test.local',senha:'SenhaCliente123!',role:'admin'}})).status,401);
  const admin = await request('/auth/login',{method:'POST',body:{email:'admin@test.local',senha:'SenhaAdmin123!',role:'admin'}}); assert.equal(admin.status,200); adminToken = admin.data.token;
});
test('cadastro de produtos exige admin e valida os dados; pesquisa e destaques funcionam', async () => {
  assert.equal((await request('/products',{method:'POST',body:productBody})).status,401);
  assert.equal((await request('/products',{method:'POST',token:clientToken,body:productBody})).status,403);
  assert.equal((await request('/products',{method:'POST',token:adminToken,body:{...productBody,price:-1}})).status,400);
  assert.equal((await request('/products',{method:'POST',token:adminToken,body:{...productBody,image:'javascript:alert(1)'}})).status,400);
  const created = await request('/products',{method:'POST',token:adminToken,body:productBody}); assert.equal(created.status,201); productId = created.data.id;
  assert.equal((await request('/products?q=onix')).data.length,1); assert.equal((await request('/products?q=nao-existe')).data.length,0);
  assert.equal((await request('/products?destaque=true')).data.length,1);
  assert.equal((await request(`/products/${productId}`)).data.name,productBody.name);
});
test('avaliação vinculada ao cliente autenticado; visitante e admin não avaliam', async () => {
  const body = { rating:5,comment:'Excelente produto',client_id:randomUUID() };
  assert.equal((await request(`/products/${productId}/interactions`,{method:'POST',body})).status,401);
  assert.equal((await request(`/products/${productId}/interactions`,{method:'POST',token:adminToken,body})).status,403);
  assert.equal((await request(`/products/${productId}/interactions`,{method:'POST',token:clientToken,body:{...body,rating:6}})).status,400);
  const created = await request(`/products/${productId}/interactions`,{method:'POST',token:clientToken,body}); assert.equal(created.status,201); interactionId = created.data.id;
  const row = (await db.query('SELECT * FROM interactions WHERE id=$1',[interactionId]))[0]; assert.equal(row.client_id,clientId);
  const product = await request(`/products/${productId}`); assert.equal(product.data.rating,5); assert.equal(product.data.reviews,1);
  const publicReviews = await request(`/products/${productId}/interactions`); assert.equal(publicReviews.data[0].client_id,undefined);
});
test('admin responde; cliente visualiza apenas suas avaliações e respostas', async () => {
  assert.equal((await request(`/admin/interactions/${interactionId}/reply`,{method:'PUT',token:clientToken,body:{reply:'Tentativa indevida'}})).status,403);
  assert.equal((await request(`/admin/interactions/${interactionId}/reply`,{method:'PUT',token:adminToken,body:{reply:'Obrigado pela avaliação!'}})).status,200);
  const mine = await request('/interactions/mine',{token:clientToken}); assert.equal(mine.data.length,1); assert.equal(mine.data[0].reply,'Obrigado pela avaliação!');
  await request('/auth/register',{method:'POST',body:{nome:'Outro cliente',email:'outro@test.local',senha:'SenhaOutro123!'}});
  const other = await request('/auth/login',{method:'POST',body:{email:'outro@test.local',senha:'SenhaOutro123!'}});
  assert.equal((await request('/interactions/mine',{token:other.data.token})).data.length,0);
  assert.equal((await request('/admin/interactions',{token:clientToken})).status,403);
});
test('dashboard agrega dados reais; editar produto atualiza destaques e preço', async () => {
  assert.equal((await request('/admin/dashboard',{token:clientToken})).status,403);
  const dashboard = await request('/admin/dashboard',{token:adminToken}); assert.equal(dashboard.data.products,1); assert.equal(dashboard.data.interactions,1); assert.equal(dashboard.data.pending,0); assert.equal(dashboard.data.average,5); assert.equal(dashboard.data.ratings[0].total,1);
  assert.equal((await request(`/products/${productId}`,{method:'PUT',token:adminToken,body:{...productBody,price:420,destaque:false}})).status,200);
  assert.equal((await request('/products?destaque=true')).data.length,0); assert.equal((await request(`/products/${productId}`)).data.price,420);
});
test('IA sem credenciais não inventa uma resposta', async () => {
  const response = await request('/ai/advice?vehicle=Onix'); assert.equal(response.status,503); assert.equal(response.data.code,'AI_NOT_CONFIGURED'); assert.equal(response.data.generatedByAI,undefined);
});
test('integração de IA envia chamada ao provedor e identifica fonte; teste usa resposta simulada', async () => {
  let calls = 0;
  const aiServer = createApp(db,{ aiKey:'chave-de-teste', fetch:async (url, options) => {
    calls++; assert.match(url,/^https:\/\/generativelanguage\.googleapis\.com\/v1beta\/models\/gemini-[a-zA-Z0-9.-]+:generateContent$/); assert.equal(options.headers['x-goog-api-key'],'chave-de-teste'); assert.equal(options.method,'POST');
    const body = JSON.parse(options.body); assert.equal(body.generationConfig.maxOutputTokens,1600); assert.ok(body.systemInstruction.parts[0].text); assert.ok(body.contents[0].parts[0].text);
    const context = JSON.parse(body.contents[0].parts[0].text);
    assert.equal(context.carroPesquisado, calls === 1 ? 'Onix' : 'Carro inexistente 2024');
    assert.equal(context.bateriasCadastradas.length, 1); assert.equal(body.generationConfig.responseMimeType, 'application/json');
    if (calls === 1) assert.equal(context.bateriasCadastradas[0].id, productId);
    return { ok:true,json:async () => ({ candidates:[{finishReason:'STOP',content:{parts:[{thought:true,text:'Pensamento interno'},{text:JSON.stringify({text:'Consulte o manual e um profissional.',productIds:calls === 1 ? [productId] : []})}]}}] }) };
  } }).listen(0,'127.0.0.1');
  await new Promise(resolve => aiServer.once('listening',resolve));
  try {
    const url = `http://127.0.0.1:${aiServer.address().port}/ai/advice?vehicle=Onix`;
    const data = await (await fetch(url)).json(); assert.equal(data.generatedByAI,true); assert.equal(data.source,'Gemini'); assert.equal(data.text,'Consulte o manual e um profissional.');
    await fetch(url); assert.equal(calls,1);
    assert.equal(data.vehicle, 'Onix'); assert.equal(data.products[0].id, productId);
    const other = await (await fetch(url.replace('Onix', 'Carro%20inexistente%202024'))).json();
    assert.equal(other.products.length, 0); assert.equal(calls,2);
    assert.equal((await fetch(url.split('?')[0])).status,400);
  } finally { await new Promise(resolve => aiServer.close(resolve)); }
});
test('IA não publica nem armazena respostas incompletas ou erros; permite nova tentativa', async () => {
  for (const first of [{ok:false,json:async()=>({error:{message:'Segredo do provedor'}})}, {ok:true,json:async()=>({candidates:[{finishReason:'MAX_TOKENS',content:{parts:[{text:'Texto parcial'}]}}]})}, {ok:true,json:async()=>({candidates:[{finishReason:'STOP',content:{parts:[]}}]})}, {ok:true,json:async()=>({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({text:'Produto inexistente',productIds:['id-inventado']})}]}}]})}, {ok:true,json:async()=>({candidates:[{finishReason:'STOP',content:{parts:[{text:'JSON invalido'}]}}]})}]) {
    let calls = 0;
    const aiServer = createApp(db,{aiKey:'chave-de-teste',fetch:async()=> ++calls === 1 ? first : {ok:true,json:async()=>({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({text:'Orientação completa.',productIds:[]})}]}}]})}}).listen(0,'127.0.0.1');
    await new Promise(resolve => aiServer.once('listening',resolve));
    try {
      const url = `http://127.0.0.1:${aiServer.address().port}/ai/advice?vehicle=Onix`;
      const failed = await fetch(url); assert.equal(failed.status,502); assert.ok(!(await failed.text()).includes('Segredo do provedor'));
      const success = await fetch(url); assert.equal(success.status,200); assert.equal((await success.json()).text,'Orientação completa.');
    } finally { await new Promise(resolve => aiServer.close(resolve)); }
  }
});
test('exclusão em cascata e logout invalidam dados e sessões', async () => {
  assert.equal((await request(`/products/${productId}`,{method:'DELETE',token:clientToken})).status,403);
  assert.equal((await request(`/products/${productId}`,{method:'DELETE',token:adminToken})).status,204);
  assert.equal((await request('/interactions/mine',{token:clientToken})).data.length,0);
  assert.equal((await request(`/products/${productId}`)).status,404);
  assert.equal((await request('/auth/logout',{method:'POST',token:clientToken})).status,204);
  assert.equal((await request('/auth/me',{token:clientToken})).status,401);
  await db.query('UPDATE sessions SET expires_at=$1 WHERE token_hash=$2',['2000-01-01T00:00:00.000Z',hashToken(adminToken)]);
  assert.equal((await request('/auth/me',{token:adminToken})).status,401);
});
